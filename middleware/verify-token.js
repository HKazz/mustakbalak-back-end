const jwt = require("jsonwebtoken")
// This route checks the token in the request and verifies it for me
const verifyToken = (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(" ")[1]
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' })
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Add user info to request
        req.user = decoded
        
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' })
    }
}

module.exports = verifyToken