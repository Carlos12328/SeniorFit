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

async function editarIdoso(id, dados) {
  const db = await getDb();
  const idoso = await db.get('SELECT id FROM idosos WHERE id = ?', [id]);
  if (!idoso) return { ok: false, statusCode: 404, codigoErro: 'IDOSO_NAO_ENCONTRADO', mensagem: 'Idoso não encontrado' };

  const nome  = dados.nome ? dados.nome.trim() : null;
  const idade = dados.idade ? Number(dados.idade) : null;
  if (!nome)  return { ok: false, statusCode: 400, codigoErro: 'NOME_OBRIGATORIO', mensagem: 'Nome é obrigatório' };
  if (!idade || idade < 1 || idade > 130) return { ok: false, statusCode: 400, codigoErro: 'IDADE_INVALIDA', mensagem: 'Idade inválida' };

  const idAcompanhante = dados.idAcompanhante || null;
  if (idAcompanhante) {
    const acomp = await db.get('SELECT id, tipoUsuario FROM usuarios WHERE id = ?', [idAcompanhante]);
    if (!acomp || acomp.tipoUsuario !== 'acompanhante') {
      return { ok: false, statusCode: 400, codigoErro: 'ACOMPANHANTE_INVALIDO', mensagem: 'Acompanhante inválido' };
    }
  }

  await db.run('UPDATE idosos SET nome = ?, idade = ?, idAcompanhante = ? WHERE id = ?', [nome, idade, idAcompanhante, id]);
  return { ok: true, dados: await buscarIdosoPorId(id) };
}

async function excluirIdoso(id) {
  const db = await getDb();
  const idoso = await db.get('SELECT id FROM idosos WHERE id = ?', [id]);
  if (!idoso) return { ok: false, statusCode: 404, codigoErro: 'IDOSO_NAO_ENCONTRADO', mensagem: 'Idoso não encontrado' };

  const atividades = await db.get('SELECT COUNT(*) as total FROM atividades WHERE idIdoso = ?', [id]);
  if (atividades.total > 0) {
    return { ok: false, statusCode: 400, codigoErro: 'IDOSO_COM_ATIVIDADES', mensagem: 'Este idoso possui atividades registradas e não pode ser excluído' };
  }

  await db.run('DELETE FROM idosos WHERE id = ?', [id]);
  return { ok: true, dados: null };
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

async function listarIdososSemAcompanhante() {
  const db = await getDb();
  const dados = await db.all(
    `SELECT i.id, i.nome, i.idade FROM idosos i WHERE i.idAcompanhante IS NULL ORDER BY i.nome`
  );
  return { ok: true, dados };
}

async function vincularAcompanhante(idIdoso, idAcompanhante) {
  const db = await getDb();
  const idoso = await db.get('SELECT id, idAcompanhante FROM idosos WHERE id = ?', [idIdoso]);
  if (!idoso) return { ok: false, statusCode: 404, codigoErro: 'IDOSO_NAO_ENCONTRADO', mensagem: 'Idoso não encontrado' };
  if (idoso.idAcompanhante) return { ok: false, statusCode: 400, codigoErro: 'IDOSO_JA_VINCULADO', mensagem: 'Este idoso já possui um acompanhante vinculado' };

  await db.run('UPDATE idosos SET idAcompanhante = ? WHERE id = ?', [idAcompanhante, idIdoso]);
  return { ok: true, dados: await buscarIdosoPorId(idIdoso) };
}

async function validarAcessoAoIdoso(usuario, idIdoso) {
  const idoso = await buscarIdosoPorId(idIdoso);
  if (!idoso) return { ok: false, statusCode: 404, codigoErro: 'IDOSO_NAO_ENCONTRADO', mensagem: 'Idoso não encontrado' };
  if (!podeAcessarIdoso(usuario, idoso)) {
    return { ok: false, statusCode: 403, codigoErro: 'IDOSO_NAO_VINCULADO', mensagem: 'Acesso negado ao idoso informado' };
  }
  return { ok: true, dados: idoso };
}

module.exports = { criarIdoso, editarIdoso, excluirIdoso, listarIdosos, listarIdososSemAcompanhante, vincularAcompanhante, buscarIdosoPorId, validarAcessoAoIdoso };
