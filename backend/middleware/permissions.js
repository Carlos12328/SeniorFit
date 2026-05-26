'use strict';

function hasModuleAccess(permissoes, modulo, acao) {
  if (!Array.isArray(permissoes)) return false;
  const item = permissoes.find((p) => p.modulo === modulo);
  if (!item) return false;
  if (acao === 'visualizar') return Number(item.podeVisualizar) === 1;
  if (acao === 'editar') return Number(item.podeEditar) === 1;
  return false;
}

function podeAcessarIdoso(usuario, idoso) {
  if (!usuario || !idoso) return false;
  if (usuario.tipoUsuario === 'admin' || usuario.tipoUsuario === 'profissional') return true;
  if (usuario.tipoUsuario === 'acompanhante') return Number(idoso.idAcompanhante) === Number(usuario.id);
  return false;
}

module.exports = { hasModuleAccess, podeAcessarIdoso };
