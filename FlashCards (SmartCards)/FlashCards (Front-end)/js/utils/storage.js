const CHAVES = {
  token: "smartcards_token",
  refreshToken: "smartcards_refresh_token",
  usuario: "smartcards_usuario",
  tema: "smartcards_tema"
};

export function salvarItem(chave, valor) {
  localStorage.setItem(chave, valor);
}

export function lerItem(chave) {
  return localStorage.getItem(chave);
}

export function removerItem(chave) {
  localStorage.removeItem(chave);
}

export function salvarJson(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

export function lerJson(chave, padrao = null) {
  const cru = localStorage.getItem(chave);
  if (!cru) return padrao;

  try {
    return JSON.parse(cru);
  } catch {
    return padrao;
  }
}

export function limparStorageAutenticacao() {
  removerItem(CHAVES.token);
  removerItem(CHAVES.refreshToken);
  removerItem(CHAVES.usuario);
}

export function salvarToken(token) {
  salvarItem(CHAVES.token, token);
}

export function lerToken() {
  return lerItem(CHAVES.token);
}

export function removerToken() {
  removerItem(CHAVES.token);
}

export function salvarRefreshToken(token) {
  salvarItem(CHAVES.refreshToken, token);
}

export function lerRefreshToken() {
  return lerItem(CHAVES.refreshToken);
}

export function salvarUsuario(usuario) {
  salvarJson(CHAVES.usuario, usuario);
}

export function lerUsuario() {
  return lerJson(CHAVES.usuario, null);
}

export function salvarTema(tema) {
  salvarItem(CHAVES.tema, tema);
}

export function lerTema(padrao = "escuro") {
  return lerItem(CHAVES.tema) || padrao;
}

export { CHAVES };
