import { confirmarAcao, mostrarSucesso } from "../utils/helpers.js";

const CHAVE_MATERIAS = "smartcards_materias";
const LIMITE_ALTERNATIVAS = 5;
const LETRAS = ["A", "B", "C", "D", "E"];

let materiaEmEdicaoId = null;

function uid(prefixo) {
  return `${prefixo}_${Math.random().toString(36).slice(2, 9)}`;
}

function lerMaterias() {
  const cru = localStorage.getItem(CHAVE_MATERIAS);
  if (!cru) return [];

  try {
    return JSON.parse(cru);
  } catch {
    return [];
  }
}

function salvarMaterias(materias) {
  localStorage.setItem(CHAVE_MATERIAS, JSON.stringify(materias));
}

function criarEstruturaQuestao(indice, questaoInicial = null) {
  const wrapper = document.createElement("article");
  wrapper.className = "item-questao";
  wrapper.dataset.questaoId = questaoInicial?.id || uid("q");

  wrapper.innerHTML = `
    <h4>Questão ${indice + 1}</h4>
    <div class="grupo-campo">
      <label>Enunciado</label>
      <input class="campo" type="text" name="enunciado" required />
    </div>
    <div class="lista-alternativas"></div>
    <div class="acoes-questao">
      <button type="button" class="botao botao-secundario" data-adicionar-alternativa>+ Alternativa</button>
      <button type="button" class="botao botao-perigo" data-remover-questao>Remover questão</button>
      <div class="grupo-campo">
        <label>Alternativa correta</label>
        <select class="campo" name="correta"></select>
      </div>
    </div>
  `;

  const inputEnunciado = wrapper.querySelector("input[name='enunciado']");
  inputEnunciado.value = questaoInicial?.enunciado || "";

  if (questaoInicial?.alternativas?.length) {
    questaoInicial.alternativas.slice(0, LIMITE_ALTERNATIVAS).forEach((alternativa) => {
      adicionarAlternativa(wrapper, alternativa.texto);
    });
  } else {
    for (let i = 0; i < 2; i += 1) {
      adicionarAlternativa(wrapper);
    }
  }

  atualizarOpcaoCorreta(wrapper, questaoInicial?.correta);
  return wrapper;
}

function adicionarAlternativa(blocoQuestao, textoInicial = "") {
  const lista = blocoQuestao.querySelector(".lista-alternativas");
  const total = lista.children.length;
  if (total >= LIMITE_ALTERNATIVAS) return;

  const letra = LETRAS[total];
  const linha = document.createElement("div");
  linha.className = "linha-alternativa";
  linha.innerHTML = `
    <span>${letra})</span>
    <input class="campo" type="text" name="alternativa_${letra}" required />
  `;

  linha.querySelector("input").value = textoInicial;
  lista.appendChild(linha);
  atualizarOpcaoCorreta(blocoQuestao);
}

function atualizarOpcaoCorreta(blocoQuestao, corretaInicial = null) {
  const seletor = blocoQuestao.querySelector("select[name='correta']");
  const alternativas = blocoQuestao.querySelectorAll(".linha-alternativa span");
  const anterior = seletor.value;

  seletor.innerHTML = "";
  alternativas.forEach((_, idx) => {
    const letra = LETRAS[idx];
    const opcao = document.createElement("option");
    opcao.value = letra;
    opcao.textContent = letra;
    seletor.appendChild(opcao);
  });

  const alvo = corretaInicial || anterior || "A";
  if ([...seletor.options].some((opcao) => opcao.value === alvo)) {
    seletor.value = alvo;
  }
}

function preencherSeletorMaterias(seletor) {
  const materias = lerMaterias();
  seletor.innerHTML = `<option value="nova">Nova matéria</option>`;

  materias.forEach((materia) => {
    const opcao = document.createElement("option");
    opcao.value = materia.id;
    opcao.textContent = materia.nome;
    seletor.appendChild(opcao);
  });
}

