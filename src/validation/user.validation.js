const { body, param } = require("express-validator");
const USER_ROLES = require("../constants/userRoles");

class UserValidator {

    updateUser() {
        return [
            body("name")
                .isString().withMessage("Name must be string").bail()
                .isLength({ min: 3, max: 50 })
                .withMessage("Title length must be in (3 - 50) range")
                .bail(),

            body("role")
                .optional()
                .isIn(Object.values(USER_ROLES))
                .withMessage(
                    `Role must be one of: ${Object.values(USER_ROLES).join(" | ")}`
                ),
        ];
    }
}

module.exports = new UserValidator();
