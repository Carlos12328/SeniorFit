const API_BASE = '';

async function apiRequest(endpoint, opcoes = {}) {
  const token = localStorage.getItem('seniorfit_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const config = { method: opcoes.method || 'GET', headers };
  if (opcoes.body) config.body = JSON.stringify(opcoes.body);
  try {
    const resposta = await fetch(API_BASE + endpoint, config);
    const dados = await resposta.json();
    if (resposta.status === 401 && endpoint !== '/login') {
      localStorage.clear();
      window.location.href = '/login.html';
      return null;
    }
    return { ok: resposta.ok, statusCode: resposta.status, ...dados };
  } catch (erro) {
    return { ok: false, status: 'erro', mensagem: 'Erro de conexão com o servidor', codigoErro: 'ERRO_REDE' };
  }
}

const api = {
  login: (email, senha) => apiRequest('/login', { method: 'POST', body: { email, senha } }),
  cadastro: (dados) => apiRequest('/cadastro', { method: 'POST', body: dados }),
  usuarios: {
    criar: (dados) => apiRequest('/usuarios', { method: 'POST', body: dados }),
    listar: () => apiRequest('/usuarios'),
    listarPendentes: () => apiRequest('/usuarios/pendentes'),
    aprovar: (id) => apiRequest('/usuarios/' + id + '/aprovar', { method: 'PATCH' }),
    rejeitar: (id) => apiRequest('/usuarios/' + id + '/rejeitar', { method: 'PATCH' }),
    editar: (id, dados) => apiRequest('/usuarios/' + id, { method: 'PUT', body: dados }),
    excluir: (id) => apiRequest('/usuarios/' + id, { method: 'DELETE' })
  },
  idosos: {
    criar: (dados) => apiRequest('/idosos', { method: 'POST', body: dados }),
    listar: () => apiRequest('/idosos'),
    semAcompanhante: () => apiRequest('/idosos/sem-acompanhante'),
    vincular: (id) => apiRequest('/idosos/' + id + '/vincular', { method: 'PATCH' })
  },
  atividades: {
    tipos: () => apiRequest('/tipos-atividades'),
    criar: (dados) => apiRequest('/atividades', { method: 'POST', body: dados }),
    editar: (id, dados) => apiRequest('/atividades/' + id, { method: 'PUT', body: dados }),
    listar: (filtros = {}) => {
      const qs = new URLSearchParams(filtros).toString();
      return apiRequest('/atividades' + (qs ? '?' + qs : ''));
    }
  },
  frequencia: {
    consultar: (idIdoso, periodo) => apiRequest('/frequencia?idIdoso=' + encodeURIComponent(idIdoso) + '&periodo=' + encodeURIComponent(periodo || 'semana'))
  }
};

function salvarSessao(dados) {
  localStorage.setItem('seniorfit_token', dados.token);
  localStorage.setItem('seniorfit_usuario', JSON.stringify(dados.usuario));
  localStorage.setItem('seniorfit_permissoes', JSON.stringify(dados.permissoes || []));
}
function obterUsuario() { try { return JSON.parse(localStorage.getItem('seniorfit_usuario')); } catch { return null; } }
function obterPermissoes() { try { return JSON.parse(localStorage.getItem('seniorfit_permissoes')) || []; } catch { return []; } }
function sair() { localStorage.clear(); window.location.href = '/login.html'; }
function exigirLogin() { if (!localStorage.getItem('seniorfit_token')) { window.location.href = '/login.html'; return false; } return true; }
function temPermissao(modulo, acao) { const p = obterPermissoes().find(x => x.modulo === modulo); return !!p && Number(acao === 'editar' ? p.podeEditar : p.podeVisualizar) === 1; }

function mostrarAlerta(id, mensagem, tipo = 'erro') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = mensagem;
  el.className = 'alerta alerta-' + tipo;
  el.style.display = 'block';
}
function limparAlerta(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.style.display = 'none';
}
function formatarData(data) {
  if (!data) return '-';
  const [a, m, d] = data.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}
function dataHoje() { return new Date().toISOString().slice(0, 10); }

function configurarLayout(pagina) {
  if (!exigirLogin()) return false;
  const usuario = obterUsuario();
  const nome = document.getElementById('nomeUsuario');
  const perfil = document.getElementById('perfilUsuario');
  if (nome && usuario) nome.textContent = usuario.nome;
  if (perfil && usuario) perfil.textContent = usuario.tipoUsuario;

  document.querySelectorAll('[data-permissao]').forEach(el => {
    const [modulo, acao] = el.dataset.permissao.split(':');
    if (!temPermissao(modulo, acao || 'visualizar')) el.classList.add('oculto');
  });

  // "Meu vínculo" só aparece para acompanhante
  const linkVinculo = document.getElementById('linkMeuVinculo');
  if (linkVinculo) {
    linkVinculo.style.display = (usuario && usuario.tipoUsuario === 'acompanhante') ? 'inline-block' : 'none';
  }

  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === pagina) a.classList.add('ativo');
  });

  const btn = document.getElementById('btnSair');
  if (btn) btn.addEventListener('click', sair);
  return true;
}

function navbarHtml() {
  return `
    <div class="navbar">
      <div class="container">
        <div class="brand">
          <div class="logo">SF</div>
          <div>
            <strong>SeniorFit</strong>
            <div class="small">Usuário: <span id="nomeUsuario"></span> · <span id="perfilUsuario"></span></div>
          </div>
        </div>
        <div class="nav-links">
          <a href="/dashboard.html">Dashboard</a>
          <a href="/idosos.html" data-permissao="idosos:visualizar">Idosos</a>
          <a href="/acompanhante.html" id="linkMeuVinculo" style="display:none">Meu vínculo</a>
          <a href="/atividades.html" data-permissao="atividades:editar">Atividades</a>
          <a href="/historico.html" data-permissao="historico:visualizar">Histórico</a>
          <a href="/usuarios.html" data-permissao="usuarios:visualizar">Usuários</a>
          <button id="btnSair" type="button">Sair</button>
        </div>
      </div>
    </div>`;
}
