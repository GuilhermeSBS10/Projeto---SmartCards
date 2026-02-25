const CHAVE_MATERIAS = "smartcards_materias";
const CHAVE_RESPOSTAS = "smartcards_respostas";
const CHAVE_DESEMPENHO = "smartcards_desempenho";

function lerMaterias() {
  const cru = localStorage.getItem(CHAVE_MATERIAS);
  if (!cru) return [];

  try {
    return JSON.parse(cru);
  } catch {
    return [];
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

function lerDesempenho() {
  const cru = localStorage.getItem(CHAVE_DESEMPENHO);
  if (!cru) return {};

  try {
    return JSON.parse(cru);
  } catch {
    return {};
  }
}

function criarMapaQuestoes(materias) {
  const mapa = {};
  materias.forEach((materia) => {
    (materia.questoes || []).forEach((questao) => {
      mapa[`${materia.id}::${questao.id}`] = {
        materiaId: materia.id,
        materiaNome: materia.nome,
        enunciado: questao.enunciado
      };
    });
  });
  return mapa;
}

function renderizarAtalhos(container, materias, respostas) {
  const totalMaterias = materias.length;
  const totalQuestoes = materias.reduce((acc, item) => acc + (item.questoes?.length || 0), 0);
  const respondidasHoje = respostas.filter((item) => {
    const d = new Date(item.data);
    const hoje = new Date();
    return d.toDateString() === hoje.toDateString();
  }).length;

  const atalhos = [
    { titulo: "Gerenciar matérias", valor: "Abrir", link: "materia.html" },
    { titulo: "Matérias", valor: String(totalMaterias), link: "stats.html" },
    { titulo: "Questões", valor: String(totalQuestoes), link: "study.html" },
    { titulo: "Respostas hoje", valor: String(respondidasHoje), link: "stats.html" }
  ];

  container.innerHTML = atalhos
    .map(
      (item) => `
      <a class="cartao cartao-resumo atalho-dashboard" href="${item.link}">
        <h2>${item.titulo}</h2>
        <strong>${item.valor}</strong>
      </a>
    `
    )
    .join("");
}

function renderizarPrioridades(container, respostas, materias) {
  if (!respostas.length) {
    container.innerHTML = "<li class='item-assunto'>Sem respostas ainda. Faça uma sessão de estudo.</li>";
    return;
  }

  const mapaNomeMateria = {};
  materias.forEach((materia) => {
    mapaNomeMateria[materia.id] = materia.nome;
  });

  const errosPorMateria = {};
  respostas.forEach((item) => {
    const materiaId = item.materiaId;
    if (!errosPorMateria[materiaId]) {
      errosPorMateria[materiaId] = { erros: 0, total: 0 };
    }

    errosPorMateria[materiaId].total += 1;
    if (!item.acertou) errosPorMateria[materiaId].erros += 1;
  });

  const lista = Object.entries(errosPorMateria)
    .map(([materiaId, dados]) => ({
      materiaId,
      materiaNome: mapaNomeMateria[materiaId] || materiaId,
      erros: dados.erros,
      total: dados.total,
      taxaErro: dados.total ? Math.round((dados.erros / dados.total) * 100) : 0
    }))
    .sort((a, b) => b.erros - a.erros || b.taxaErro - a.taxaErro)
    .slice(0, 5);

  container.innerHTML = lista
    .map(
      (item) => `
      <li class="item-assunto">
        <a href="study.html?materiaId=${item.materiaId}">${item.materiaNome}</a>
        <span class="etiqueta">${item.erros} erros (${item.taxaErro}%)</span>
      </li>
    `
    )
    .join("");
}

function renderizarPendentes(container, desempenho, mapaQuestoes) {
  const pendentes = [];

  Object.entries(desempenho).forEach(([materiaId, questoes]) => {
    Object.entries(questoes).forEach(([questaoId, registro]) => {
      const ultimaNota = Number(registro.ultimaNota || 0);
      const tentativas = Number(registro.tentativas || 0);
      if (!tentativas || ultimaNota > 2) return;

      const chave = `${materiaId}::${questaoId}`;
      const info = mapaQuestoes[chave];

      pendentes.push({
        materiaId,
        materiaNome: info?.materiaNome || materiaId,
        enunciado: info?.enunciado || `Questão ${questaoId}`,
        ultimaNota,
        tentativas
      });
    });
  });

  const lista = pendentes
    .sort((a, b) => a.ultimaNota - b.ultimaNota || b.tentativas - a.tentativas)
    .slice(0, 6);

  if (!lista.length) {
    container.innerHTML = "<li class='item-assunto'>Sem pendências críticas. Continue mantendo o ritmo.</li>";
    return;
  }

  container.innerHTML = lista
    .map(
      (item) => `
      <li class="item-assunto">
        <div>
          <strong>${item.materiaNome}</strong>
          <p>${item.enunciado}</p>
        </div>
        <span class="etiqueta">Nota ${item.ultimaNota}</span>
      </li>
    `
    )
    .join("");
}

function renderizarUltimaSessao(container, respostas) {
  if (!respostas.length) {
    container.innerHTML = "<p>Nenhuma sessão registrada ainda. Comece em <a href='study.html'>Estudar</a>.</p>";
    return;
  }

  const ordenadas = [...respostas].sort((a, b) => new Date(b.data) - new Date(a.data));
  const ultima = ordenadas[0];
  const dataUltima = new Date(ultima.data);

  const inicioDia = new Date(dataUltima);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(dataUltima);
  fimDia.setHours(23, 59, 59, 999);

  const noDia = ordenadas.filter((item) => {
    const d = new Date(item.data);
    return d >= inicioDia && d <= fimDia;
  });

  const acertosDia = noDia.filter((item) => item.acertou).length;

  container.innerHTML = `
    <p>
      Último registro em <strong>${dataUltima.toLocaleString("pt-BR")}</strong>.<br />
      Nesse dia você respondeu <strong>${noDia.length}</strong> questões, com <strong>${acertosDia}</strong> acertos.
    </p>
  `;
}

function atualizarBotaoContinuar(botao, materias) {
  if (!materias.length) {
    botao.href = "materia.html";
    botao.textContent = "Criar primeira matéria";
    return;
  }

  botao.href = `study.html?materiaId=${materias[0].id}`;
  botao.textContent = "Continuar estudo";
}

export function iniciarPaginaDashboard() {
  const cards = document.querySelector("#dashboard-atalhos");
  const prioridades = document.querySelector("#dashboard-prioridades");
  const pendentes = document.querySelector("#dashboard-pendentes");
  const ultimaSessao = document.querySelector("#dashboard-ultima-sessao");
  const botaoContinuar = document.querySelector("#botao-continuar-estudo");

  if (!cards || !prioridades || !pendentes || !ultimaSessao || !botaoContinuar) return;

  const materias = lerMaterias();
  const respostas = lerRespostas();
  const desempenho = lerDesempenho();
  const mapaQuestoes = criarMapaQuestoes(materias);

  atualizarBotaoContinuar(botaoContinuar, materias);
  renderizarAtalhos(cards, materias, respostas);
  renderizarPrioridades(prioridades, respostas, materias);
  renderizarPendentes(pendentes, desempenho, mapaQuestoes);
  renderizarUltimaSessao(ultimaSessao, respostas);
}
