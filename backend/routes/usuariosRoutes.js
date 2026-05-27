'use strict';
const router = require('express').Router();
const controller = require('../controllers/usuariosController');
const { autenticar, exigirPermissao } = require('../middleware/auth');
router.post('/usuarios', autenticar, exigirPermissao('usuarios', 'editar'), controller.criar);
router.get('/usuarios', autenticar, exigirPermissao('usuarios', 'visualizar'), controller.listar);
module.exports = router;
