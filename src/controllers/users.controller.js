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
            role: USER_ROLES.TEAM_MEMBER, 
        });

        // Activity Log
        res.logActivity({
        action: "USER_CREATE",
        entityType: "User",
        entityId: newUser._id,
        metadata: { email: newUser.email, role: newUser.role, name: newUser.name }
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalDocs = await User.countDocuments({});
        const totalPages = Math.ceil(totalDocs / limit);

        const paginationResult = {
            docs: users,
            totalDocs,
            limit,
            totalPages,
            page,
            pagingCounter: skip + 1,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null
        };
        
        if(!users || users.length === 0){
            
            if (page === 1) {
                    res.status(404);
                    throw new Error("There is no users to show");
            }
        }
    
        return res.status(200).json({
            success: true,
            data: paginationResult
        });
    }
    
    findUserById = async(req,res) => {
        const {id} = req.params;
        const user = await User.findById(id).select("-password");
        if(!user){
            res.status(404);
            throw new Error("User not found");
        }
        return res.status(200).json({
            success:true,  
            data:user
        });
    }
    
    updateUser = async (req, res) => {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400);
                throw new Error("Email is already in use");
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    name: name || user.name, 
                    email: email || user.email, 
                    role: role || user.role 
                } 
            },
            { new: true, runValidators: true }
        ).select("-password -__v");

        // Activity Log
        const changedFields = [];
        if (name) changedFields.push("name");
        if (email) changedFields.push("email");
        if (role) changedFields.push("role");

        await user.save();

        res.logActivity({
        action: "USER_UPDATE",
        entityType: "User",
        entityId: user._id,
        metadata: { changedFields }
        });

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    };

    async deleteUser(req,res){
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        if(!user){
            res.status(404);
            throw new Error("User not found");
        }

        // Activity Log
        res.logActivity({
        action: "USER_DELETE",
        entityType: "User",
        entityId: id,
        metadata: { email: user.email, name: user.name }
        });
        return res.status(200).json({  
            success:true,
            message:"User deleted successfully",
        });
    }

}

module.exports = new UserController();