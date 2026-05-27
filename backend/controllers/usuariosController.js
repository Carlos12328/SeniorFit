'use strict';
const service = require('../services/usuariosService');
const { responderResultado } = require('./baseController');
async function criar(req, res) { return responderResultado(res, await service.criarUsuario(req.body), 201, 'Usuário criado com sucesso'); }
async function listar(req, res) { return responderResultado(res, await service.listarUsuarios(), 200, 'Usuários listados com sucesso'); }
module.exports = { criar, listar };
