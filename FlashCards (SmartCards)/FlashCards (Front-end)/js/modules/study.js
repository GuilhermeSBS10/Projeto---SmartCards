import { mostrarErro } from "../utils/helpers.js";

const CHAVE_DESEMPENHO = "smartcards_desempenho";
const CHAVE_MATERIAS = "smartcards_materias";
const CHAVE_RESPOSTAS = "smartcards_respostas";

const cartoesPadrao = [
  {
    id: "bio_01",
    materia: "Biologia",
    pergunta: "Qual é a função principal das mitocôndrias na célula?",
    alternativas: {
      A: "Produzir energia por respiração celular.",
      B: "Controlar a entrada de água na célula."
    },
    resposta: "Produzir energia por meio da respiração celular."
  },
  {
    id: "bio_02",
    materia: "Biologia",
    pergunta: "O que é fotossíntese?",
    alternativas: {
      A: "Processo de obtenção de energia química a partir da luz.",
      B: "Processo de reprodução celular por divisão da membrana."
    },
    resposta: "Processo em que plantas convertem luz solar em energia química."
  },
  {
    id: "hist_01",
    materia: "História",
    pergunta: "Em que ano ocorreu a Proclamação da República no Brasil?",
    alternativas: {
      A: "1889",
      B: "1822"
    },
    resposta: "A Proclamação da República ocorreu em 1889."
  }
];

function obterMateriaDaUrl() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get("materia") || parametros.get("materiaId");
}

function lerJson(chave, padrao) {
  const cru = localStorage.getItem(chave);
  if (!cru) return padrao;

  try {
    return JSON.parse(cru);
  } catch {
    return padrao;
  }
}

function lerDesempenho() {
  return lerJson(CHAVE_DESEMPENHO, {});
}

function salvarDesempenho(dados) {
  localStorage.setItem(CHAVE_DESEMPENHO, JSON.stringify(dados));
}

function lerRespostas() {
  return lerJson(CHAVE_RESPOSTAS, []);
}

function salvarRespostas(respostas) {
  localStorage.setItem(CHAVE_RESPOSTAS, JSON.stringify(respostas));
}

function lerMaterias() {
  return lerJson(CHAVE_MATERIAS, []);
}

function ultimoIndiceResposta(respostas, cartao) {
  for (let i = respostas.length - 1; i >= 0; i -= 1) {
    const item = respostas[i];
    const mesmaMateria = item.materiaId === (cartao.materiaId || cartao.materia);
    const mesmaQuestao = item.questaoId === cartao.id;
    if (mesmaMateria && mesmaQuestao) return i;
  }
  return -1;
}

function obterUltimaResposta(cartao) {
  const respostas = lerRespostas();
  const idx = ultimoIndiceResposta(respostas, cartao);
  return idx >= 0 ? respostas[idx] : null;
}

function obterUltimaNota(cartao) {
  const chaveMateria = cartao.materiaId || cartao.materia;
  const dados = lerDesempenho();
  return dados[chaveMateria]?.[cartao.id]?.ultimaNota ?? null;
}

function registrarResultadoResposta(cartao, acertou, sobrescrever = false) {
  const respostas = lerRespostas();
  const registro = {
    materiaId: cartao.materiaId || cartao.materia,
    materia: cartao.materia,
    questaoId: cartao.id,
    acertou,
    data: new Date().toISOString()
  };

  if (sobrescrever) {
    const idx = ultimoIndiceResposta(respostas, cartao);
    if (idx >= 0) respostas[idx] = registro;
    else respostas.push(registro);
  } else {
    respostas.push(registro);
  }

  salvarRespostas(respostas);
}

function registrarDesempenho(cartao, nota, sobrescrever = false) {
  const chaveMateria = cartao.materiaId || cartao.materia;
  const dados = lerDesempenho();

  if (!dados[chaveMateria]) dados[chaveMateria] = {};
  if (!dados[chaveMateria][cartao.id]) {
    dados[chaveMateria][cartao.id] = {
      ultimaNota: nota,
      tentativas: 0,
      historico: []
    };
  }

  const registro = dados[chaveMateria][cartao.id];
  registro.ultimaNota = nota;

  if (sobrescrever && registro.historico.length) {
    registro.historico[registro.historico.length - 1] = {
      nota,
      data: new Date().toISOString()
    };
  } else {
    registro.tentativas += 1;
    registro.historico.push({
      nota,
      data: new Date().toISOString()
    });
  }

  salvarDesempenho(dados);
}

