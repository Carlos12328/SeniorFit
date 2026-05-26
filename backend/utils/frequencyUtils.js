'use strict';

function normalizarPeriodo(periodo) {
  if (!periodo || periodo === 'semana') return { valido: true, dias: 7, nome: 'semana' };
  if (periodo === 'mes') return { valido: true, dias: 30, nome: 'mes' };
  const dias = Number(periodo);
  if (Number.isInteger(dias) && dias >= 1 && dias <= 365) return { valido: true, dias, nome: String(dias) };
  return { valido: false, codigoErro: 'PERIODO_INVALIDO', mensagem: 'Período inválido' };
}

function calcularDataLimite(dias, hoje = new Date()) {
  const limite = new Date(hoje);
  limite.setHours(0, 0, 0, 0);
  limite.setDate(limite.getDate() - (dias - 1));
  return limite;
}

function calculateFrequency(atividades, periodo = 'semana', hoje = new Date()) {
  const periodoNormalizado = normalizarPeriodo(periodo);
  if (!periodoNormalizado.valido) {
    return { total: 0, diasAtivos: 0, mediaMinutos: 0, porDia: [], periodo: periodoNormalizado };
  }
  const lista = Array.isArray(atividades) ? atividades : [];
  const limite = calcularDataLimite(periodoNormalizado.dias, hoje);
  const porDiaMapa = new Map();
  let totalMinutos = 0;

  const dentroPeriodo = lista.filter((atividade) => {
    const data = new Date(`${atividade.dataAtividade}T00:00:00`);
    return !Number.isNaN(data.getTime()) && data >= limite;
  });

  dentroPeriodo.forEach((atividade) => {
    const dia = atividade.dataAtividade;
    porDiaMapa.set(dia, (porDiaMapa.get(dia) || 0) + 1);
    totalMinutos += Number(atividade.duracao || 0);
  });

  const porDia = Array.from(porDiaMapa.entries())
    .map(([data, quantidade]) => ({ data, quantidade }))
    .sort((a, b) => a.data.localeCompare(b.data));

  return {
    total: dentroPeriodo.length,
    diasAtivos: porDia.length,
    mediaMinutos: dentroPeriodo.length ? Math.round(totalMinutos / dentroPeriodo.length) : 0,
    porDia,
    periodo: periodoNormalizado.nome
  };
}

module.exports = { normalizarPeriodo, calculateFrequency };
