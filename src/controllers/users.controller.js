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

        // تنفيذ الاستعلام مع التصفح
        const users = await User.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalDocs = await User.countDocuments({});
        const totalPages = Math.ceil(totalDocs / limit);

        // محاكاة هيكل استجابة مكتبة paginate
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
    
    async findUserById(req,res){
        const {id} = req.params;
        const user = await User.findById(id);
        if(!user){
            res.status(404);
            throw new Error("User not found");
        }
        return res.status(200).json({
            success:true,  
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
        return res.status(200).json({  
            success:true,
            message:"User deleted successfully",
        });
    }

    async updateUser(req, res) {
        const { id } = req.params;
        const { name, email, role } = req.body;
        const user = await User.findById(id);
        
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // التحقق إذا كان البريد الإلكتروني الجديد مستخدماً من قبل
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                res.status(400);
                throw new Error("Email is already in use");
            }
            user.email = email;  
        }

        if (name) user.name = name;
        if (role) user.role = role;
        
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: user,
        });
    }

}

module.exports = new UserController();