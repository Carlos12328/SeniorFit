PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS permissoes;
DROP TABLE IF EXISTS atividades;
DROP TABLE IF EXISTS idosos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  tipoUsuario TEXT NOT NULL CHECK (tipoUsuario IN ('admin', 'acompanhante', 'profissional')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('pendente', 'ativo', 'bloqueado')),
  criadoEm TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE idosos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  idade INTEGER NOT NULL CHECK (idade BETWEEN 1 AND 130),
  idAcompanhante INTEGER,
  criadoEm TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (idAcompanhante) REFERENCES usuarios(id)
);

CREATE TABLE atividades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idIdoso INTEGER NOT NULL,
  idUsuario INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  duracao INTEGER NOT NULL CHECK (duracao BETWEEN 1 AND 480),
  dataAtividade TEXT NOT NULL,
  criadoEm TEXT NOT NULL DEFAULT (datetime('now')),
  atualizadoEm TEXT,
  FOREIGN KEY (idIdoso) REFERENCES idosos(id),
  FOREIGN KEY (idUsuario) REFERENCES usuarios(id)
);

CREATE TABLE permissoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idUsuario INTEGER NOT NULL,
  modulo TEXT NOT NULL,
  podeVisualizar INTEGER NOT NULL DEFAULT 0 CHECK (podeVisualizar IN (0, 1)),
  podeEditar INTEGER NOT NULL DEFAULT 0 CHECK (podeEditar IN (0, 1)),
  FOREIGN KEY (idUsuario) REFERENCES usuarios(id),
  UNIQUE (idUsuario, modulo)
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_idosos_acompanhante ON idosos(idAcompanhante);
CREATE INDEX idx_atividades_idoso ON atividades(idIdoso);
CREATE INDEX idx_atividades_data ON atividades(dataAtividade);
