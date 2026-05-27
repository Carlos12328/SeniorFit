document.getElementById('navbar').innerHTML = navbarHtml();
if (!configurarLayout('/acompanhante.html')) { /* redireciona se não logado */ }

const usuario = obterUsuario();
if (usuario && usuario.tipoUsuario !== 'acompanhante') {
  window.location.href = '/dashboard.html';
}

async function carregarMeusIdosos() {
  const resposta = await api.idosos.listar();
  const tbody = document.getElementById('tbodyMeusIdosos');
  if (!resposta || !resposta.ok) {
    tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar.</td></tr>';
    return;
  }
  if (resposta.dados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="small">Você ainda não está vinculado a nenhum idoso.</td></tr>';
    return;
  }
  tbody.innerHTML = resposta.dados.map(i => `
    <tr>
      <td>${i.nome}</td>
      <td>${i.idade} anos</td>
    </tr>
  `).join('');
}

carregarMeusIdosos();
