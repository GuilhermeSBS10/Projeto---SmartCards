const CHAVE_MATERIAS = "smartcards_materias";
const CHAVE_DESEMPENHO = "smartcards_desempenho";
const CHAVE_RESPOSTAS = "smartcards_respostas";

function lerMaterias() {
  const cru = localStorage.getItem(CHAVE_MATERIAS);
  if (!cru) return [];

  try {
    return JSON.parse(cru);
  } catch {
    return [];
  }
}

function lerDesempenho() {
  const cru = localStorage.getItem(CHAVE_DESEMPENHO);
  if (!cru) return {};

  try {
    return JSON.parse(cru);
  } catch {
    return {};
  }
}

function lerRespostas() {
  const cru = localStorage.getItem(CHAVE_RESPOSTAS);
  if (!cru) return [];

  try {
    return JSON.parse(cru);
  } catch {
    return [];
  }
}

function criarMapaMaterias(materias) {
  const mapaMateriaIdNome = {};
  const mapaQuestao = {};

  materias.forEach((materia) => {
    mapaMateriaIdNome[materia.id] = materia.nome;
    (materia.questoes || []).forEach((questao) => {
      mapaQuestao[`${materia.id}::${questao.id}`] = questao.enunciado;
    });
  });

  return { mapaMateriaIdNome, mapaQuestao };
}

function formatarDataCurta(data) {
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function ultimosDias(qtd) {
  const hoje = new Date();
  const dias = [];

  for (let i = qtd - 1; i >= 0; i -= 1) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dias.push(d);
  }

  return dias;
}

function renderizarCards(container, dados) {
  const cards = [
    { titulo: "Matérias", valor: dados.totalMaterias },
    { titulo: "Questões", valor: dados.totalQuestoes },
    { titulo: "Respondidas", valor: dados.totalRespondidas },
    { titulo: "Taxa de acerto", valor: dados.taxaAcerto }
  ];

  container.innerHTML = cards
    .map(
      (item) => `
      <article class="cartao cartao-resumo">
        <h2>${item.titulo}</h2>
        <strong>${item.valor}</strong>
      </article>
    `
    )
    .join("");
}

