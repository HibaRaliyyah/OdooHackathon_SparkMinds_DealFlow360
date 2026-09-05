const express = require('express');
const router = express.Router();
const negotiationController = require('../controllers/negotiationController');

router.get('/', negotiationController.getAllNegotiations);
router.post('/', negotiationController.createNegotiation);
router.put('/:id', negotiationController.updateNegotiation);

module.exports = router;
