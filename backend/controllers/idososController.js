'use strict';
const service = require('../services/idososService');
const { responderResultado } = require('./baseController');

async function criar(req, res) {
  return responderResultado(res, await service.criarIdoso(req.body), 201, 'Idoso criado com sucesso');
}
async function listar(req, res) {
  return responderResultado(res, await service.listarIdosos(req.usuario), 200, 'Idosos listados com sucesso');
}
async function listarSemAcompanhante(req, res) {
  return responderResultado(res, await service.listarIdososSemAcompanhante(), 200, 'Idosos sem acompanhante listados');
}
async function vincular(req, res) {
  return responderResultado(res, await service.vincularAcompanhante(Number(req.params.id), req.usuario.id), 200, 'Vínculo realizado com sucesso');
}
async function editar(req, res) {
  return responderResultado(res, await service.editarIdoso(Number(req.params.id), req.body), 200, 'Idoso atualizado com sucesso');
}
async function excluir(req, res) {
  return responderResultado(res, await service.excluirIdoso(Number(req.params.id)), 200, 'Idoso excluído com sucesso');
}

module.exports = { criar, listar, listarSemAcompanhante, vincular, editar, excluir };
