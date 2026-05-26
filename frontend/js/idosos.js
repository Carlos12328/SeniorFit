document.getElementById('navbar').innerHTML = navbarHtml();
if (configurarLayout('/idosos.html')) { carregarAcompanhantes(); carregarIdosos(); const f = document.getElementById('formIdoso'); if (f) f.addEventListener('submit', salvarIdoso); }
async function carregarAcompanhantes() {
  if (!temPermissao('usuarios', 'visualizar')) return;
  const resp = await api.usuarios.listar();
  const select = document.getElementById('acompanhanteIdoso');
  if (!select || !resp || !resp.ok) return;
  resp.dados.filter(u => u.tipoUsuario === 'acompanhante').forEach(u => select.insertAdjacentHTML('beforeend', `<option value="${u.id}">${u.nome}</option>`));
}
async function carregarIdosos() {
  const resp = await api.idosos.listar();
  const tbody = document.getElementById('tbodyIdosos');
  tbody.innerHTML = '';
  if (!resp || !resp.ok) return mostrarAlerta('msgIdosos', resp?.mensagem || 'Erro ao carregar idosos');
  resp.dados.forEach(i => tbody.insertAdjacentHTML('beforeend', `<tr><td>${i.nome}</td><td>${i.idade}</td><td>${i.nomeAcompanhante || '-'}</td></tr>`));
}
async function salvarIdoso(e) {
  e.preventDefault(); limparAlerta('msgIdosos');
  const dados = { nome: document.getElementById('nomeIdoso').value, idade: document.getElementById('idadeIdoso').value, idAcompanhante: document.getElementById('acompanhanteIdoso').value || null };
  const resp = await api.idosos.criar(dados);
  if (!resp || !resp.ok) return mostrarAlerta('msgIdosos', resp?.mensagem || 'Erro ao salvar idoso');
  mostrarAlerta('msgIdosos', 'Idoso cadastrado com sucesso', 'sucesso');
  document.getElementById('formIdoso').reset(); carregarIdosos();
}
