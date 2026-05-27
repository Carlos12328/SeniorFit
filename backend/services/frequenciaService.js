'use strict';

const { normalizarPeriodo, calculateFrequency } = require('../utils/frequencyUtils');
const { listarAtividades } = require('./atividadesService');
const { validarAcessoAoIdoso } = require('./idososService');

async function consultarFrequencia(query, usuario) {
  if (!query.idIdoso) {
    return { ok: false, statusCode: 400, codigoErro: 'IDOSO_AUSENTE', mensagem: 'Informe o idoso para consultar a frequência' };
  }
  const periodo = normalizarPeriodo(query.periodo || 'semana');
  if (!periodo.valido) return { ok: false, statusCode: 400, ...periodo };
  const acesso = await validarAcessoAoIdoso(usuario, Number(query.idIdoso));
  if (!acesso.ok) return acesso;
  const atividades = await listarAtividades({ idIdoso: Number(query.idIdoso) }, usuario);
  if (!atividades.ok) return atividades;
  const frequencia = calculateFrequency(atividades.dados, query.periodo || 'semana');
  return { ok: true, dados: { idoso: acesso.dados, frequencia } };
}

module.exports = { consultarFrequencia };
