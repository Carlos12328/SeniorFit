'use strict';
const service = require('../services/idososService');
const { responderResultado } = require('./baseController');
async function criar(req, res) { return responderResultado(res, await service.criarIdoso(req.body), 201, 'Idoso criado com sucesso'); }
async function listar(req, res) { return responderResultado(res, await service.listarIdosos(req.usuario), 200, 'Idosos listados com sucesso'); }
module.exports = { criar, listar };
