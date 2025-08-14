const { Router } = require('express');
const controller = require('../controllers/customer.controller');

const router = Router();

router.post('/', controller.create);
router.get('/', controller.findAll);

module.exports = router;