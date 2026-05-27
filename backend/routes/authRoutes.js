'use strict';
const router = require('express').Router();
const controller = require('../controllers/authController');

router.post('/login', controller.login);
router.post('/cadastro', controller.cadastro);

module.exports = router;
