'use strict';

const { validateEmail, validatePassword } = require('./authValidation');
const TIPOS_USUARIO = ['admin', 'acompanhante', 'profissional'];

function validateUser(dados) {
  if (!dados || !dados.nome || !String(dados.nome).trim()) {
    return { valido: false, codigoErro: 'NOME_AUSENTE', mensagem: 'Informe o nome do usuário' };
  }
  const email = validateEmail(dados.email);
  if (!email.valido) return email;
  const senha = validatePassword(dados.senha);
  if (!senha.valido) return senha;
  if (!dados.tipoUsuario || !TIPOS_USUARIO.includes(dados.tipoUsuario)) {
    return { valido: false, codigoErro: 'TIPO_USUARIO_INVALIDO', mensagem: 'Tipo de usuário inválido' };
  }
  return {
    valido: true,
    dados: {
      nome: String(dados.nome).trim(),
      email: email.valor,
      senha: String(dados.senha),
      tipoUsuario: dados.tipoUsuario
    }
  };
}

module.exports = { validateUser, TIPOS_USUARIO };
