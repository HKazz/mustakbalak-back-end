const Company = require("../models/Company")
const User = require("../models/User")
const Jobs = require("../models/jobListing")
// const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")
const express = require("express")
const router = express.Router({ mergeParams: true }); // <--- This line is important


router.get('/', verifyToken, async (req,res) => {
    try {
        const company = await Company.findById(req.params.companyid).populate("jobListings")
        if(!company){
            return res.status(401).json({error:"Company not found"})
        }
        res.json(company.jobListings)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/:jobid', verifyToken, async(req, res) => {
    try {
        const foundJob = await Jobs.findById(req.params.jobid)
        if (!foundJob) {
            return res.status(404).json({error: "Job not found"})
        }
        res.json(foundJob)
    } catch (error) {
        console.error("Error fetching Job:", error)
        res.status(500).json({error: error.message})
    }
})

// router.get('/', verifyToken, async(req,res) => {
//     try {
//         const allJobs = await Jobs.find(req.params)
//         return res.status(201).json(allJobs)
//     } catch (error) {
//         console.error("Error fetching all Jobs:", error)
//         res.status(500).json({error: error.message})
//     }
// })

router.post("/", verifyToken, async (req, res) => {
    try {
        
        const currentUser = await User.findById(req.user_id);
        

        // if (!currentUser || currentUser.userType !== "hiring manager") {
        //     return res.status(401).json({ error: "only managers can create a company" });
        // }

        const {listingName, listingDescription, requirements, listingType, salary, benefits} = req.body;
        
        console.log(req.params)
        if(!listingName || !listingDescription){
            return res.status(400).json({ error: "job name and description are required" });
        }

        const jobData = {
            listingName, 
            listingDescription, 
            requirements, 
            listingType, 
            salary, 
            benefits,
        };

        const foundCompany = await Company.findById(req.params.companyid);
        if (!foundCompany) {
            return res.status(404).json({ error: "Company not found" });
        }

        console.log(jobData)

        const newJob = await Jobs.create(jobData);
        foundCompany.jobListings.push(newJob._id);
        await foundCompany.save();
        

        return res.status(201).json(newJob);
    } catch (error) {
        console.error("Error in creating a job:", error);
        return res.status(500).json({ error: error.message });
    }
});


// router.get('/:jobid', verifyToken, async (req,res) => {
//     try {
//         const foundJob = await Jobs.findById(req.params.jobid)
//         return res.status(200).json(foundJob)
//     } catch (error) {
//         res.status(500).json(error)
//     }
// })

router.put('/:jobid', verifyToken, async(req,res) =>{
    try {
        // const currentUser = await User.findById(req.user_id);
        // if (!currentUser || currentUser.userType !== "hiring manager") {
        //     return res.status(401).json({ error: "only managers can create a company" });
        // }

        const foundJob = await Jobs.findById(req.params.companyid);
        
        const updatedJob = await Jobs.findByIdAndUpdate(req.params.jobid,req.body,{new:true})

        return res.status(201).json(updatedJob);
    } catch (error) {
        console.error("Error in POST /company:", error);
        return res.status(500).json({ error: error.message });
    }
})

router.delete('/:jobid', verifyToken, async(req,res)=>{
    try {
        const foundJob = await Jobs.findById(req.params.jobid)
        if(!foundJob){
            return res.status(404).json({message: "Job not found"})
        }
        await Jobs.findByIdAndDelete(req.params.jobid)
        return res.status(200).json({message: "Job deleted successfully."})
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router