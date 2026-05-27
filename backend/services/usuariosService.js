'use strict';

const bcrypt = require('bcryptjs');
const { getDb } = require('../database/connection');
const { validateUser } = require('../validations/userValidation');
const { inserirPermissoesPadrao } = require('../database/init');

async function cadastrarPublico(dados) {
  if (!['profissional', 'acompanhante'].includes(dados.tipoUsuario)) {
    return { ok: false, statusCode: 400, codigoErro: 'TIPO_INVALIDO', mensagem: 'Somente profissional ou acompanhante podem se cadastrar' };
  }
  const validacao = validateUser(dados);
  if (!validacao.valido) return { ok: false, statusCode: 400, ...validacao };

  const db = await getDb();
  const existente = await db.get('SELECT id FROM usuarios WHERE email = ?', [validacao.dados.email]);
  if (existente) return { ok: false, statusCode: 409, codigoErro: 'EMAIL_DUPLICADO', mensagem: 'Já existe usuário com este email' };

  const senhaHash = await bcrypt.hash(validacao.dados.senha, 10);
  const status = validacao.dados.tipoUsuario === 'profissional' ? 'pendente' : 'ativo';
  const resultado = await db.run(
    'INSERT INTO usuarios (nome, email, senha, tipoUsuario, status) VALUES (?, ?, ?, ?, ?)',
    [validacao.dados.nome, validacao.dados.email, senhaHash, validacao.dados.tipoUsuario, status]
  );
  await inserirPermissoesPadrao(db, resultado.lastID, validacao.dados.tipoUsuario);
  const usuario = await db.get('SELECT id, nome, email, tipoUsuario, status FROM usuarios WHERE id = ?', [resultado.lastID]);
  return { ok: true, dados: usuario };
}

async function criarUsuario(dados) {
  const validacao = validateUser(dados);
  if (!validacao.valido) return { ok: false, statusCode: 400, ...validacao };

  const db = await getDb();
  const existente = await db.get('SELECT id FROM usuarios WHERE email = ?', [validacao.dados.email]);
  if (existente) return { ok: false, statusCode: 409, codigoErro: 'EMAIL_DUPLICADO', mensagem: 'Já existe usuário com este email' };

  const senhaHash = await bcrypt.hash(validacao.dados.senha, 10);
  const resultado = await db.run(
    'INSERT INTO usuarios (nome, email, senha, tipoUsuario, status) VALUES (?, ?, ?, ?, ?)',
    [validacao.dados.nome, validacao.dados.email, senhaHash, validacao.dados.tipoUsuario, 'ativo']
  );
  await inserirPermissoesPadrao(db, resultado.lastID, validacao.dados.tipoUsuario);
  const usuario = await db.get('SELECT id, nome, email, tipoUsuario, status FROM usuarios WHERE id = ?', [resultado.lastID]);
  return { ok: true, dados: usuario };
}

async function editarUsuario(id, dados) {
  const db = await getDb();
  const usuario = await db.get('SELECT id, tipoUsuario FROM usuarios WHERE id = ?', [id]);
  if (!usuario) return { ok: false, statusCode: 404, codigoErro: 'USUARIO_NAO_ENCONTRADO', mensagem: 'Usuário não encontrado' };

  const nome  = dados.nome  ? dados.nome.trim()  : null;
  const email = dados.email ? dados.email.trim() : null;
  if (!nome)  return { ok: false, statusCode: 400, codigoErro: 'NOME_OBRIGATORIO', mensagem: 'Nome é obrigatório' };
  if (!email) return { ok: false, statusCode: 400, codigoErro: 'EMAIL_OBRIGATORIO', mensagem: 'Email é obrigatório' };

  const duplicado = await db.get('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]);
  if (duplicado) return { ok: false, statusCode: 409, codigoErro: 'EMAIL_DUPLICADO', mensagem: 'Já existe outro usuário com este email' };

  await db.run('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?', [nome, email, id]);
  const atualizado = await db.get('SELECT id, nome, email, tipoUsuario, status FROM usuarios WHERE id = ?', [id]);
  return { ok: true, dados: atualizado };
}

async function excluirUsuario(id) {
  const db = await getDb();
  const usuario = await db.get('SELECT id, tipoUsuario FROM usuarios WHERE id = ?', [id]);
  if (!usuario) return { ok: false, statusCode: 404, codigoErro: 'USUARIO_NAO_ENCONTRADO', mensagem: 'Usuário não encontrado' };
  if (usuario.tipoUsuario === 'admin') return { ok: false, statusCode: 400, codigoErro: 'ACAO_INVALIDA', mensagem: 'Não é possível excluir o administrador' };

  const atividadesVinculadas = await db.get('SELECT COUNT(*) as total FROM atividades WHERE idUsuario = ?', [id]);
  if (atividadesVinculadas.total > 0) {
    return { ok: false, statusCode: 400, codigoErro: 'USUARIO_COM_ATIVIDADES', mensagem: 'Este usuário possui atividades registradas e não pode ser excluído' };
  }

  await db.run('UPDATE idosos SET idAcompanhante = NULL WHERE idAcompanhante = ?', [id]);
  await db.run('DELETE FROM permissoes WHERE idUsuario = ?', [id]);
  await db.run('DELETE FROM usuarios WHERE id = ?', [id]);
  return { ok: true, dados: null };
}

async function listarUsuarios() {
  const db = await getDb();
  const usuarios = await db.all('SELECT id, nome, email, tipoUsuario, status FROM usuarios ORDER BY nome');
  return { ok: true, dados: usuarios };
}

async function listarPendentes() {
  const db = await getDb();
  const usuarios = await db.all(
    "SELECT id, nome, email, tipoUsuario, status, criadoEm FROM usuarios WHERE status = 'pendente' ORDER BY criadoEm"
  );
  return { ok: true, dados: usuarios };
}

async function aprovarUsuario(id) {
  const db = await getDb();
  const usuario = await db.get('SELECT id, status FROM usuarios WHERE id = ?', [id]);
  if (!usuario) return { ok: false, statusCode: 404, codigoErro: 'USUARIO_NAO_ENCONTRADO', mensagem: 'Usuário não encontrado' };
  if (usuario.status !== 'pendente') return { ok: false, statusCode: 400, codigoErro: 'STATUS_INVALIDO', mensagem: 'Usuário não está pendente de aprovação' };
  await db.run("UPDATE usuarios SET status = 'ativo' WHERE id = ?", [id]);
  const atualizado = await db.get('SELECT id, nome, email, tipoUsuario, status FROM usuarios WHERE id = ?', [id]);
  return { ok: true, dados: atualizado };
}

async function rejeitarUsuario(id) {
  const db = await getDb();
  const usuario = await db.get('SELECT id, status FROM usuarios WHERE id = ?', [id]);
  if (!usuario) return { ok: false, statusCode: 404, codigoErro: 'USUARIO_NAO_ENCONTRADO', mensagem: 'Usuário não encontrado' };
  if (usuario.status !== 'pendente') return { ok: false, statusCode: 400, codigoErro: 'STATUS_INVALIDO', mensagem: 'Usuário não está pendente de aprovação' };
  await db.run("UPDATE usuarios SET status = 'bloqueado' WHERE id = ?", [id]);
  const atualizado = await db.get('SELECT id, nome, email, tipoUsuario, status FROM usuarios WHERE id = ?', [id]);
  return { ok: true, dados: atualizado };
}

module.exports = { cadastrarPublico, criarUsuario, editarUsuario, excluirUsuario, listarUsuarios, listarPendentes, aprovarUsuario, rejeitarUsuario };
