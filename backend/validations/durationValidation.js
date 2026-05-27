'use strict';

function validateDuration(duracao) {
  if (duracao === null || duracao === undefined || duracao === '') {
    return { valido: false, codigoErro: 'DURACAO_AUSENTE', mensagem: 'Informe a duração da atividade' };
  }
  const numero = Number(duracao);
  if (!Number.isInteger(numero) || numero < 1) {
    return { valido: false, codigoErro: 'DURACAO_INVALIDA_MINIMA', mensagem: 'A duração deve ser de pelo menos 1 minuto' };
  }
  if (numero > 480) {
    return { valido: false, codigoErro: 'DURACAO_INVALIDA_MAXIMA', mensagem: 'A duração não pode exceder 480 minutos' };
  }
  return { valido: true, valor: numero };
}

module.exports = { validateDuration };
