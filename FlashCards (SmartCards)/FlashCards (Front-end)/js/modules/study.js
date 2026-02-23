const cartoes = [
  {
    pergunta: "Qual é a função principal das mitocôndrias na célula?",
    resposta: "Produzir energia por meio da respiração celular."
  },
  {
    pergunta: "O que é fotossíntese?",
    resposta: "Processo em que plantas convertem luz solar em energia química."
  },
  {
    pergunta: "Qual a diferença entre mitose e meiose?",
    resposta: "Mitose gera células iguais; meiose gera células com metade dos cromossomos."
  }
];

export function iniciarPaginaEstudo() {
  const indicador = document.querySelector("#indicador-cartao");
  const rotuloFace = document.querySelector("#rotulo-face");
  const textoPergunta = document.querySelector("#texto-pergunta");
  const textoResposta = document.querySelector("#texto-resposta");
  const botaoVirar = document.querySelector("#botao-virar");
  const gradeAvaliacao = document.querySelector(".grade-avaliacao");

  if (!indicador || !rotuloFace || !textoPergunta || !textoResposta || !botaoVirar || !gradeAvaliacao) {
    return;
  }

  let indiceAtual = 0;
  let mostrandoResposta = false;

  function renderizarCartao() {
    const cartaoAtual = cartoes[indiceAtual];

    indicador.textContent = `Cartão ${indiceAtual + 1} de ${cartoes.length}`;
    textoPergunta.textContent = cartaoAtual.pergunta;
    textoResposta.textContent = cartaoAtual.resposta;

    mostrandoResposta = false;
    rotuloFace.textContent = "Pergunta";
    textoResposta.classList.add("oculto");
    botaoVirar.textContent = "Virar cartão";
  }

  function virarCartao() {
    mostrandoResposta = !mostrandoResposta;

    if (mostrandoResposta) {
      rotuloFace.textContent = "Resposta";
      textoResposta.classList.remove("oculto");
      botaoVirar.textContent = "Voltar para pergunta";
      return;
    }

    rotuloFace.textContent = "Pergunta";
    textoResposta.classList.add("oculto");
    botaoVirar.textContent = "Virar cartão";
  }

  function avancarCartao() {
    indiceAtual = (indiceAtual + 1) % cartoes.length;
    renderizarCartao();
  }

  botaoVirar.addEventListener("click", virarCartao);

  gradeAvaliacao.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-nota]");
    if (!botao) return;

    const nota = Number(botao.dataset.nota);
    console.log(`Nota registrada: ${nota}`);

    avancarCartao();
  });

  renderizarCartao();
}
