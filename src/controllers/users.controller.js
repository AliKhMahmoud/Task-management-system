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
        const page = +req.query.page||1;
        const users = await User.paginate({page,limit:2});
        if(!users){
            res.status(404);
            throw new Error("There is no users to show");
            }
        return res.status(200).json({
            success: true,
            data: users
        });
    }
    
    async findUserById(req,res){
        const {id} = req.params;
        const user = await User.findUserById(id);
        if(!user){
            res.status(404);
            throw new Error("User not found");
        }
        return res.status(200).json({
            suucess:true,
            data:user
        });
    }
    
    async deleteUser(req,res){
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        if(!user){
            res.status(404);
            throw new Error("User not found");
        }
        return res.status(201).json({
            success:true,
            message:"User deleted successfully",
        });
    }

    async updateUser(req,res){
        const {id} = req.params;
        const {name , role} = req.body;
        const user = await User.findById(id);
        if(!user){
            res.status(404);
            throw new Error("User not found");
        }
        user.name = name??user.name;
        user.role = role??user.role;
        await user.save();
        return res.status(201).json({
            success:true,
            message:"User updated successfully",
            user:user,
        });
    }


}

module.exports = new UserController();