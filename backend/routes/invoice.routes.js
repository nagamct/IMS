const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoice.controller');

// POST /api/invoices - Create new invoice
router.post('/', controller.create);

// GET /api/invoices - Get all invoices
router.get('/', controller.findAll);

module.exports = router;