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
        // الحل: إزالة limit أو جعله أكبر
        const page = +req.query.page || 1;
        const users = await User.paginate({}, {  // استخدم {} للفلتر الفارغ
            page: page,
            limit: req.query.limit || 10,  // افتراضي 10 بدلاً من 2
            sort: { createdAt: -1 }
        });
        
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
        // ✅ التصحيح: User.findById(id)
        const user = await User.findById(id);
        if(!user){
            res.status(404);
            throw new Error("User not found");
        }
        return res.status(200).json({
            success:true,  // تصحيح: suucess → success
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
        return res.status(200).json({  // 201 → 200 (أفضل)
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
            user.email = email;  // ✅ تحديث البريد الإلكتروني
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