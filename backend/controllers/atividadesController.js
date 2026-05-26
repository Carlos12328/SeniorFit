'use strict';
const service = require('../services/atividadesService');
const tiposAtividades = require('../data/tiposAtividades');
const { sucesso } = require('../utils/responses');
const { responderResultado } = require('./baseController');
async function criar(req, res) { return responderResultado(res, await service.criarAtividade(req.body, req.usuario), 201, 'Atividade registrada com sucesso'); }
async function listar(req, res) { return responderResultado(res, await service.listarAtividades(req.query, req.usuario), 200, 'Atividades listadas com sucesso'); }
async function editar(req, res) { return responderResultado(res, await service.editarAtividade(Number(req.params.id), req.body, req.usuario), 200, 'Frequência atualizada com sucesso'); }
function tipos(req, res) { return sucesso(res, 200, 'Tipos de atividades listados com sucesso', tiposAtividades); }
module.exports = { criar, listar, editar, tipos };
