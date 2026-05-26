'use strict';

const { getDb } = require('../database/connection');
const { validateIdoso } = require('../validations/idosoValidation');
const { podeAcessarIdoso } = require('../middleware/permissions');

async function buscarIdosoPorId(id) {
  const db = await getDb();
  return db.get(
    `SELECT i.id, i.nome, i.idade, i.idAcompanhante, u.nome AS nomeAcompanhante
       FROM idosos i
       LEFT JOIN usuarios u ON u.id = i.idAcompanhante
      WHERE i.id = ?`,
    [id]
  );
}

async function criarIdoso(dados) {
  const validacao = validateIdoso(dados);
  if (!validacao.valido) return { ok: false, statusCode: 400, ...validacao };
  const db = await getDb();

  if (validacao.dados.idAcompanhante) {
    const acompanhante = await db.get('SELECT id, tipoUsuario FROM usuarios WHERE id = ?', [validacao.dados.idAcompanhante]);
    if (!acompanhante || acompanhante.tipoUsuario !== 'acompanhante') {
      return { ok: false, statusCode: 400, codigoErro: 'ACOMPANHANTE_INVALIDO', mensagem: 'O acompanhante informado não existe ou não possui perfil de acompanhante' };
    }
  }

  const resultado = await db.run(
    'INSERT INTO idosos (nome, idade, idAcompanhante) VALUES (?, ?, ?)',
    [validacao.dados.nome, validacao.dados.idade, validacao.dados.idAcompanhante]
  );
  return { ok: true, dados: await buscarIdosoPorId(resultado.lastID) };
}

async function listarIdosos(usuario) {
  const db = await getDb();
  const base = `SELECT i.id, i.nome, i.idade, i.idAcompanhante, u.nome AS nomeAcompanhante
                  FROM idosos i
                  LEFT JOIN usuarios u ON u.id = i.idAcompanhante`;
  if (usuario.tipoUsuario === 'acompanhante') {
    const dados = await db.all(`${base} WHERE i.idAcompanhante = ? ORDER BY i.nome`, [usuario.id]);
    return { ok: true, dados };
  }
  const dados = await db.all(`${base} ORDER BY i.nome`);
  return { ok: true, dados };
}

async function validarAcessoAoIdoso(usuario, idIdoso) {
  const idoso = await buscarIdosoPorId(idIdoso);
  if (!idoso) return { ok: false, statusCode: 404, codigoErro: 'IDOSO_NAO_ENCONTRADO', mensagem: 'Idoso não encontrado' };
  if (!podeAcessarIdoso(usuario, idoso)) {
    return { ok: false, statusCode: 403, codigoErro: 'IDOSO_NAO_VINCULADO', mensagem: 'Acesso negado ao idoso informado' };
  }
  return { ok: true, dados: idoso };
}

module.exports = { criarIdoso, listarIdosos, buscarIdosoPorId, validarAcessoAoIdoso };
