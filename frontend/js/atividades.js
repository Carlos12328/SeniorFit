document.getElementById('navbar').innerHTML = navbarHtml();
if (configurarLayout('/atividades.html')) {
  carregarIdosos();
  carregarTipos();
  carregarAtividades();
  document.getElementById('formAtividade').addEventListener('submit', salvarAtividade);
}

async function carregarIdosos() {
  const resp = await api.idosos.listar();
  const select = document.getElementById('idIdoso');
  if (!resp || !resp.ok) return;
  resp.dados.forEach(i => select.insertAdjacentHTML('beforeend',
    `<option value="${i.id}">${i.nome} (${i.idade} anos)</option>`
  ));
}

async function carregarTipos() {
  const resp = await api.atividades.tipos();
  const select = document.getElementById('tipo');
  if (!resp || !resp.ok) return;
  resp.dados.forEach(t => select.insertAdjacentHTML('beforeend',
    `<option value="${t}">${t}</option>`
  ));
}

async function carregarAtividades() {
  const resp = await api.atividades.listar();
  const tbody = document.getElementById('tbodyAtividades');
  if (!resp || !resp.ok) {
    tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar atividades.</td></tr>';
    return;
  }
  if (!resp.dados.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="small">Nenhuma atividade registrada ainda.</td></tr>';
    return;
  }
  tbody.innerHTML = resp.dados.map(a => `
    <tr>
      <td>${formatarData(a.dataAtividade)}</td>
      <td>${a.nomeIdoso}</td>
      <td>${a.tipo}</td>
      <td>${a.duracao} min</td>
      <td>${a.descricao || '-'}</td>
      <td>${a.nomeUsuario}</td>
    </tr>
  `).join('');
}

async function salvarAtividade(e) {
  e.preventDefault();
  limparAlerta('msgAtividades');

  const dados = {
    idIdoso:       document.getElementById('idIdoso').value,
    tipo:          document.getElementById('tipo').value,
    duracao:       document.getElementById('duracao').value,
    dataAtividade: document.getElementById('dataAtividade').value,
    descricao:     document.getElementById('descricao').value
  };

  if (!dados.idIdoso)       return mostrarAlerta('msgAtividades', 'Selecione um idoso');
  if (!dados.tipo)          return mostrarAlerta('msgAtividades', 'Selecione o tipo de atividade');
  if (!dados.duracao)       return mostrarAlerta('msgAtividades', 'Informe a duração');
  if (!dados.dataAtividade) return mostrarAlerta('msgAtividades', 'Informe a data');

  const resp = await api.atividades.criar(dados);
  if (!resp || !resp.ok) return mostrarAlerta('msgAtividades', resp?.mensagem || 'Erro ao registrar atividade');

  mostrarAlerta('msgAtividades', 'Atividade registrada com sucesso!', 'sucesso');
  document.getElementById('formAtividade').reset();
  carregarAtividades();
}
