'use strict';

const tiposAtividades = require('../data/tiposAtividades');
const { validateDuration } = require('./durationValidation');
const { validateDate } = require('./dateValidation');

function validateActivity(dados) {
  if (!dados || !dados.idIdoso) {
    return { valido: false, codigoErro: 'IDOSO_AUSENTE', mensagem: 'Informe o idoso da atividade' };
  }
  const idIdoso = Number(dados.idIdoso);
  if (!Number.isInteger(idIdoso) || idIdoso < 1) {
    return { valido: false, codigoErro: 'IDOSO_INVALIDO', mensagem: 'Informe um idoso válido' };
  }
  if (!dados.tipo || !tiposAtividades.includes(dados.tipo)) {
    return { valido: false, codigoErro: 'TIPO_ATIVIDADE_INVALIDO', mensagem: 'Selecione um tipo de atividade pré-cadastrado' };
  }
  const duracao = validateDuration(dados.duracao);
  if (!duracao.valido) return duracao;
  const data = validateDate(dados.dataAtividade);
  if (!data.valido) return data;
  return {
    valido: true,
    dados: {
      idIdoso,
      tipo: dados.tipo,
      descricao: dados.descricao ? String(dados.descricao).trim() : '',
      duracao: duracao.valor,
      dataAtividade: dados.dataAtividade
    }
  };
}

module.exports = { validateActivity };
