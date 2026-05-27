'use strict';
const authService = require('../services/authService');
const { responderResultado } = require('./baseController');
async function login(req, res) { return responderResultado(res, await authService.login(req.body.email, req.body.senha), 200, 'Login realizado com sucesso'); }
module.exports = { login };
