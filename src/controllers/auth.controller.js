const User = require("../models/User");
const cookieService = require("../utils/cookieService");
const passwordService = require("../utils/passwordUtils");
const tokenService = require("../utils/generateToken");

class AuthController {

    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;

            const existEmail = await User.findOne({ email }).select("+password");
            if (!existEmail) {
                res.status(401);
                throw new Error("Invalid Credentials");
            }

            const verified = await passwordService.verifyPassword(password, existEmail.password);
            if (!verified) {
                res.status(401);
                throw new Error("Invalid Credentials");
            }

            const accessToken = tokenService.generateAccessToken({
                id: existEmail._id,
                email: existEmail.email,
                role: existEmail.role
            });

            const refreshToken = tokenService.generateRefreshToken({
                id: existEmail._id,
                email: existEmail.email,
                role: existEmail.role
            });

            cookieService.setAccessToken(res, accessToken);
            cookieService.setRefreshToken(res, refreshToken);

            return res.status(200).json({ message: "Logged in Successfully" });
        } catch (err) {
            next(err);
        }
    }

    logout = async (req, res, next) => {
        try {
            cookieService.clearTokens(res);
            return res.status(200).json({ message: "Logged Out Successfully" });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
