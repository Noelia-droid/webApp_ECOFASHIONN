const express = require('express');
const router = express.Router();
const { getOrdersByEstado } = require('../controllers/ordersController');

router.get('/', getOrdersByEstado);

module.exports = router;
