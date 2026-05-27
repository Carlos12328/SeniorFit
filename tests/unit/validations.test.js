'use strict';

const { validateLogin } = require('../../backend/validations/authValidation');
const { validateDuration } = require('../../backend/validations/durationValidation');
const { validateDate, isFutureDate } = require('../../backend/validations/dateValidation');
const { validateIdoso } = require('../../backend/validations/idosoValidation');
const { validateActivity } = require('../../backend/validations/activityValidation');
const { hasModuleAccess, podeAcessarIdoso } = require('../../backend/middleware/permissions');
const { normalizarPeriodo, calculateFrequency } = require('../../backend/utils/frequencyUtils');

function hojeIso() { return new Date().toISOString().slice(0, 10); }
function amanhaIso() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }

describe('EP e BVA2 — login', () => {
  test('email ausente retorna EMAIL_AUSENTE', () => expect(validateLogin('', '123456').codigoErro).toBe('EMAIL_AUSENTE'));
  test('email inválido retorna EMAIL_INVALIDO', () => expect(validateLogin('email-invalido', '123456').codigoErro).toBe('EMAIL_INVALIDO'));
  test('senha ausente retorna SENHA_AUSENTE', () => expect(validateLogin('a@b.com', '').codigoErro).toBe('SENHA_AUSENTE'));
  test('senha com 5 caracteres retorna SENHA_CURTA', () => expect(validateLogin('a@b.com', '12345').codigoErro).toBe('SENHA_CURTA'));
  test('senha com 6 caracteres é válida', () => expect(validateLogin('a@b.com', '123456').valido).toBe(true));
});

describe('BVA2 — duração da atividade', () => {
  test('0 é inválido pela borda mínima', () => expect(validateDuration(0).codigoErro).toBe('DURACAO_INVALIDA_MINIMA'));
  test('1 é válido pela borda mínima', () => expect(validateDuration(1).valido).toBe(true));
  test('480 é válido pela borda máxima', () => expect(validateDuration(480).valido).toBe(true));
  test('481 é inválido pela borda máxima', () => expect(validateDuration(481).codigoErro).toBe('DURACAO_INVALIDA_MAXIMA'));
});

describe('BVA2 — data da atividade', () => {
  test('hoje não é futuro', () => expect(isFutureDate(hojeIso())).toBe(false));
  test('amanhã é futuro', () => expect(isFutureDate(amanhaIso())).toBe(true));
  test('data ausente retorna DATA_AUSENTE', () => expect(validateDate('').codigoErro).toBe('DATA_AUSENTE'));
  test('data futura retorna DATA_FUTURA', () => expect(validateDate(amanhaIso()).codigoErro).toBe('DATA_FUTURA'));
});

describe('BVA2 — idade do idoso', () => {
  test('idade 0 é inválida', () => expect(validateIdoso({ nome: 'Teste', idade: 0 }).codigoErro).toBe('IDADE_INVALIDA_MINIMA'));
  test('idade 1 é válida', () => expect(validateIdoso({ nome: 'Teste', idade: 1 }).valido).toBe(true));
  test('idade 130 é válida', () => expect(validateIdoso({ nome: 'Teste', idade: 130 }).valido).toBe(true));
  test('idade 131 é inválida', () => expect(validateIdoso({ nome: 'Teste', idade: 131 }).codigoErro).toBe('IDADE_INVALIDA_MAXIMA'));
});

describe('EP — atividade', () => {
  test('idoso ausente retorna IDOSO_AUSENTE', () => expect(validateActivity({ tipo: 'Caminhada', duracao: 30, dataAtividade: hojeIso() }).codigoErro).toBe('IDOSO_AUSENTE'));
  test('tipo não pré-cadastrado retorna TIPO_ATIVIDADE_INVALIDO', () => expect(validateActivity({ idIdoso: 1, tipo: 'Corrida extrema', duracao: 30, dataAtividade: hojeIso() }).codigoErro).toBe('TIPO_ATIVIDADE_INVALIDO'));
  test('atividade válida retorna dados normalizados', () => expect(validateActivity({ idIdoso: 1, tipo: 'Caminhada', duracao: '30', dataAtividade: hojeIso() }).dados.duracao).toBe(30));
});

describe('Tabela de Decisão — permissões e vínculo de idoso', () => {
  const permissoes = [{ modulo: 'idosos', podeVisualizar: 1, podeEditar: 0 }];
  test('visualizar módulo permitido retorna true', () => expect(hasModuleAccess(permissoes, 'idosos', 'visualizar')).toBe(true));
  test('editar módulo sem permissão retorna false', () => expect(hasModuleAccess(permissoes, 'idosos', 'editar')).toBe(false));
  test('admin acessa qualquer idoso', () => expect(podeAcessarIdoso({ id: 1, tipoUsuario: 'admin' }, { idAcompanhante: 99 })).toBe(true));
  test('profissional acessa qualquer idoso', () => expect(podeAcessarIdoso({ id: 4, tipoUsuario: 'profissional' }, { idAcompanhante: 99 })).toBe(true));
  test('acompanhante acessa idoso vinculado', () => expect(podeAcessarIdoso({ id: 2, tipoUsuario: 'acompanhante' }, { idAcompanhante: 2 })).toBe(true));
  test('acompanhante não acessa idoso não vinculado', () => expect(podeAcessarIdoso({ id: 2, tipoUsuario: 'acompanhante' }, { idAcompanhante: 3 })).toBe(false));
});

describe('Frequência — período e ordenação cronológica', () => {
  test('período inválido é rejeitado', () => expect(normalizarPeriodo('abc').codigoErro).toBe('PERIODO_INVALIDO'));
  test('frequência por dia vem ordenada da data mais antiga para a mais recente', () => {
    const freq = calculateFrequency([
      { dataAtividade: hojeIso(), duracao: 30 },
      { dataAtividade: '2026-05-24', duracao: 20 },
      { dataAtividade: '2026-05-25', duracao: 10 }
    ], '365', new Date('2026-05-26T00:00:00'));
    expect(freq.porDia.map(x => x.data)).toEqual(['2026-05-24', '2026-05-25', hojeIso()]);
  });
});
