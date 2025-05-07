const mongoose = require('mongoose');


const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required:[true,"Company Name is Required"],
        unique:true,
        lowercase:true,
        trim:true
    },
    companyDescription:{
        type:String,
        required:[true,"Company description is Required"]
    },
    country:{
        type:String,
        required:[true,"Company country is Required"]
    },
    size:{
        type:String,
        required:[true,"Company size must be specified"]
    },
    industry:{
        type:String,
        required:[true,"Choose the company's industry"]
    },
    openPositions:{
        type:Number,
        min:1,
        required:true
    },
    jobListings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobs'
    }],
})

const Company = mongoose.model("Company",companySchema)

module.exports = Company