function renderizarListaMaterias() {
  const lista = document.querySelector("#lista-materias");
  const materias = lerMaterias();

  lista.innerHTML = materias
    .map((materia) => `
      <li>
        <span>${materia.nome}</span>
        <div class="acoes-item-materia">
          <strong>${materia.questoes.length} questões</strong>
          <button class="botao botao-secundario" data-editar-materia="${materia.id}" type="button">Editar</button>
          <button class="botao botao-perigo" data-excluir-materia="${materia.id}" type="button">Apagar</button>
        </div>
      </li>
    `)
    .join("");

  if (!materias.length) {
    lista.innerHTML = "<li>Nenhuma matéria cadastrada ainda.</li>";
  }
}

function coletarQuestoesDoFormulario() {
  const blocos = [...document.querySelectorAll(".item-questao")];

  return blocos.map((bloco) => {
    const enunciado = bloco.querySelector("input[name='enunciado']").value.trim();
    const correta = bloco.querySelector("select[name='correta']").value;

    const alternativas = [...bloco.querySelectorAll(".linha-alternativa")].map((linha, idx) => {
      const letra = LETRAS[idx];
      const texto = linha.querySelector("input").value.trim();
      return { letra, texto };
    });

    return {
      id: bloco.dataset.questaoId,
      enunciado,
      alternativas,
      correta
    };
  });
}

function renumerarTitulosQuestoes(formQuestoes) {
  [...formQuestoes.querySelectorAll(".item-questao")].forEach((bloco, idx) => {
    const titulo = bloco.querySelector("h4");
    titulo.textContent = `Questão ${idx + 1}`;
  });
}

function alternarModoEdicaoUI(ativo, etiquetaModoEdicao, botaoCancelarEdicao, botaoSalvarQuestoes) {
  etiquetaModoEdicao.hidden = !ativo;
  botaoCancelarEdicao.hidden = !ativo;
  botaoSalvarQuestoes.textContent = ativo ? "Salvar alterações" : "Salvar matéria e questões";
}