function renderizarGrafico(container, respostas) {
  if (!respostas.length) {
    container.innerHTML = "Sem respostas registradas ainda.";
    return;
  }

  const dias = ultimosDias(7);
  const linhas = dias.map((dia) => {
    const inicio = new Date(dia);
    const fim = new Date(dia);
    fim.setHours(23, 59, 59, 999);

    const doDia = respostas.filter((item) => {
      const data = new Date(item.data);
      return data >= inicio && data <= fim;
    });

    const acertos = doDia.filter((item) => item.acertou).length;
    const erros = doDia.length - acertos;

    return {
      label: formatarDataCurta(dia),
      acertos,
      erros
    };
  });

  const maxDia = Math.max(1, ...linhas.map((linha) => Math.max(linha.acertos, linha.erros)));

  container.innerHTML = `
    <div class="legenda-grafico">
      <span><i class="legenda-cor cor-acerto"></i> Acertos</span>
      <span><i class="legenda-cor cor-erro"></i> Erros</span>
    </div>
    <div class="grafico-colunas">
      ${linhas
        .map((linha) => {
          const hAcertos = (linha.acertos / maxDia) * 100;
          const hErros = (linha.erros / maxDia) * 100;

          return `
            <div class="coluna-dia">
              <div class="colunas-duplas">
                <div class="barra-vertical barra-erro" style="height:${hErros}%" title="Erros: ${linha.erros}"></div>
                <div class="barra-vertical barra-acerto" style="height:${hAcertos}%" title="Acertos: ${linha.acertos}"></div>
              </div>
              <small class="rotulo-dia">${linha.label}</small>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderizarRanking(container, respostas, mapaMateriaIdNome) {
  if (!respostas.length) {
    container.innerHTML = "<li class='item-assunto'>Sem dados de respostas ainda.</li>";
    return;
  }

  const porMateria = {};

  respostas.forEach((item) => {
    const nome = mapaMateriaIdNome[item.materiaId] || item.materia || item.materiaId;
    if (!porMateria[nome]) porMateria[nome] = { acertos: 0, total: 0 };

    porMateria[nome].total += 1;
    if (item.acertou) porMateria[nome].acertos += 1;
  });

  const ranking = Object.entries(porMateria)
    .map(([materia, dados]) => ({
      materia,
      percentual: Math.round((dados.acertos / dados.total) * 100),
      total: dados.total
    }))
    .sort((a, b) => b.percentual - a.percentual);

  container.innerHTML = ranking
    .map(
      (item) => `
      <li class="item-assunto">
        <span>${item.materia}</span>
        <span class="etiqueta">${item.percentual}% (${item.total})</span>
      </li>
    `
    )
    .join("");
}

function renderizarQuestoesCriticas(container, respostas, mapaMateriaIdNome, mapaQuestao) {
  if (!respostas.length) {
    container.innerHTML = "<li class='item-assunto'>Nenhuma questão para reforço ainda.</li>";
    return;
  }

  const mapa = {};

  respostas.forEach((item) => {
    const chave = `${item.materiaId}::${item.questaoId}`;
    if (!mapa[chave]) {
      mapa[chave] = {
        materia: mapaMateriaIdNome[item.materiaId] || item.materia || item.materiaId,
        enunciado: mapaQuestao[chave] || `Questão ${item.questaoId}`,
        erros: 0,
        total: 0
      };
    }

    mapa[chave].total += 1;
    if (!item.acertou) mapa[chave].erros += 1;
  });

  const criticas = Object.values(mapa)
    .filter((item) => item.erros > 0)
    .sort((a, b) => b.erros - a.erros || b.total - a.total)
    .slice(0, 6);

  if (!criticas.length) {
    container.innerHTML = "<li class='item-assunto'>Nenhuma questão com erro registrada.</li>";
    return;
  }

  container.innerHTML = criticas
    .map(
      (item) => `
      <li class="item-assunto">
        <div>
          <strong>${item.materia}</strong>
          <p>${item.enunciado}</p>
        </div>
        <span class="etiqueta">${item.erros} erros</span>
      </li>
    `
    )
    .join("");
}

export function iniciarPaginaStats() {
  const statsCards = document.querySelector("#stats-cards");
  const grafico = document.querySelector("#grafico-retencao");
  const ranking = document.querySelector("#ranking-materias");
  const criticas = document.querySelector("#questoes-criticas");
  const atualizacao = document.querySelector("#atualizacao-stats");

  if (!statsCards || !grafico || !ranking || !criticas || !atualizacao) return;

  const materias = lerMaterias();
  const respostas = lerRespostas();
  const desempenho = lerDesempenho();
  const { mapaMateriaIdNome, mapaQuestao } = criarMapaMaterias(materias);

  const totalMaterias = materias.length;
  const totalQuestoes = materias.reduce((acc, item) => acc + (item.questoes?.length || 0), 0);
  const totalRespondidas = respostas.length;
  const totalAcertos = respostas.filter((item) => item.acertou).length;
  const taxaAcerto = totalRespondidas ? `${Math.round((totalAcertos / totalRespondidas) * 100)}%` : "0%";

  renderizarCards(statsCards, {
    totalMaterias,
    totalQuestoes,
    totalRespondidas,
    taxaAcerto
  });

  renderizarGrafico(grafico, respostas);
  renderizarRanking(ranking, respostas, mapaMateriaIdNome);
  renderizarQuestoesCriticas(criticas, respostas, mapaMateriaIdNome, mapaQuestao, desempenho);

  atualizacao.textContent = `Atualizado em ${new Date().toLocaleDateString("pt-BR")}`;
}
