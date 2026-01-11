const express = require('express');
const ReportsController = require('../controllers/reports.controller');
const { requireAuth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();


router.use(requireAuth);


router.get('/tasks/pdf', authorize('Manager'), ReportsController.exportTasksPdf);
router.get('/projects/:projectId/pdf', authorize('Manager'), ReportsController.exportProjectPdf);

module.exports = router;




