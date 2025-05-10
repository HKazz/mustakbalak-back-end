const Company = require("../models/Company")
const User = require("../models/User")
const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")

router.get('/', verifyToken, async (req,res) => {
    try {
        const allCompanies = await Company.find(req.params)
        return res.status(200).json(allCompanies)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.post("/", verifyToken, async (req, res) => {
    try {
        console.log("User ID from token:", req.user_id); // Debugging
        const currentUser = await User.findById(req.user_id);
        console.log("Current user:", currentUser); // Debugging

        // if (!currentUser || currentUser.userType !== "hiring manager") {
        //     return res.status(401).json({ error: "only managers can create a company" });
        // }

        const newCompany = new Company(req.body);
        await newCompany.save();

        return res.status(201).json(newCompany);
    } catch (error) {
        console.error("Error in POST /company:", error);
        return res.status(500).json({ error: error.message });
    }
});


router.get('/:companyid', verifyToken, async (req,res) => {
    try {
        const foundCompany = await Company.findById(req.params.companyid)
        return res.status(200).json(foundCompany)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.put('/:companyid', verifyToken, async(req,res) =>{
    try {
        // const currentUser = await User.findById(req.user_id);
        // if (!currentUser || currentUser.userType !== "hiring manager") {
        //     return res.status(401).json({ error: "only managers can create a company" });
        // }

        const foundCompany = await Company.findById(req.params.companyid);
        
        const updatedCompany = await Company.findByIdAndUpdate(req.params.companyid,req.body,{new:true})

        return res.status(201).json(updatedCompany);
    } catch (error) {
        console.error("Error in POST /company:", error);
        return res.status(500).json({ error: error.message });
    }
})

router.delete('/:companyid', verifyToken, async(req,res)=>{
    try {
        const foundCompany = await Company.findById(req.params.companyid)
        if(!foundCompany){
            return res.status(404).json({message: "Company not found"})
        }
        await Company.findByIdAndDelete(req.params.companyid)
        return res.status(200).json({message: "Company deleted successfully."})
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router