function transformarMateriaEmCartoes(materia) {
  return (materia.questoes || []).map((questao) => {
    const correta = (questao.alternativas || []).find((item) => item.letra === questao.correta);

    const alternativasMap = {};
    (questao.alternativas || []).forEach((item) => {
      alternativasMap[item.letra] = item.texto;
    });

    return {
      id: questao.id,
      materia: materia.nome,
      materiaId: materia.id,
      pergunta: questao.enunciado,
      alternativas: alternativasMap,
      resposta: correta ? `${correta.letra}) ${correta.texto}` : "Resposta não cadastrada."
    };
  });
}

function repeticoesPorNota(nota) {
  if (nota === 1) return 4;
  if (nota === 2) return 3;
  if (nota === 3) return 2;
  if (nota === 4) return 1;
  return 2;
}

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function criarDeckPonderado(cartoes, chaveMateria) {
  const desempenho = lerDesempenho();
  const mapaMateria = desempenho[chaveMateria] || {};
  const deck = [];

  cartoes.forEach((cartao) => {
    const nota = Number(mapaMateria[cartao.id]?.ultimaNota || 0);
    const rep = repeticoesPorNota(nota);
    for (let i = 0; i < rep; i += 1) deck.push(cartao);
  });

  return embaralhar(deck);
}

