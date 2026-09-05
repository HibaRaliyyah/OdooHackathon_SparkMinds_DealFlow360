const express = require('express');
const router = express.Router();
const fulfillmentController = require('../controllers/fulfillmentController');

router.get('/', fulfillmentController.getAllFulfillments);
router.post('/', fulfillmentController.createFulfillment);
router.put('/:id', fulfillmentController.updateFulfillment);

module.exports = router;
