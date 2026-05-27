'use strict';
const router = require('express').Router();
const controller = require('../controllers/idososController');
const { autenticar, exigirPermissao } = require('../middleware/auth');

router.post('/idosos', autenticar, exigirPermissao('idosos', 'editar'), controller.criar);
router.get('/idosos', autenticar, exigirPermissao('idosos', 'visualizar'), controller.listar);
router.get('/idosos/sem-acompanhante', autenticar, controller.listarSemAcompanhante);
router.patch('/idosos/:id/vincular', autenticar, controller.vincular);

module.exports = router;
