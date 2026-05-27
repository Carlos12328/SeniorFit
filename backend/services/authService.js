'use strict';

const bcrypt = require('bcryptjs');
const { getDb } = require('../database/connection');
const { validateLogin } = require('../validations/authValidation');
const { gerarToken } = require('../middleware/auth');

async function login(email, senha) {
  const validacao = validateLogin(email, senha);
  if (!validacao.valido) return { ok: false, statusCode: 400, ...validacao };

  const db = await getDb();
  const usuario = await db.get('SELECT * FROM usuarios WHERE email = ?', [validacao.email]);
  if (!usuario) return { ok: false, statusCode: 401, codigoErro: 'CREDENCIAIS_INVALIDAS', mensagem: 'Email ou senha inválidos' };

  if (usuario.status === 'pendente') {
    return { ok: false, statusCode: 403, codigoErro: 'APROVACAO_PENDENTE', mensagem: 'Seu cadastro ainda está aguardando aprovação do administrador' };
  }
  if (usuario.status === 'bloqueado') {
    return { ok: false, statusCode: 403, codigoErro: 'USUARIO_BLOQUEADO', mensagem: 'Seu acesso foi bloqueado. Entre em contato com o administrador' };
  }

  const senhaCorreta = await bcrypt.compare(String(senha), usuario.senha);
  if (!senhaCorreta) return { ok: false, statusCode: 401, codigoErro: 'CREDENCIAIS_INVALIDAS', mensagem: 'Email ou senha inválidos' };

  const permissoes = await db.all('SELECT modulo, podeVisualizar, podeEditar FROM permissoes WHERE idUsuario = ?', [usuario.id]);
  const usuarioSeguro = { id: usuario.id, nome: usuario.nome, email: usuario.email, tipoUsuario: usuario.tipoUsuario };
  return { ok: true, dados: { token: gerarToken(usuarioSeguro), usuario: usuarioSeguro, permissoes } };
}

module.exports = { login };
