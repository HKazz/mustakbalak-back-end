const mongoose = require('mongoose');

const jobListingSchema = new mongoose.Schema({
    listingName: {
        type: String,
        required:[true,"job Name is Required"],
        unique:true,
        lowercase:true,
        trim:true
    },
    listingDescription:{
        type:String,
        required:[true,"job description is Required"]
    },
    requirements:{
        type:String,
        required:[true,"Enter the requirements for the job"]
    },
    listingType:{
        type:String,
        enum:["Part-Time" , "Full-Time" , "Training" , "Flex-Time"],
        default: "Part-Time",
        required:[true,"Enter the position type"]
    },
    salary:{
        type:String,
    },
    benefits:{
        type:String,
        
    }
})

const Jobs = mongoose.model("JobListing",jobListingSchema)

module.exports = Jobs