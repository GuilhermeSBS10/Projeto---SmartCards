import {
  limparStorageAutenticacao,
  lerToken,
  lerUsuario,
  removerToken
} from "../utils/storage.js";

export function usuarioEstaAutenticado() {
  return Boolean(lerToken());
}

export function obterTokenAutenticacao() {
  return lerToken();
}

export function obterUsuarioAutenticado() {
  return lerUsuario();
}

export function montarCabecalhoAuth() {
  const token = lerToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function exigirAutenticacao(redirecionarPara = "login.html") {
  if (usuarioEstaAutenticado()) return true;
  window.location.href = redirecionarPara;
  return false;
}

export function redirecionarSeAutenticado(destino = "dashboard.html") {
  if (!usuarioEstaAutenticado()) return false;
  window.location.href = destino;
  return true;
}

export function sairDaConta(destino = "login.html") {
  removerToken();
  limparStorageAutenticacao();
  window.location.href = destino;
}
