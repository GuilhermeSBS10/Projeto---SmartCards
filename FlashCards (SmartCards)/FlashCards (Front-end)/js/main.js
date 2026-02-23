import { iniciarPaginaEstudo } from "./modules/study.js";

function iniciarAplicacao() {
  const pagina = document.body.dataset.pagina;

  if (pagina === "estudo") {
    iniciarPaginaEstudo();
  }
}

iniciarAplicacao();