export function iniciarPaginaMateria() {
  const formEstrutura = document.querySelector("#form-estrutura-materia");
  const seletorMateria = document.querySelector("#seletor-materia");
  const blocoNomeMateria = document.querySelector("#bloco-nome-materia");
  const inputNomeMateria = document.querySelector("#nome-materia");
  const inputQtd = document.querySelector("#quantidade-questoes");
  const painelQuestoes = document.querySelector("#painel-questoes");
  const formQuestoes = document.querySelector("#form-questoes");
  const botaoAdicionarQuestao = document.querySelector("#botao-adicionar-questao");
  const botaoCancelarEdicao = document.querySelector("#botao-cancelar-edicao");
  const botaoSalvarQuestoes = document.querySelector("#botao-salvar-questoes");
  const etiquetaModoEdicao = document.querySelector("#etiqueta-modo-edicao");
  const listaMaterias = document.querySelector("#lista-materias");

  if (!formEstrutura || !seletorMateria || !blocoNomeMateria || !inputNomeMateria || !inputQtd || !painelQuestoes || !formQuestoes || !botaoAdicionarQuestao || !botaoCancelarEdicao || !botaoSalvarQuestoes || !etiquetaModoEdicao || !listaMaterias) {
    return;
  }

  function resetarFluxo() {
    materiaEmEdicaoId = null;
    formQuestoes.innerHTML = "";
    painelQuestoes.hidden = true;
    formEstrutura.reset();
    seletorMateria.value = "nova";
    blocoNomeMateria.style.display = "grid";
    inputNomeMateria.required = true;
    alternarModoEdicaoUI(false, etiquetaModoEdicao, botaoCancelarEdicao, botaoSalvarQuestoes);
  }

  function carregarMateriaParaEdicao(materiaId) {
    const materias = lerMaterias();
    const materia = materias.find((item) => item.id === materiaId);
    if (!materia) return;

    materiaEmEdicaoId = materiaId;
    painelQuestoes.hidden = false;
    formQuestoes.innerHTML = "";

    materia.questoes.forEach((questao, idx) => {
      formQuestoes.appendChild(criarEstruturaQuestao(idx, questao));
    });

    seletorMateria.value = materia.id;
    blocoNomeMateria.style.display = "none";
    inputNomeMateria.required = false;
    alternarModoEdicaoUI(true, etiquetaModoEdicao, botaoCancelarEdicao, botaoSalvarQuestoes);
    renumerarTitulosQuestoes(formQuestoes);
  }

  preencherSeletorMaterias(seletorMateria);
  renderizarListaMaterias();

  seletorMateria.addEventListener("change", () => {
    const ehNova = seletorMateria.value === "nova";
    blocoNomeMateria.style.display = ehNova ? "grid" : "none";
    inputNomeMateria.required = ehNova;
    if (ehNova) {
      materiaEmEdicaoId = null;
      alternarModoEdicaoUI(false, etiquetaModoEdicao, botaoCancelarEdicao, botaoSalvarQuestoes);
    }
  });

  formEstrutura.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const quantidade = Number(inputQtd.value);
    formQuestoes.innerHTML = "";

    for (let i = 0; i < quantidade; i += 1) {
      formQuestoes.appendChild(criarEstruturaQuestao(i));
    }

    painelQuestoes.hidden = false;
    alternarModoEdicaoUI(false, etiquetaModoEdicao, botaoCancelarEdicao, botaoSalvarQuestoes);
  });

  botaoAdicionarQuestao.addEventListener("click", () => {
    const indice = formQuestoes.querySelectorAll(".item-questao").length;
    formQuestoes.appendChild(criarEstruturaQuestao(indice));
  });

  botaoCancelarEdicao.addEventListener("click", resetarFluxo);

  formQuestoes.addEventListener("click", (evento) => {
    const botaoAdicionar = evento.target.closest("button[data-adicionar-alternativa]");
    if (botaoAdicionar) {
      const blocoQuestao = botaoAdicionar.closest(".item-questao");
      adicionarAlternativa(blocoQuestao);
      return;
    }

    const botaoRemover = evento.target.closest("button[data-remover-questao]");
    if (botaoRemover) {
      const blocoQuestao = botaoRemover.closest(".item-questao");
      blocoQuestao.remove();
      renumerarTitulosQuestoes(formQuestoes);
    }
  });

  listaMaterias.addEventListener("click", async (evento) => {
    const botaoEditar = evento.target.closest("button[data-editar-materia]");
    if (botaoEditar) {
      carregarMateriaParaEdicao(botaoEditar.dataset.editarMateria);
      return;
    }

    const botaoExcluir = evento.target.closest("button[data-excluir-materia]");
    if (!botaoExcluir) return;

    const materiaId = botaoExcluir.dataset.excluirMateria;
    const materias = lerMaterias();
    const materia = materias.find((item) => item.id === materiaId);
    if (!materia) return;

    const confirmou = await confirmarAcao({
      titulo: "Apagar matéria",
      mensagem: `Tem certeza que deseja apagar "${materia.nome}"? Essa ação remove também todas as questões.`,
      textoConfirmar: "Sim, apagar",
      textoCancelar: "Cancelar",
      perigoso: true
    });

    if (!confirmou) return;

    const atualizadas = materias.filter((item) => item.id !== materiaId);
    salvarMaterias(atualizadas);

    if (materiaEmEdicaoId === materiaId) {
      resetarFluxo();
    } else {
      preencherSeletorMaterias(seletorMateria);
      renderizarListaMaterias();
    }

    mostrarSucesso("Matéria apagada com sucesso.");
  });

  botaoSalvarQuestoes.addEventListener("click", () => {
    const materias = lerMaterias();
    const questoes = coletarQuestoesDoFormulario();

    if (!questoes.length) return;

    if (materiaEmEdicaoId) {
      const materia = materias.find((item) => item.id === materiaEmEdicaoId);
      if (!materia) return;
      materia.questoes = questoes;
    } else {
      const materiaSelecionada = seletorMateria.value;

      if (materiaSelecionada === "nova") {
        const nomeMateria = inputNomeMateria.value.trim();
        if (!nomeMateria) return;

        materias.push({
          id: uid("m"),
          nome: nomeMateria,
          questoes
        });
      } else {
        const materia = materias.find((item) => item.id === materiaSelecionada);
        if (!materia) return;
        materia.questoes.push(...questoes);
      }
    }

    salvarMaterias(materias);
    preencherSeletorMaterias(seletorMateria);
    renderizarListaMaterias();
    resetarFluxo();
  });
}
