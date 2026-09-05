const express = require('express');
const router = express.Router();
const customerPortalController = require('../controllers/customerPortalController');

// Portal Dashboard
router.get('/dashboard', customerPortalController.getDashboardData);

// Quotations
router.get('/quotations', customerPortalController.getQuotations);
router.get('/quotations/:id', customerPortalController.getQuotationById);
router.post('/quotations/:id/negotiate', customerPortalController.negotiateQuotation);
router.post('/quotations/:id/accept', customerPortalController.acceptQuotation);
router.post('/quotations/:id/reject', customerPortalController.rejectQuotation);

// Orders
router.get('/orders', customerPortalController.getOrders);

// Profile
router.get('/profile', customerPortalController.getProfile);
router.put('/profile', customerPortalController.updateProfile);

module.exports = router;
