const User = require("../models/User");
const cookieService = require("../utils/cookieService");
const passwordService = require("../utils/passwordUtils");
const tokenService = require("../utils/generateToken");


class AuthController {
    
    login = async (req, res) => {

        const { email, password } = req.body

        const existEmail = await User.findOne({ email }).select("+password")
        if(!existEmail) {
            res.status(401); 
            throw new Error("Invalid Credentials");
        }

        // Password Verifing
        const verifed = await passwordService.verifyPassword(password, existEmail.password);

        if(!verifed) {

            res.status(401);
            throw new Error("Invalids Credentials");
        }


        // Generate tokens
        const accessToken = tokenService.genrateAccessToken({
            id: existEmail._id,
            email: existEmail.email,
            role: existEmail.role
        });
        
        const refreshToken = tokenService.genrateRefreshToken({
            id: existEmail._id,
            email: existEmail.email,
            role: existEmail.role
        })

        // Save on cookies
        cookieService.setAccessToken(res, accessToken);
        cookieService.setRefreshToken(res, refreshToken);

        // Activity Log
        res.logActivity({
        action: "AUTH_LOGIN",
        entityType: "User",
        entityId: existEmail._id,
        metadata: { email: existEmail.email, role: existEmail.role }
        });


        return res.status(200).json({ message: "Logged in Successfully" ,id : existEmail._id, role:existEmail.role });

    }

    async logout(req, res) {
            cookieService.clearTokens(res);

            return res.status(200).json({ message: "Logged Out Successfuly" });
    }

}

module.exports = new AuthController();