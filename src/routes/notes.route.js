const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { apiLimiter } = require('../middlewares/rateLimit.middleware');
const noteController = require('../controllers/note.controller');

const router = express.Router();


router.get(
  '/',
  apiLimiter,
  asyncHandler(noteController.getAllNotes)
);
router.post(
  '/',
  apiLimiter,
  asyncHandler(noteController.createNote)
);


router.get(
  '/:id',
  apiLimiter,
  asyncHandler(noteController.getNoteById)
);


router.put(
  '/:id',
  apiLimiter,
  asyncHandler(noteController.updateNote)
);


router.delete(
  '/:id',
  apiLimiter,
  asyncHandler(noteController.deleteNote)
);

module.exports = router;

