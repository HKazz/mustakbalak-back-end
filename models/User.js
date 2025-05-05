const {Schema, model} = require("mongoose")

const userSchema = new Schema({
    username: {
        type: String,
        required:[true,"Email is Required"],
        unique:true,
        lowercase:true,
        trim:true
    },
    hashedPassword:{
        type:String,
        required:[true,"Password is Required"]
    }
})

const User = model("User",userSchema)

module.exports = User