'use strict';

function isFutureDate(data) {
  if (!data) return false;
  const recebida = new Date(`${data}T00:00:00`);
  if (Number.isNaN(recebida.getTime())) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return recebida > hoje;
}

function validateDate(data) {
  if (!data) return { valido: false, codigoErro: 'DATA_AUSENTE', mensagem: 'Informe a data da atividade' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return { valido: false, codigoErro: 'DATA_INVALIDA', mensagem: 'A data deve estar no formato YYYY-MM-DD' };
  }
  const recebida = new Date(`${data}T00:00:00`);
  if (Number.isNaN(recebida.getTime())) {
    return { valido: false, codigoErro: 'DATA_INVALIDA', mensagem: 'Informe uma data válida' };
  }
  if (isFutureDate(data)) {
    return { valido: false, codigoErro: 'DATA_FUTURA', mensagem: 'A data da atividade não pode ser futura' };
  }
  return { valido: true };
}

module.exports = { isFutureDate, validateDate };
