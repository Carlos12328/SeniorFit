'use strict';
const authService = require('../services/authService');
const usuariosService = require('../services/usuariosService');
const { responderResultado } = require('./baseController');

async function login(req, res) {
  return responderResultado(res, await authService.login(req.body.email, req.body.senha), 200, 'Login realizado com sucesso');
}

async function cadastro(req, res) {
  return responderResultado(res, await usuariosService.cadastrarPublico(req.body), 201, 'Cadastro realizado com sucesso');
}

module.exports = { login, cadastro };