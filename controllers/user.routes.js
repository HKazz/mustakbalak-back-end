const User = require('../models/User')
const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")
const sendEmail = require('../sendEmail')



// router.post("/test-email",async (req,res)=>{
//     try{
//     sendEmail("hasan_kazerooni@outlook.com")
//     res.json("Email successfully sent")
//     }
//     catch(err){
//         console.log(err)
//     }


// })


router.get('/:user_id', verifyToken, async (req,res) => {
    try {
        const foundUser = await User.findById(req.params.user_id)
        return res.status(200).json({foundUser: foundUser})
    } catch (error) {
        res.status(500).json(error)
    }
})

router.put('/:user_id', verifyToken, async(req,res) =>{
    try {
        const foundUser = await User.findById(req.params.user_id)
        if(!foundUser){
            return res.status(404).json({err: 'User not found'})
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.user_id, req.body, {new:true})
        return res.status(200).json({updatedUser: updatedUser})
    }
     catch (error) {
        res.status(500).json(error)
    }
})

router.delete('/:user_id', verifyToken, async(req,res)=>{
    try {
        const foundUser = await User.findById(req.params.user_id)
        if(!foundUser){
            return res.status(404).json({message: "User not found"})
        }
        await User.findByIdAndDelete(req.params.user_id)
        return res.status(200).json({message: "User deleted successfully."})
    } catch (error) {
        res.status(500).json(error)
    }
})


module.exports = router