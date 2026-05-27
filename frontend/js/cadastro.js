if (localStorage.getItem('seniorfit_token')) window.location.href = '/dashboard.html';

document.getElementById('tipoUsuario').addEventListener('change', function () {
  const aviso = document.getElementById('avisoAprovacao');
  aviso.style.display = this.value === 'profissional' ? 'block' : 'none';
});

document.getElementById('formCadastro').addEventListener('submit', async (e) => {
  e.preventDefault();
  limparAlerta('msgCadastro');

  const nome        = document.getElementById('nome').value.trim();
  const email       = document.getElementById('email').value.trim();
  const tipoUsuario = document.getElementById('tipoUsuario').value;
  const senha       = document.getElementById('senha').value;
  const confirmar   = document.getElementById('confirmarSenha').value;

  if (!nome)          return mostrarAlerta('msgCadastro', 'Informe seu nome completo');
  if (!email)         return mostrarAlerta('msgCadastro', 'Informe seu email');
  if (!tipoUsuario)   return mostrarAlerta('msgCadastro', 'Selecione seu perfil');
  if (!senha)         return mostrarAlerta('msgCadastro', 'Informe uma senha');
  if (senha.length < 6) return mostrarAlerta('msgCadastro', 'A senha deve ter pelo menos 6 caracteres');
  if (senha !== confirmar) return mostrarAlerta('msgCadastro', 'As senhas não coincidem');

  const btn = document.getElementById('btnCadastrar');
  btn.disabled = true;
  btn.textContent = 'Cadastrando...';

  const resposta = await api.cadastro({ nome, email, senha, tipoUsuario });

  btn.disabled = false;
  btn.textContent = 'Criar conta';

  if (!resposta || !resposta.ok) {
    return mostrarAlerta('msgCadastro', resposta?.mensagem || 'Erro ao criar conta');
  }

  if (tipoUsuario === 'profissional') {
    mostrarAlerta('msgCadastro', '✅ Cadastro enviado! Aguarde a aprovação do administrador para acessar o sistema.', 'sucesso');
  } else {
    mostrarAlerta('msgCadastro', '✅ Conta criada com sucesso! Você já pode fazer login.', 'sucesso');
  }

  document.getElementById('formCadastro').reset();
  document.getElementById('avisoAprovacao').style.display = 'none';

  if (tipoUsuario === 'acompanhante') {
    setTimeout(() => { window.location.href = '/login.html'; }, 2000);
  }
});
