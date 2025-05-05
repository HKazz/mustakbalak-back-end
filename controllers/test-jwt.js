const router = require("express").Router()
const jwt = require("jsonwebtoken")
const verifyToken = require("../middleware/verify-token")


router.get("/checkout",verifyToken,(req,res)=>{

    res.json({message:"You are checked out"})
})

router.get("/sign-token",(req,res)=>{
    const user = {
        _id:1,
        name:"Loai"
    }

    // how to create a token
    const token = jwt.sign({user},process.env.JWT_SECRET,{expiresIn:"1h"})
    res.json({token:token})
})


router.post("/verify",(req,res)=>{
    try{
        console.log(req.headers.authorization.split(" ")[1])

        const token = req.headers.authorization.split(" ")[1]
    
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        res.json({decoded:decoded})
    
    }
    catch(err){
        res.json(err)
    }
})

module.exports = router