document.getElementById('navbar').innerHTML = navbarHtml();
if (configurarLayout('/dashboard.html')) {
  carregarIdososDashboard();
  document.getElementById('btnConsultar').addEventListener('click', consultarFrequencia);
}
async function carregarIdososDashboard() {
  const resp = await api.idosos.listar();
  const select = document.getElementById('idosoDash');
  if (!resp || !resp.ok) return mostrarAlerta('msgDash', resp?.mensagem || 'Erro ao carregar idosos');
  resp.dados.forEach(i => select.insertAdjacentHTML('beforeend', `<option value="${i.id}">${i.nome} (${i.idade} anos)</option>`));
}
async function consultarFrequencia() {
  limparAlerta('msgDash');
  const idIdoso = document.getElementById('idosoDash').value;
  const periodo = document.getElementById('periodoDash').value;
  if (!idIdoso) return mostrarAlerta('msgDash', 'Selecione um idoso para consultar a frequência');
  const resp = await api.frequencia.consultar(idIdoso, periodo);
  if (!resp || !resp.ok) return mostrarAlerta('msgDash', resp?.mensagem || 'Erro ao consultar frequência');
  const { idoso, frequencia } = resp.dados;
  document.getElementById('resultadoFrequencia').classList.remove('oculto');
  document.getElementById('tituloFrequencia').textContent = `${idoso.nome} — período: ${frequencia.periodo}`;
  document.getElementById('metricaTotal').textContent = frequencia.total;
  document.getElementById('metricaDias').textContent = frequencia.diasAtivos;
  document.getElementById('metricaMedia').textContent = frequencia.mediaMinutos + ' min';
  const tbody = document.getElementById('tbodyFrequencia');
  tbody.innerHTML = '';
  frequencia.porDia.forEach(item => tbody.insertAdjacentHTML('beforeend', `<tr><td>${formatarData(item.data)}</td><td>${item.quantidade}</td></tr>`));
  if (!frequencia.porDia.length) tbody.innerHTML = '<tr><td colspan="2">Nenhuma atividade no período.</td></tr>';
}
