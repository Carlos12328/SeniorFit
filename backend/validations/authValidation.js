'use strict';

function validateEmail(email) {
  if (!email || !String(email).trim()) {
    return { valido: false, codigoErro: 'EMAIL_AUSENTE', mensagem: 'Informe o email' };
  }
  const normalizado = String(email).trim().toLowerCase();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(normalizado)) {
    return { valido: false, codigoErro: 'EMAIL_INVALIDO', mensagem: 'Informe um email válido' };
  }
  return { valido: true, valor: normalizado };
}

function validatePassword(senha) {
  if (!senha) return { valido: false, codigoErro: 'SENHA_AUSENTE', mensagem: 'Informe a senha' };
  if (String(senha).length < 6) {
    return { valido: false, codigoErro: 'SENHA_CURTA', mensagem: 'A senha deve ter pelo menos 6 caracteres' };
  }
  return { valido: true };
}

function validateLogin(email, senha) {
  const emailValidado = validateEmail(email);
  if (!emailValidado.valido) return emailValidado;
  const senhaValidada = validatePassword(senha);
  if (!senhaValidada.valido) return senhaValidada;
  return { valido: true, email: emailValidado.valor };
}

module.exports = { validateEmail, validatePassword, validateLogin };
