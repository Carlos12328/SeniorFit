'use strict';

const bcrypt = require('bcryptjs');
const { getDb } = require('../database/connection');
const { validateUser } = require('../validations/userValidation');
const { inserirPermissoesPadrao } = require('../database/init');

async function criarUsuario(dados) {
  const validacao = validateUser(dados);
  if (!validacao.valido) return { ok: false, statusCode: 400, ...validacao };

  const db = await getDb();
  const existente = await db.get('SELECT id FROM usuarios WHERE email = ?', [validacao.dados.email]);
  if (existente) {
    return { ok: false, statusCode: 409, codigoErro: 'EMAIL_DUPLICADO', mensagem: 'Já existe usuário com este email' };
  }

  const senhaHash = await bcrypt.hash(validacao.dados.senha, 10);
  const resultado = await db.run(
    'INSERT INTO usuarios (nome, email, senha, tipoUsuario) VALUES (?, ?, ?, ?)',
    [validacao.dados.nome, validacao.dados.email, senhaHash, validacao.dados.tipoUsuario]
  );
  await inserirPermissoesPadrao(db, resultado.lastID, validacao.dados.tipoUsuario);
  const usuario = await db.get('SELECT id, nome, email, tipoUsuario FROM usuarios WHERE id = ?', [resultado.lastID]);
  return { ok: true, dados: usuario };
}

async function listarUsuarios() {
  const db = await getDb();
  const usuarios = await db.all('SELECT id, nome, email, tipoUsuario FROM usuarios ORDER BY nome');
  return { ok: true, dados: usuarios };
}

module.exports = { criarUsuario, listarUsuarios };
