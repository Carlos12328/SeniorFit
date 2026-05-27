'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb, closeDb } = require('./connection');

async function inserirUsuario(db, usuario) {
  const senhaHash = await bcrypt.hash(usuario.senha, 10);
  const resultado = await db.run(
    'INSERT INTO usuarios (nome, email, senha, tipoUsuario) VALUES (?, ?, ?, ?)',
    [usuario.nome, usuario.email, senhaHash, usuario.tipoUsuario]
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

  const adminId = await inserirUsuario(db, { nome: 'Administrador SeniorFit', email: 'admin@seniorfit.com', senha: '123456', tipoUsuario: 'admin' });
  const acompanhanteId = await inserirUsuario(db, { nome: 'Ana Acompanhante', email: 'ana@seniorfit.com', senha: '123456', tipoUsuario: 'acompanhante' });
  const acompanhante2Id = await inserirUsuario(db, { nome: 'Carlos Acompanhante', email: 'carlos@seniorfit.com', senha: '123456', tipoUsuario: 'acompanhante' });
  const profissionalId = await inserirUsuario(db, { nome: 'Dra. Paula Profissional', email: 'paula@seniorfit.com', senha: '123456', tipoUsuario: 'profissional' });

  for (const [id, tipo] of [[adminId, 'admin'], [acompanhanteId, 'acompanhante'], [acompanhante2Id, 'acompanhante'], [profissionalId, 'profissional']]) {
    await inserirPermissoesPadrao(db, id, tipo);
  }

  await db.run('INSERT INTO idosos (nome, idade, idAcompanhante) VALUES (?, ?, ?)', ['Maria das Dores', 72, acompanhanteId]);
  await db.run('INSERT INTO idosos (nome, idade, idAcompanhante) VALUES (?, ?, ?)', ['João Ferreira', 81, acompanhante2Id]);
  await db.run('INSERT INTO idosos (nome, idade, idAcompanhante) VALUES (?, ?, ?)', ['Helena Souza', 68, acompanhanteId]);

  await db.run('INSERT INTO atividades (idIdoso, idUsuario, tipo, descricao, duracao, dataAtividade) VALUES (?, ?, ?, ?, ?, date(\'now\'))', [1, profissionalId, 'Caminhada', 'Caminhada leve no parque', 30]);
  await db.run('INSERT INTO atividades (idIdoso, idUsuario, tipo, descricao, duracao, dataAtividade) VALUES (?, ?, ?, ?, ?, date(\'now\', \'-1 day\'))', [1, acompanhanteId, 'Alongamento', 'Alongamento assistido', 20]);
  await db.run('INSERT INTO atividades (idIdoso, idUsuario, tipo, descricao, duracao, dataAtividade) VALUES (?, ?, ?, ?, ?, date(\'now\', \'-2 day\'))', [2, profissionalId, 'Hidroginástica', 'Aula em grupo', 45]);

  await closeDb();
}

if (require.main === module) {
  inicializarBanco()
    .then(() => console.log('Banco SeniorFit inicializado com sucesso.'))
    .catch((erro) => {
      console.error('Erro ao inicializar banco:', erro);
      process.exit(1);
    });
}

module.exports = { inicializarBanco, inserirPermissoesPadrao };
