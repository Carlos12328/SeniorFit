if (localStorage.getItem('seniorfit_token')) window.location.href = '/dashboard.html';
document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  limparAlerta('msgErroLogin');
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  if (!email) return mostrarAlerta('msgErroLogin', 'Informe o email');
  if (!senha) return mostrarAlerta('msgErroLogin', 'Informe a senha');
  const btn = document.getElementById('btnLogin');
  btn.disabled = true;
  const resposta = await api.login(email, senha);
  btn.disabled = false;
  if (!resposta || !resposta.ok) return mostrarAlerta('msgErroLogin', resposta?.mensagem || 'Erro ao fazer login');
  salvarSessao(resposta.dados);
  window.location.href = '/dashboard.html';
});