export function iniciarPaginaEstudo() {
  const materiaUrl = obterMateriaDaUrl();
  const materias = lerMaterias();
  const materiasComQuestoes = materias.filter((item) => (item.questoes || []).length > 0);

  let cartoesBase = [];
  if (materiasComQuestoes.length) {
    const materiaSelecionada = materiaUrl
      ? materiasComQuestoes.find((item) => item.id === materiaUrl || item.nome.toLowerCase() === materiaUrl.toLowerCase())
      : materiasComQuestoes[0];

    const materiaFinal = materiaSelecionada || materiasComQuestoes[0];
    cartoesBase = transformarMateriaEmCartoes(materiaFinal);
  } else {
    cartoesBase = [...cartoesPadrao];
  }

  if (!cartoesBase.length) return;

  const materiaAtual = cartoesBase[0].materia;
  const chaveMateria = cartoesBase[0].materiaId || materiaAtual;
  let ordemCartoes = criarDeckPonderado(cartoesBase, chaveMateria);

  const indicador = document.querySelector("#indicador-cartao");
  const cartaoEstudo = document.querySelector("#cartao-estudo");
  const textoPergunta = document.querySelector("#texto-pergunta");
  const textoResposta = document.querySelector("#texto-resposta");
  const listaAlternativas = document.querySelector("#lista-alternativas");
  const seletorMateriaEstudo = document.querySelector("#seletor-materia-estudo");
  const botaoAnterior = document.querySelector("#botao-anterior");
  const botaoVirar = document.querySelector("#botao-virar");
  const gradeResultado = document.querySelector("#grade-resultado");
  const statusResultado = document.querySelector("#status-resultado");
  const gradeAvaliacao = document.querySelector(".grade-avaliacao");
  const painelFimSessao = document.querySelector("#painel-fim-sessao");
  const botaoNovaSessao = document.querySelector("#botao-nova-sessao");

  if (!indicador || !cartaoEstudo || !textoPergunta || !textoResposta || !listaAlternativas || !botaoAnterior || !botaoVirar || !gradeResultado || !statusResultado || !gradeAvaliacao || !painelFimSessao || !botaoNovaSessao) {
    return;
  }

  if (seletorMateriaEstudo) {
    if (materiasComQuestoes.length) {
      seletorMateriaEstudo.innerHTML = materiasComQuestoes
        .map((item) => `<option value="${item.id}">${item.nome}</option>`)
        .join("");

      const materiaInicial = cartoesBase[0].materiaId || materiasComQuestoes[0].id;
      seletorMateriaEstudo.value = materiaInicial;
    } else {
      seletorMateriaEstudo.innerHTML = '<option value="">Biologia (padrão)</option>';
      seletorMateriaEstudo.disabled = true;
    }

    seletorMateriaEstudo.addEventListener("change", () => {
      const params = new URLSearchParams(window.location.search);
      params.set("materiaId", seletorMateriaEstudo.value);
      window.location.search = params.toString();
    });
  }

  let indiceAtual = 0;
  let mostrandoResposta = false;
  let resultadoAtual = null;
  let sessaoFinalizada = false;
  const respondidas = new Set();

  function cartaoAtual() {
    return ordemCartoes[indiceAtual];
  }

  function limparSelecoesVisuais() {
    gradeResultado.querySelectorAll("button[data-resultado]").forEach((btn) => btn.classList.remove("ativo"));
    gradeAvaliacao.querySelectorAll("button[data-nota]").forEach((btn) => btn.classList.remove("ativo"));
  }

  function atualizarVisibilidadeBotaoAnterior() {
    botaoAnterior.hidden = indiceAtual === 0 || sessaoFinalizada;
  }

  function preencherComUltimaResposta(cartao) {
    const ultimaResposta = obterUltimaResposta(cartao);
    const ultimaNota = obterUltimaNota(cartao);

    if (ultimaResposta) {
      resultadoAtual = ultimaResposta.acertou ? "acerto" : "erro";
      const btnRes = gradeResultado.querySelector(`button[data-resultado="${resultadoAtual}"]`);
      btnRes?.classList.add("ativo");
      statusResultado.textContent = resultadoAtual === "acerto" ? "Marcado: você acertou." : "Marcado: você errou.";
    }

    if (ultimaNota) {
      const btnNota = gradeAvaliacao.querySelector(`button[data-nota="${ultimaNota}"]`);
      btnNota?.classList.add("ativo");
    }
  }

  function chaveResposta(cartao) {
    const materia = cartao.materiaId || cartao.materia;
    return `${materia}::${cartao.id}`;
  }

  function renderizarCartao({ carregarUltimo = false } = {}) {
    const atual = cartaoAtual();
    indicador.textContent = `${atual.materia} • Card ${indiceAtual + 1} de ${ordemCartoes.length}`;
    textoPergunta.textContent = atual.pergunta;
    textoResposta.textContent = atual.resposta;

    listaAlternativas.innerHTML = Object.entries(atual.alternativas)
      .map(([letra, texto]) => `<li><strong>${letra})</strong> <span>${texto}</span></li>`)
      .join("");

    mostrandoResposta = false;
    resultadoAtual = null;
    cartaoEstudo.classList.remove("virado");
    botaoVirar.textContent = "Virar cartão";
    limparSelecoesVisuais();
    statusResultado.textContent = "Selecione uma opção para continuar.";

    if (carregarUltimo) preencherComUltimaResposta(atual);
    atualizarVisibilidadeBotaoAnterior();
  }

  function finalizarSessao() {
    sessaoFinalizada = true;
    painelFimSessao.hidden = false;
    atualizarVisibilidadeBotaoAnterior();
  }

  function iniciarNovaSessao() {
    ordemCartoes = criarDeckPonderado(cartoesBase, chaveMateria);
    indiceAtual = 0;
    sessaoFinalizada = false;
    painelFimSessao.hidden = true;
    renderizarCartao();
  }

  function virarCartao() {
    if (sessaoFinalizada) return;
    mostrandoResposta = !mostrandoResposta;
    cartaoEstudo.classList.toggle("virado", mostrandoResposta);
    botaoVirar.textContent = mostrandoResposta ? "Voltar para pergunta" : "Virar cartão";
  }

  function avancarCartao() {
    if (indiceAtual >= ordemCartoes.length - 1) {
      finalizarSessao();
      return;
    }

    indiceAtual += 1;
    renderizarCartao();
  }

  function voltarCartao() {
    if (indiceAtual === 0 || sessaoFinalizada) return;
    indiceAtual -= 1;
    renderizarCartao({ carregarUltimo: true });
  }

  botaoAnterior.addEventListener("click", voltarCartao);
  botaoVirar.addEventListener("click", virarCartao);
  botaoNovaSessao.addEventListener("click", iniciarNovaSessao);

  gradeResultado.addEventListener("click", (evento) => {
    if (sessaoFinalizada) return;

    const botao = evento.target.closest("button[data-resultado]");
    if (!botao) return;

    resultadoAtual = botao.dataset.resultado;
    gradeResultado.querySelectorAll("button[data-resultado]").forEach((btn) => {
      btn.classList.toggle("ativo", btn === botao);
    });

    statusResultado.textContent = resultadoAtual === "acerto" ? "Marcado: você acertou." : "Marcado: você errou.";
  });

  gradeAvaliacao.addEventListener("click", (evento) => {
    if (sessaoFinalizada) return;

    const botao = evento.target.closest("button[data-nota]");
    if (!botao) return;

    if (!resultadoAtual) {
      mostrarErro("Antes de avançar, marque se você acertou ou errou a questão.");
      return;
    }

    const nota = Number(botao.dataset.nota);
    const atual = cartaoAtual();
    const chave = chaveResposta(atual);
    const sobrescrever = respondidas.has(chave);

    registrarResultadoResposta(atual, resultadoAtual === "acerto", sobrescrever);
    registrarDesempenho(atual, nota, sobrescrever);

    respondidas.add(chave);
    avancarCartao();
  });

  atualizarVisibilidadeBotaoAnterior();
  renderizarCartao();
}
