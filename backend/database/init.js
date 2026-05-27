'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb, closeDb } = require('./connection');

async function inserirUsuario(db, usuario) {
  const senhaHash = await bcrypt.hash(usuario.senha, 10);
  const status = usuario.status || 'ativo';
  const resultado = await db.run(
    'INSERT INTO usuarios (nome, email, senha, tipoUsuario, status) VALUES (?, ?, ?, ?, ?)',
    [usuario.nome, usuario.email, senhaHash, usuario.tipoUsuario, status]
  );
  return resultado.lastID;
}

async function inserirPermissoesPadrao(db, idUsuario, tipoUsuario) {
  const permissoesPorPerfil = {
    admin: [
      ['usuarios', 1, 1], ['idosos', 1, 1], ['atividades', 1, 1], ['historico', 1, 1], ['frequencia', 1, 1]
    ],
    acompanhante: [
      ['usuarios', 0, 0], ['idosos', 1, 0], ['atividades', 1, 1], ['historico', 1, 0], ['frequencia', 1, 0]
    ],
    profissional: [
      ['usuarios', 0, 0], ['idosos', 1, 1], ['atividades', 1, 1], ['historico', 1, 0], ['frequencia', 1, 1]
    ]
  };

  for (const [modulo, podeVisualizar, podeEditar] of permissoesPorPerfil[tipoUsuario]) {
    await db.run(
      'INSERT INTO permissoes (idUsuario, modulo, podeVisualizar, podeEditar) VALUES (?, ?, ?, ?)',
      [idUsuario, modulo, podeVisualizar, podeEditar]
    );
  }
}

async function inicializarBanco() {
  const db = await getDb();
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await db.exec(schema);

  const adminId      = await inserirUsuario(db, { nome: 'Administrador SeniorFit', email: 'admin@seniorfit.com', senha: '123456', tipoUsuario: 'admin', status: 'ativo' });
  const anaId        = await inserirUsuario(db, { nome: 'Ana Acompanhante', email: 'ana@seniorfit.com', senha: '123456', tipoUsuario: 'acompanhante', status: 'ativo' });
  const carlosId     = await inserirUsuario(db, { nome: 'Carlos Acompanhante', email: 'carlos@seniorfit.com', senha: '123456', tipoUsuario: 'acompanhante', status: 'ativo' });
  const paulaId      = await inserirUsuario(db, { nome: 'Dra. Paula Profissional', email: 'paula@seniorfit.com', senha: '123456', tipoUsuario: 'profissional', status: 'ativo' });

  for (const [id, tipo] of [[adminId, 'admin'], [anaId, 'acompanhante'], [carlosId, 'acompanhante'], [paulaId, 'profissional']]) {
    await inserirPermissoesPadrao(db, id, tipo);
  }

  await db.run('INSERT INTO idosos (nome, idade, idAcompanhante) VALUES (?, ?, ?)', ['Maria das Dores', 72, anaId]);
  await db.run('INSERT INTO idosos (nome, idade, idAcompanhante) VALUES (?, ?, ?)', ['João Ferreira', 81, carlosId]);
  await db.run('INSERT INTO idosos (nome, idade, idAcompanhante) VALUES (?, ?, ?)', ['Antônia Silva', 68, null]);

  console.log('Banco inicializado com sucesso!');
  await closeDb();
}

module.exports = { inserirPermissoesPadrao };

inicializarBanco().catch(err => { console.error('Erro ao inicializar banco:', err); process.exit(1); });
