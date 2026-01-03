require("dotenv").config();
const User = require("../models/User");
const connectDB = require("../config/connectDB");
const passwordService = require("../utils/passwordUtils");
const { USER_ROLES } = require("../utils/constants");

const createAdminUser = async () => {
    try {
        await connectDB();

        const adminData = {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASS,
            name: process.env.ADMIN_NAME,
            role: USER_ROLES.MANAGER,
        }

        const existedAdmin = await User.findOne({ role: "Manager" });

        if(existedAdmin) {
            console.error("Admin is already exist");
            process.exit(1);
        }

        await User.create({
            ...adminData,
            password: await passwordService.hashPassword(adminData.password)
        });

        console.log("Admin is Created Successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin User:", error.message)
        process.exit(1);
    }
}

createAdminUser();