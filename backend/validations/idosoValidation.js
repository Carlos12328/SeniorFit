'use strict';

function validateIdoso(dados) {
  if (!dados || !dados.nome || !String(dados.nome).trim()) {
    return { valido: false, codigoErro: 'NOME_IDOSO_AUSENTE', mensagem: 'Informe o nome do idoso' };
  }
  if (dados.idade === null || dados.idade === undefined || dados.idade === '') {
    return { valido: false, codigoErro: 'IDADE_AUSENTE', mensagem: 'Informe a idade do idoso' };
  }
  const idade = Number(dados.idade);
  if (!Number.isInteger(idade) || idade < 1) {
    return { valido: false, codigoErro: 'IDADE_INVALIDA_MINIMA', mensagem: 'A idade deve ser de pelo menos 1 ano' };
  }
  if (idade > 130) {
    return { valido: false, codigoErro: 'IDADE_INVALIDA_MAXIMA', mensagem: 'A idade não pode exceder 130 anos' };
  }
  return {
    valido: true,
    dados: {
      nome: String(dados.nome).trim(),
      idade,
      idAcompanhante: dados.idAcompanhante ? Number(dados.idAcompanhante) : null
    }
  };
}

module.exports = { validateIdoso };
