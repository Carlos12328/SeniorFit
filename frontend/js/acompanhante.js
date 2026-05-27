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

async function carregarDisponiveis() {
  const resposta = await api.idosos.semAcompanhante();
  const div = document.getElementById('listaDisponiveis');

  if (!resposta || !resposta.ok) {
    div.innerHTML = '<p class="small">Erro ao carregar idosos disponíveis.</p>';
    return;
  }

  if (resposta.dados.length === 0) {
    div.innerHTML = '<p class="small">Nenhum idoso disponível para vínculo no momento.</p>';
    return;
  }

  div.innerHTML = `
    <table>
      <thead>
        <tr><th>Nome</th><th>Idade</th><th>Ação</th></tr>
      </thead>
      <tbody>
        ${resposta.dados.map(i => `
          <tr id="disponivel-${i.id}">
            <td>${i.nome}</td>
            <td>${i.idade} anos</td>
            <td>
              <button
                onclick="vincular(${i.id})"
                style="padding:6px 12px; font-size:13px;"
                data-test="btn-vincular-${i.id}">
                🔗 Vincular-me
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function vincular(idIdoso) {
  if (!confirm('Deseja se vincular a este idoso?')) return;

  const resposta = await api.idosos.vincular(idIdoso);
  if (!resposta || !resposta.ok) {
    return mostrarAlerta('msgVincular', resposta?.mensagem || 'Erro ao vincular', 'erro');
  }

  mostrarAlerta('msgVincular', '✅ Vínculo realizado com sucesso!', 'sucesso');

  // Remove da lista de disponíveis e atualiza meus idosos
  const linha = document.getElementById('disponivel-' + idIdoso);
  if (linha) linha.remove();
  carregarMeusIdosos();
}

carregarMeusIdosos();
carregarDisponiveis();
