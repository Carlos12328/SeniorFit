document.getElementById('navbar').innerHTML = navbarHtml();
if (configurarLayout('/idosos.html')) {
  carregarAcompanhantes();
  carregarIdosos();
  const f = document.getElementById('formIdoso');
  if (f) f.addEventListener('submit', salvarIdoso);
}

async function carregarAcompanhantes(selectId = 'acompanhanteIdoso') {
  if (!temPermissao('usuarios', 'visualizar')) return;
  const resp = await api.usuarios.listar();
  const select = document.getElementById(selectId);
  if (!select || !resp || !resp.ok) return;
  resp.dados
    .filter(u => u.tipoUsuario === 'acompanhante')
    .forEach(u => select.insertAdjacentHTML('beforeend', `<option value="${u.id}">${u.nome}</option>`));
}

async function carregarIdosos() {
  const resp = await api.idosos.listar();
  const tbody = document.getElementById('tbodyIdosos');
  tbody.innerHTML = '';
  if (!resp || !resp.ok) return mostrarAlerta('msgIdosos', resp?.mensagem || 'Erro ao carregar idosos');
  if (!resp.dados.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="small">Nenhum idoso cadastrado ainda.</td></tr>';
    return;
  }
  const podeEditar = temPermissao('idosos', 'editar');
  tbody.innerHTML = resp.dados.map(i => `
    <tr id="idoso-${i.id}">
      <td>${i.nome}</td>
      <td>${i.idade}</td>
      <td>${i.nomeAcompanhante || '-'}</td>
      <td>
        ${podeEditar ? `
          <div class="actions" style="margin-top:0; gap:6px;">
            <button onclick="abrirEdicaoIdoso(${i.id}, '${i.nome}', ${i.idade}, ${i.idAcompanhante || 'null'})" style="padding:6px 12px; font-size:13px;">✏️ Editar</button>
            <button onclick="excluirIdoso(${i.id})" class="perigo" style="padding:6px 12px; font-size:13px;">🗑️ Excluir</button>
          </div>
        ` : '-'}
      </td>
    </tr>
  `).join('');
}

async function salvarIdoso(e) {
  e.preventDefault();
  limparAlerta('msgIdosos');
  const dados = {
    nome: document.getElementById('nomeIdoso').value,
    idade: document.getElementById('idadeIdoso').value,
    idAcompanhante: document.getElementById('acompanhanteIdoso').value || null
  };
  const resp = await api.idosos.criar(dados);
  if (!resp || !resp.ok) return mostrarAlerta('msgIdosos', resp?.mensagem || 'Erro ao salvar idoso');
  mostrarAlerta('msgIdosos', 'Idoso cadastrado com sucesso!', 'sucesso');
  document.getElementById('formIdoso').reset();
  carregarIdosos();
}

// Modal de edição
let editandoIdosoId = null;

async function abrirEdicaoIdoso(id, nome, idade, idAcompanhante) {
  editandoIdosoId = id;
  document.getElementById('editNomeIdoso').value = nome;
  document.getElementById('editIdadeIdoso').value = idade;
  document.getElementById('msgEdicaoIdoso').style.display = 'none';

  // Carrega acompanhantes no select do modal
  const select = document.getElementById('editAcompanhanteIdoso');
  select.innerHTML = '<option value="">Sem acompanhante</option>';
  await carregarAcompanhantes('editAcompanhanteIdoso');
  if (idAcompanhante) select.value = idAcompanhante;

  document.getElementById('modalEdicaoIdoso').style.display = 'flex';
}

function fecharEdicaoIdoso() {
  editandoIdosoId = null;
  document.getElementById('modalEdicaoIdoso').style.display = 'none';
}

async function salvarEdicaoIdoso() {
  const nome  = document.getElementById('editNomeIdoso').value.trim();
  const idade = document.getElementById('editIdadeIdoso').value;
  const idAcompanhante = document.getElementById('editAcompanhanteIdoso').value || null;

  if (!nome)  return mostrarAlerta('msgEdicaoIdoso', 'Nome é obrigatório', 'erro');
  if (!idade) return mostrarAlerta('msgEdicaoIdoso', 'Idade é obrigatória', 'erro');

  const resp = await api.idosos.editar(editandoIdosoId, { nome, idade, idAcompanhante });
  if (!resp || !resp.ok) return mostrarAlerta('msgEdicaoIdoso', resp?.mensagem || 'Erro ao salvar', 'erro');

  fecharEdicaoIdoso();
  carregarIdosos();
}

async function excluirIdoso(id) {
  if (!confirm('Tem certeza que deseja excluir este idoso? Esta ação não pode ser desfeita.')) return;
  const resp = await api.idosos.excluir(id);
  if (!resp || !resp.ok) return mostrarAlerta('msgIdosos', resp?.mensagem || 'Erro ao excluir', 'erro');
  mostrarAlerta('msgIdosos', 'Idoso excluído com sucesso.', 'sucesso');
  const linha = document.getElementById('idoso-' + id);
  if (linha) linha.remove();
}
