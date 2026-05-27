'use strict';

const { sucesso, erro } = require('../utils/responses');

function responderResultado(res, resultado, statusSucesso, mensagemSucesso) {
  if (!resultado.ok) {
    return erro(res, resultado.statusCode || 400, resultado.mensagem, resultado.codigoErro, resultado.detalhes);
  }
  return sucesso(res, statusSucesso, mensagemSucesso, resultado.dados);
}

module.exports = { responderResultado };
