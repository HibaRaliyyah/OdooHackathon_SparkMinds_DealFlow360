const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.getSummary);
router.get('/deal-health', dashboardController.getDealHealth);
router.get('/revenue', dashboardController.getRevenue);
router.get('/pipeline', dashboardController.getPipeline);

module.exports = router;
