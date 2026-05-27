'use strict';
const router = require('express').Router();
const controller = require('../controllers/usuariosController');
const { autenticar, exigirPermissao } = require('../middleware/auth');

router.post('/usuarios', autenticar, exigirPermissao('usuarios', 'editar'), controller.criar);
router.get('/usuarios', autenticar, exigirPermissao('usuarios', 'visualizar'), controller.listar);
router.get('/usuarios/pendentes', autenticar, exigirPermissao('usuarios', 'visualizar'), controller.listarPendentes);
router.patch('/usuarios/:id/aprovar', autenticar, exigirPermissao('usuarios', 'editar'), controller.aprovar);
router.patch('/usuarios/:id/rejeitar', autenticar, exigirPermissao('usuarios', 'editar'), controller.rejeitar);
router.put('/usuarios/:id', autenticar, exigirPermissao('usuarios', 'editar'), controller.editar);
router.delete('/usuarios/:id', autenticar, exigirPermissao('usuarios', 'editar'), controller.excluir);

module.exports = router;
