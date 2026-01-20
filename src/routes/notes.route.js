const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { apiLimiter } = require('../middlewares/rateLimit.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { createNoteValidator, updateNoteValidator, validateMongoId } = require('../validation/note.validation');
const noteController = require("../controllers/notes.controller");
const router = express.Router();

router.use(requireAuth);

router.get('/',
    asyncHandler(noteController.getAllNotes)
);

router.post('/',
    createNoteValidator,
    validate,
    asyncHandler(noteController.createNote)
);

router.get('/:id',
    validateMongoId('id'),
    validate,
    asyncHandler(noteController.getNoteById)
);

router.put('/:id',
    validateMongoId('id'),
    updateNoteValidator,
    validate,
    asyncHandler(noteController.updateNote)
);

router.delete('/:id',
    validateMongoId('id'),
    validate,
    asyncHandler(noteController.deleteNote)
);

module.exports = router;
