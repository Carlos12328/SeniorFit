'use strict';

const jwt = require('jsonwebtoken');
const { getDb } = require('../database/connection');
const { erro } = require('../utils/responses');
const { hasModuleAccess } = require('./permissions');

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, tipoUsuario: usuario.tipoUsuario },
    process.env.JWT_SECRET || 'seniorfit_chave_academica',
    { expiresIn: '8h' }
  );
}

async function autenticar(req, res, next) {
  try {
    const cabecalho = req.headers.authorization || '';
    const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
    if (!token) return erro(res, 401, 'Token não informado', 'TOKEN_AUSENTE');

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'seniorfit_chave_academica');
    const db = await getDb();
    const usuario = await db.get('SELECT id, nome, email, tipoUsuario FROM usuarios WHERE id = ?', [payload.id]);
    if (!usuario) return erro(res, 401, 'Usuário do token não encontrado', 'TOKEN_INVALIDO');
    const permissoes = await db.all('SELECT modulo, podeVisualizar, podeEditar FROM permissoes WHERE idUsuario = ?', [usuario.id]);
    req.usuario = usuario;
    req.permissoes = permissoes;
    next();
  } catch (e) {
    return erro(res, 401, 'Token inválido ou expirado', 'TOKEN_INVALIDO');
  }
}

function exigirPermissao(modulo, acao) {
  return function (req, res, next) {
    if (!hasModuleAccess(req.permissoes, modulo, acao)) {
      return erro(res, 403, 'Usuário sem permissão para esta operação', 'PERMISSAO_NEGADA');
    }
    next();
  };
}

module.exports = { gerarToken, autenticar, exigirPermissao };
