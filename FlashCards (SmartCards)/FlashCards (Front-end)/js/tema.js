const CHAVE_TEMA = "smartcards_tema";

function lerTemaSalvo() {
  return localStorage.getItem(CHAVE_TEMA) || "escuro";
}

function salvarTema(tema) {
  localStorage.setItem(CHAVE_TEMA, tema);
}

function aplicarTema() {
  const tema = lerTemaSalvo();
  const corpo = document.body;

  if (corpo.classList.contains("pagina-landing")) {
    corpo.classList.toggle("tema-claro", tema === "claro");
  } else {
    corpo.classList.toggle("tema-escuro", tema === "escuro");
  }

  document.querySelectorAll("#controle-tema").forEach((controle) => {
    controle.checked = tema === "claro";
  });
}

function iniciarAlternadorTema() {
  document.querySelectorAll("#controle-tema").forEach((controle) => {
    controle.addEventListener("change", () => {
      salvarTema(controle.checked ? "claro" : "escuro");
      aplicarTema();
    });
  });

  aplicarTema();
}

iniciarAlternadorTema();
