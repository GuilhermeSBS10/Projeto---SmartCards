import { obterTokenAutenticacao } from "../auth/auth.js";

const API_BASE_URL =
  window.__SMARTCARDS_API_URL__ ||
  localStorage.getItem("smartcards_api_url") ||
  "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResposta(resposta) {
  const tipo = resposta.headers.get("content-type") || "";
  if (tipo.includes("application/json")) return resposta.json();
  return resposta.text();
}

export async function requisicaoApi(
  rota,
  { method = "GET", body, headers = {}, auth = true, signal } = {}
) {
  const cabecalhos = {
    "Content-Type": "application/json",
    ...headers
  };

  if (auth) {
    const token = obterTokenAutenticacao();
    if (token) cabecalhos.Authorization = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_BASE_URL}${rota}`, {
    method,
    headers: cabecalhos,
    body: body ? JSON.stringify(body) : undefined,
    signal
  });

  const payload = await parseResposta(resposta);

  if (!resposta.ok) {
    const mensagem =
      (payload && typeof payload === "object" && payload.message) ||
      `Erro na API (${resposta.status})`;
    throw new ApiError(mensagem, resposta.status, payload);
  }

  return payload;
}

export function definirApiBaseUrl(url) {
  localStorage.setItem("smartcards_api_url", url);
}

export function obterApiBaseUrl() {
  return API_BASE_URL;
}

// Auth
export function loginUser({ email, senha }) {
  return requisicaoApi("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, senha }
  });
}

export function registerUser({ nome, email, senha }) {
  return requisicaoApi("/auth/register", {
    method: "POST",
    auth: false,
    body: { nome, email, senha }
  });
}

export function getPerfil() {
  return requisicaoApi("/auth/me");
}

// Materias
export function getMaterias() {
  return requisicaoApi("/materias");
}

export function getMateriaById(materiaId) {
  return requisicaoApi(`/materias/${materiaId}`);
}

export function createMateria(payload) {
  return requisicaoApi("/materias", {
    method: "POST",
    body: payload
  });
}

export function updateMateria(materiaId, payload) {
  return requisicaoApi(`/materias/${materiaId}`, {
    method: "PUT",
    body: payload
  });
}

export function deleteMateria(materiaId) {
  return requisicaoApi(`/materias/${materiaId}`, {
    method: "DELETE"
  });
}

// Questoes
export function getQuestoes(materiaId) {
  return requisicaoApi(`/materias/${materiaId}/questoes`);
}

export function createQuestao(materiaId, payload) {
  return requisicaoApi(`/materias/${materiaId}/questoes`, {
    method: "POST",
    body: payload
  });
}

export function updateQuestao(materiaId, questaoId, payload) {
  return requisicaoApi(`/materias/${materiaId}/questoes/${questaoId}`, {
    method: "PUT",
    body: payload
  });
}

export function deleteQuestao(materiaId, questaoId) {
  return requisicaoApi(`/materias/${materiaId}/questoes/${questaoId}`, {
    method: "DELETE"
  });
}

// Estudo
export function sendStudyResult(payload) {
  return requisicaoApi("/estudo/respostas", {
    method: "POST",
    body: payload
  });
}

export function getProgress() {
  return requisicaoApi("/estudo/progresso");
}

// Estatisticas
export function getStatsResumo() {
  return requisicaoApi("/stats/resumo");
}

export function getStatsDiario({ dias = 7 } = {}) {
  return requisicaoApi(`/stats/diario?dias=${dias}`);
}
