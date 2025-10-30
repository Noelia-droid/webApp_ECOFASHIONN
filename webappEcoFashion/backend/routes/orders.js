const express = require('express');
const router = express.Router();

const { getOrdersByEstado } = require('../controllers/ordersController');
const { getRefundsByEstado } = require('../controllers/ordersController');

//---HISTORIAL-PEDIDOS---
router.get('/estado', getOrdersByEstado);

//---HISOTIRAL-REEMBOLSOS---
router.get('/refunds', getRefundsByEstado);

module.exports = router;
