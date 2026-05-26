'use strict';

function sucesso(res, statusCode, mensagem, dados = null) {
  const corpo = { status: 'sucesso', mensagem };
  if (dados !== null && dados !== undefined) corpo.dados = dados;
  return res.status(statusCode).json(corpo);
}

function erro(res, statusCode, mensagem, codigoErro, detalhes = null) {
  const corpo = { status: 'erro', mensagem, codigoErro };
  if (detalhes) corpo.detalhes = detalhes;
  return res.status(statusCode).json(corpo);
}

module.exports = { sucesso, erro };
