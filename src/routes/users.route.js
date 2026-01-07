const express = require('express');
const userController = require("../controllers/users.controller")
const { requireAuth, authorize } = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { USER_ROLES } = require('../utils/constants');
const { addUserValidator, paginationValidator, updateUserValidator } = require('../validation/user.validation');
const validate = require('../middlewares/validation.middleware');
// const { validateMongoId } = require('../validation/task.validation');

const router = express.Router();

router.use(requireAuth)
// TODO: Add user routes here

router.post('/',
    [
        authorize(USER_ROLES.MANAGER),
        ...addUserValidator,
        validate
    ],
    asyncHandler(userController.addUserByManager)
);

router.get('/', 
    [
        authorize(USER_ROLES.MANAGER),
        ...paginationValidator,
        validate
    ], 
    asyncHandler(userController.getAllUsers)
);

router.get('/:id',
    // [
    //     validateMongoId,
    //     validate
    // ],
    asyncHandler(userController.findUserById)
);

router.put('/:id',
    [
        authorize(USER_ROLES.MANAGER),
        ...updateUserValidator,
        validate
    ],
    asyncHandler(userController.updateUser)
);

router.delete('/:id',
    [
        authorize(USER_ROLES.MANAGER),
        // validateMongoId,
        // validate
    ],
    asyncHandler(userController.deleteUser)
);



module.exports = router;
