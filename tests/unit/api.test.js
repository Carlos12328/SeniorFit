'use strict';

const request = require('supertest');
const app = require('../../backend/server');
const { inicializarBanco } = require('../../backend/database/init');
const { closeDb } = require('../../backend/database/connection');

async function login(email, senha = '123456') {
  const res = await request(app).post('/login').send({ email, senha });
  return res.body.dados.token;
}

beforeAll(async () => { await inicializarBanco(); });
afterAll(async () => { await closeDb(); });

describe('API — autenticação', () => {
  test('POST /login retorna token para credenciais válidas', async () => {
    const res = await request(app).post('/login').send({ email: 'admin@seniorfit.com', senha: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('sucesso');
    expect(res.body.dados.token).toBeDefined();
  });
  test('POST /login retorna 401 para senha inválida', async () => {
    const res = await request(app).post('/login').send({ email: 'admin@seniorfit.com', senha: 'errada123' });
    expect(res.status).toBe(401);
    expect(res.body.codigoErro).toBe('CREDENCIAIS_INVALIDAS');
  });
});

describe('API — perfis e isolamento de dados', () => {
  test('admin lista todos os idosos', async () => {
    const token = await login('admin@seniorfit.com');
    const res = await request(app).get('/idosos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.dados.length).toBeGreaterThanOrEqual(3);
  });
  test('acompanhante lista apenas idosos vinculados', async () => {
    const token = await login('ana@seniorfit.com');
    const res = await request(app).get('/idosos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.dados.every(i => i.idAcompanhante === 2)).toBe(true);
  });
  test('acompanhante não acessa histórico de idoso não vinculado', async () => {
    const token = await login('ana@seniorfit.com');
    const res = await request(app).get('/atividades?idIdoso=2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.codigoErro).toBe('IDOSO_NAO_VINCULADO');
  });
});

describe('API — criação e validação de recursos', () => {
  test('admin cria usuário profissional', async () => {
    const token = await login('admin@seniorfit.com');
    const res = await request(app).post('/usuarios').set('Authorization', `Bearer ${token}`).send({ nome: 'Profissional Teste', email: 'prof.teste@seniorfit.com', senha: '123456', tipoUsuario: 'profissional' });
    expect(res.status).toBe(201);
    expect(res.body.dados.tipoUsuario).toBe('profissional');
  });
  test('profissional cria idoso', async () => {
    const token = await login('paula@seniorfit.com');
    const res = await request(app).post('/idosos').set('Authorization', `Bearer ${token}`).send({ nome: 'Idoso Teste API', idade: 70, idAcompanhante: 2 });
    expect(res.status).toBe(201);
    expect(res.body.dados.nome).toBe('Idoso Teste API');
  });
  test('profissional registra atividade válida', async () => {
    const token = await login('paula@seniorfit.com');
    const res = await request(app).post('/atividades').set('Authorization', `Bearer ${token}`).send({ idIdoso: 1, tipo: 'Caminhada', descricao: 'Teste API', duracao: 25, dataAtividade: new Date().toISOString().slice(0, 10) });
    expect(res.status).toBe(201);
    expect(res.body.dados.duracao).toBe(25);
  });
  test('atividade com duração 481 retorna erro semântico', async () => {
    const token = await login('paula@seniorfit.com');
    const res = await request(app).post('/atividades').set('Authorization', `Bearer ${token}`).send({ idIdoso: 1, tipo: 'Caminhada', duracao: 481, dataAtividade: new Date().toISOString().slice(0, 10) });
    expect(res.status).toBe(400);
    expect(res.body.codigoErro).toBe('DURACAO_INVALIDA_MAXIMA');
  });
});

describe('API — frequência e edição', () => {
  test('GET /frequencia retorna métricas', async () => {
    const token = await login('admin@seniorfit.com');
    const res = await request(app).get('/frequencia?idIdoso=1&periodo=semana').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.dados.frequencia.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.dados.frequencia.porDia)).toBe(true);
  });
  test('PUT /atividades/:id edita duração que alimenta a frequência', async () => {
    const token = await login('admin@seniorfit.com');
    const res = await request(app).put('/atividades/1').set('Authorization', `Bearer ${token}`).send({ duracao: 60 });
    expect(res.status).toBe(200);
    expect(res.body.dados.duracao).toBe(60);
  });
});
