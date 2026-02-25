import {
  createQuestao,
  deleteQuestao,
  getMateriaById,
  getQuestoes,
  updateQuestao
} from "../services/api.js";

/*
  Módulo reservado para uma futura página subject.html.
  A ideia é concentrar aqui o CRUD de questões de uma matéria específica.
*/

export async function carregarDadosAssunto(materiaId) {
  const [materia, questoes] = await Promise.all([
    getMateriaById(materiaId),
    getQuestoes(materiaId)
  ]);

  return { materia, questoes };
}

export function criarQuestaoNoAssunto(materiaId, payloadQuestao) {
  return createQuestao(materiaId, payloadQuestao);
}

export function editarQuestaoNoAssunto(materiaId, questaoId, payloadQuestao) {
  return updateQuestao(materiaId, questaoId, payloadQuestao);
}

export function removerQuestaoNoAssunto(materiaId, questaoId) {
  return deleteQuestao(materiaId, questaoId);
}
