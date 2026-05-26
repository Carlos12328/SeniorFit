'use strict';
const router = require('express').Router();
const controller = require('../controllers/frequenciaController');
const { autenticar, exigirPermissao } = require('../middleware/auth');
router.get('/frequencia', autenticar, exigirPermissao('frequencia', 'visualizar'), controller.consultar);
module.exports = router;
