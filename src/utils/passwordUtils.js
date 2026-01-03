const argon2 = require("argon2");

class PasswordService {
    
    async hashPassword(password) {
        try {
            return await argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 16,
                timeCost: 3,
                parallelism: 1,
                hashLength: 32
            })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async verifyPassword(password, hashedPassword) {
        try {
            return await argon2.verify(hashedPassword, password);
        } catch (error) {
            throw new Error(error.message);
        }
    }


}

module.exports = new PasswordService();