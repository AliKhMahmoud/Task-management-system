const User = require("../models/User");
const passwordService = require("../utils/passwordUtils");
const { USER_ROLES } = require('../utils/constants');

class UserController {

    async addUserByManager(req, res) {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error("User already exists with this email");
        }

        const hashedPassword = await passwordService.hashPassword(password);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: USER_ROLES.MANAGER, 
        });

        res.status(201).json({
            success: true,
            message: "Team member added successfully",
            data: {
                id: newUser._id,
                name: newUser.name,
                role: newUser.role
            }
        });
    };

    async getAllUsers(req,res){

    }
    
    async findUserById(req,res){

    }
    
    async deleteUser(req,res){

    }

    async updateUser(req,res){

    }


}

module.exports = new UserController();