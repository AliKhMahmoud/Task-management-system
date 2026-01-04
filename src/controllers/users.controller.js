const User = require("../models/User");
const passwordService = require("../utils/passwordUtils");
const { USER_ROLES } = require("../utils/constants");

class UserController {

  async addUserByManager(req, res) {
    try {
      const { name, email, password } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email"
        });
      }

      const hashedPassword = await passwordService.hashPassword(password);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: USER_ROLES.TEAM_MEMBER
      });

      return res.status(201).json({
        success: true,
        message: "Team member added successfully",
        data: {
          id: newUser._id,
          name: newUser.name,
          role: newUser.role
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const page = Number(req.query.page) || 1;

      const users = await User.paginate({}, { page, limit: 10 });

      if (!users || users.docs.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found"
        });
      }

      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async findUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, role } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      user.name = name ?? user.name;
      user.role = role ?? user.role;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();

    