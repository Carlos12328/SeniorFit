document.getElementById('navbar').innerHTML = navbarHtml();
if (!configurarLayout('/usuarios.html')) { /* redireciona */ }

const usuario = obterUsuario();
if (usuario && usuario.tipoUsuario !== 'admin') {
  window.location.href = '/dashboard.html';
}

async function carregarPendentes() {
  const resposta = await api.usuarios.listarPendentes();
  const div = document.getElementById('listaPendentes');
  if (!resposta || !resposta.ok) {
    div.innerHTML = '<p class="small">Erro ao carregar pendentes.</p>';
    return;
  }
  if (resposta.dados.length === 0) {
    div.innerHTML = '<p class="small">Nenhum cadastro aguardando aprovação. 🎉</p>';
    return;
  }
  div.innerHTML = `
    <table>
      <thead>
        <tr><th>Nome</th><th>Email</th><th>Cadastrado em</th><th>Ações</th></tr>
      </thead>
      <tbody>
        ${resposta.dados.map(u => `
          <tr id="pendente-${u.id}">
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${formatarData(u.criadoEm)}</td>
            <td>
              <div class="actions" style="margin-top:0; gap:6px;">
                <button onclick="aprovar(${u.id})" style="padding:6px 12px; font-size:13px;">✅ Aprovar</button>
                <button onclick="rejeitar(${u.id})" class="perigo" style="padding:6px 12px; font-size:13px;">❌ Rejeitar</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function carregarUsuarios() {
  const resposta = await api.usuarios.listar();
  const tbody = document.getElementById('tbodyUsuarios');
  if (!resposta || !resposta.ok) {
    tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar usuários.</td></tr>';
    return;
  }
  tbody.innerHTML = resposta.dados.map(u => `
    <tr id="usuario-${u.id}">
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td><span class="badge badge-${u.tipoUsuario}">${u.tipoUsuario}</span></td>
      <td><span class="badge badge-status-${u.status}">${traduzirStatus(u.status)}</span></td>
      <td>
        <div class="actions" style="margin-top:0; gap:6px;">
          ${u.tipoUsuario !== 'admin' ? `
            <button onclick="abrirEdicao(${u.id}, '${u.nome}', '${u.email}')" style="padding:6px 12px; font-size:13px;">✏️ Editar</button>
            <button onclick="excluir(${u.id})" class="perigo" style="padding:6px 12px; font-size:13px;">🗑️ Excluir</button>
          ` : '<span class="small">—</span>'}
        </div>
      </td>
    </tr>
  `).join('');
}

function traduzirStatus(status) {
  return { ativo: '✅ Ativo', pendente: '⏳ Pendente', bloqueado: '🚫 Bloqueado' }[status] || status;
}

async function aprovar(id) {
  const resposta = await api.usuarios.aprovar(id);
  if (!resposta || !resposta.ok) return mostrarAlerta('msgPendentes', resposta?.mensagem || 'Erro ao aprovar', 'erro');
  mostrarAlerta('msgPendentes', '✅ Profissional aprovado com sucesso!', 'sucesso');
  const linha = document.getElementById('pendente-' + id);
  if (linha) linha.remove();
  carregarUsuarios();
}

async function rejeitar(id) {
  if (!confirm('Tem certeza que deseja rejeitar este cadastro?')) return;
  const resposta = await api.usuarios.rejeitar(id);
  if (!resposta || !resposta.ok) return mostrarAlerta('msgPendentes', resposta?.mensagem || 'Erro ao rejeitar', 'erro');
  mostrarAlerta('msgPendentes', 'Cadastro rejeitado.', 'sucesso');
  const linha = document.getElementById('pendente-' + id);
  if (linha) linha.remove();
  carregarUsuarios();
}

let editandoId = null;

function abrirEdicao(id, nome, email) {
  editandoId = id;
  document.getElementById('editNome').value = nome;
  document.getElementById('editEmail').value = email;
  document.getElementById('msgEdicao').style.display = 'none';
  document.getElementById('modalEdicao').style.display = 'flex';
}

function fecharEdicao() {
  editandoId = null;
  document.getElementById('modalEdicao').style.display = 'none';
}

async function salvarEdicao() {
  const nome  = document.getElementById('editNome').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  if (!nome || !email) return mostrarAlerta('msgEdicao', 'Nome e email são obrigatórios', 'erro');
  const resposta = await api.usuarios.editar(editandoId, { nome, email });
  if (!resposta || !resposta.ok) return mostrarAlerta('msgEdicao', resposta?.mensagem || 'Erro ao salvar', 'erro');
  fecharEdicao();
  carregarUsuarios();
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
  const resposta = await api.usuarios.excluir(id);
  if (!resposta || !resposta.ok) return mostrarAlerta('msgUsuarios', resposta?.mensagem || 'Erro ao excluir', 'erro');
  mostrarAlerta('msgUsuarios', 'Usuário excluído com sucesso.', 'sucesso');
  const linha = document.getElementById('usuario-' + id);
  if (linha) linha.remove();
}

carregarPendentes();
carregarUsuarios();
