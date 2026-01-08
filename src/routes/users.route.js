const express = require('express');

const userController = require("../controllers/users.controller")
const { requireAuth, authorize } = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { USER_ROLES } = require('../utils/constants');
const { apiLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();


// TODO: Add user routes here
// Example:

router.post('/',
    [
        apiLimiter,
        requireAuth,
        authorize(USER_ROLES.MANAGER)
    ],
    asyncHandler(userController.addUserByManager)
);

<<<<<<< Updated upstream
router.get('/getAll',
=======
router.get('/getAll', 
>>>>>>> Stashed changes
    [
        apiLimiter
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

router.put('/update/:id',
    [
        apiLimiter,
        requireAuth,
        authorize(USER_ROLES.MANAGER)
        
    ],
    asyncHandler(userController.updateUser)
);

router.delete('/deleteUser/:id',
    [
        apiLimiter,
        requireAuth,
        authorize(USER_ROLES.MANAGER)
    ],
    asyncHandler(userController.deleteUser)
);



module.exports = router;
