'use strict';

const { getDb } = require('../database/connection');
const { validateActivity } = require('../validations/activityValidation');
const { validarAcessoAoIdoso } = require('./idososService');

async function criarAtividade(dados, usuario) {
  const validacao = validateActivity(dados);
  if (!validacao.valido) return { ok: false, statusCode: 400, ...validacao };
  const acesso = await validarAcessoAoIdoso(usuario, validacao.dados.idIdoso);
  if (!acesso.ok) return acesso;

  const db = await getDb();
  const resultado = await db.run(
    'INSERT INTO atividades (idIdoso, idUsuario, tipo, descricao, duracao, dataAtividade) VALUES (?, ?, ?, ?, ?, ?)',
    [validacao.dados.idIdoso, usuario.id, validacao.dados.tipo, validacao.dados.descricao, validacao.dados.duracao, validacao.dados.dataAtividade]
  );
  const atividade = await buscarAtividadePorId(resultado.lastID);
  return { ok: true, dados: atividade };
}

async function buscarAtividadePorId(id) {
  const db = await getDb();
  return db.get(
    `SELECT a.id, a.idIdoso, i.nome AS nomeIdoso, a.idUsuario, u.nome AS nomeUsuario,
            a.tipo, a.descricao, a.duracao, a.dataAtividade
       FROM atividades a
       JOIN idosos i ON i.id = a.idIdoso
       JOIN usuarios u ON u.id = a.idUsuario
      WHERE a.id = ?`,
    [id]
  );
}

async function listarAtividades(filtros, usuario) {
  const db = await getDb();
  const where = [];
  const params = [];

  if (usuario.tipoUsuario === 'acompanhante') {
    where.push('i.idAcompanhante = ?');
    params.push(usuario.id);
  }
  if (filtros.idIdoso) {
    const acesso = await validarAcessoAoIdoso(usuario, Number(filtros.idIdoso));
    if (!acesso.ok) return acesso;
    where.push('a.idIdoso = ?');
    params.push(Number(filtros.idIdoso));
  }
  if (filtros.dataInicio) {
    where.push('a.dataAtividade >= ?');
    params.push(filtros.dataInicio);
  }
  if (filtros.dataFim) {
    where.push('a.dataAtividade <= ?');
    params.push(filtros.dataFim);
  }

  const sql = `SELECT a.id, a.idIdoso, i.nome AS nomeIdoso, a.idUsuario, u.nome AS nomeUsuario,
                      a.tipo, a.descricao, a.duracao, a.dataAtividade
                 FROM atividades a
                 JOIN idosos i ON i.id = a.idIdoso
                 JOIN usuarios u ON u.id = a.idUsuario
                ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                ORDER BY a.dataAtividade DESC, a.id DESC`;
  const dados = await db.all(sql, params);
  return { ok: true, dados };
}

async function editarAtividade(id, dados, usuario) {
  const atual = await buscarAtividadePorId(id);
  if (!atual) return { ok: false, statusCode: 404, codigoErro: 'ATIVIDADE_NAO_ENCONTRADA', mensagem: 'Atividade não encontrada' };
  const acesso = await validarAcessoAoIdoso(usuario, atual.idIdoso);
  if (!acesso.ok) return acesso;
  if (usuario.tipoUsuario === 'acompanhante') {
    return { ok: false, statusCode: 403, codigoErro: 'EDICAO_FREQUENCIA_NEGADA', mensagem: 'Acompanhante não pode editar frequência' };
  }
  const validacao = validateActivity({
    idIdoso: dados.idIdoso || atual.idIdoso,
    tipo: dados.tipo || atual.tipo,
    descricao: dados.descricao !== undefined ? dados.descricao : atual.descricao,
    duracao: dados.duracao !== undefined ? dados.duracao : atual.duracao,
    dataAtividade: dados.dataAtividade || atual.dataAtividade
  });
  if (!validacao.valido) return { ok: false, statusCode: 400, ...validacao };
  const novoAcesso = await validarAcessoAoIdoso(usuario, validacao.dados.idIdoso);
  if (!novoAcesso.ok) return novoAcesso;
  const db = await getDb();
  await db.run(
    `UPDATE atividades
        SET idIdoso = ?, tipo = ?, descricao = ?, duracao = ?, dataAtividade = ?, atualizadoEm = datetime('now')
      WHERE id = ?`,
    [validacao.dados.idIdoso, validacao.dados.tipo, validacao.dados.descricao, validacao.dados.duracao, validacao.dados.dataAtividade, id]
  );
  return { ok: true, dados: await buscarAtividadePorId(id) };
}

module.exports = { criarAtividade, listarAtividades, buscarAtividadePorId, editarAtividade };
