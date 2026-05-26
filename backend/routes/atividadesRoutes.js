'use strict';
const router = require('express').Router();
const controller = require('../controllers/atividadesController');
const { autenticar, exigirPermissao } = require('../middleware/auth');
router.get('/tipos-atividades', autenticar, controller.tipos);
router.post('/atividades', autenticar, exigirPermissao('atividades', 'editar'), controller.criar);
router.get('/atividades', autenticar, exigirPermissao('atividades', 'visualizar'), controller.listar);
router.put('/atividades/:id', autenticar, exigirPermissao('frequencia', 'editar'), controller.editar);
module.exports = router;
