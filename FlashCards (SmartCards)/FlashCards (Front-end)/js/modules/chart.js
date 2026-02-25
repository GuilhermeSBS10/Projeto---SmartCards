/*
  Módulo de gráficos
  Esta base abstrai a renderização para facilitar troca de implementação
  (Chart.js, ApexCharts ou gráfico custom via HTML/CSS).
*/

export function normalizarSerieAcertosErros(respostasPorDia = []) {
  return respostasPorDia.map((item) => ({
    dia: item.dia,
    acertos: Number(item.acertos || 0),
    erros: Number(item.erros || 0)
  }));
}

export function prepararDatasetBarras(serie = []) {
  return {
    labels: serie.map((item) => item.dia),
    datasets: [
      {
        label: "Erros",
        data: serie.map((item) => item.erros),
        backgroundColor: "#dc2626"
      },
      {
        label: "Acertos",
        data: serie.map((item) => item.acertos),
        backgroundColor: "#16a34a"
      }
    ]
  };
}

export function renderizarGraficoAcertosErros(container, serie = []) {
  if (!container) return;

  // Placeholder visual caso a biblioteca de gráfico ainda não esteja integrada.
  const totalAcertos = serie.reduce((acc, item) => acc + Number(item.acertos || 0), 0);
  const totalErros = serie.reduce((acc, item) => acc + Number(item.erros || 0), 0);

  container.innerHTML = `
    <p>Gráfico pronto para integração com biblioteca.</p>
    <p><strong>Acertos:</strong> ${totalAcertos} | <strong>Erros:</strong> ${totalErros}</p>
  `;
}
