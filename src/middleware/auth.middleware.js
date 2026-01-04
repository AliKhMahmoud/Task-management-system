const User = require("../models/User");
const cookieService = require("../utils/cookieService");
const tokenService = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

// Authentication
const requireAuth = asyncHandler(async (req, res, next) => {
        // get token from request (access)
        const token = cookieService.getAccessToken(req); 
        
        if (!token) {
            res.status(401);
            throw new Error("Not authorized, no access token.")}

        // verify the token (age, valid)
        const decoded = tokenService.verifyAccessToken(token)        

        // decoded the token to get user details
        const user = await User.findById(decoded.id);

        if(!user) {
            res.status(401);
            throw new Error("User no longer exist")
        }

        // store date to use it next
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role
        }

        next();
})


const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user) {
            res.status(401);
            return next(new Error("Authentication Failed"));
        }

        if(!allowedRoles.includes(req.user.role)) {
            res.status(403); 
            return next(new Error("Forbidden: Invalid Role"));
        }

        next();
    }
}

module.exports = {
    requireAuth,
    authorize
}