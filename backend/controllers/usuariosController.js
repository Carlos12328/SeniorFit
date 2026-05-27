'use strict';
const service = require('../services/usuariosService');
const { responderResultado } = require('./baseController');

async function criar(req, res) {
  return responderResultado(res, await service.criarUsuario(req.body), 201, 'Usuário criado com sucesso');
}
async function listar(req, res) {
  return responderResultado(res, await service.listarUsuarios(), 200, 'Usuários listados com sucesso');
}
async function listarPendentes(req, res) {
  return responderResultado(res, await service.listarPendentes(), 200, 'Usuários pendentes listados com sucesso');
}
async function aprovar(req, res) {
  return responderResultado(res, await service.aprovarUsuario(Number(req.params.id)), 200, 'Usuário aprovado com sucesso');
}
async function rejeitar(req, res) {
  return responderResultado(res, await service.rejeitarUsuario(Number(req.params.id)), 200, 'Usuário rejeitado com sucesso');
}
async function editar(req, res) {
  return responderResultado(res, await service.editarUsuario(Number(req.params.id), req.body), 200, 'Usuário atualizado com sucesso');
}
async function excluir(req, res) {
  return responderResultado(res, await service.excluirUsuario(Number(req.params.id)), 200, 'Usuário excluído com sucesso');
}

module.exports = { criar, listar, listarPendentes, aprovar, rejeitar, editar, excluir };
