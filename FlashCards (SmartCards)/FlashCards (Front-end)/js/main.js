import { iniciarPaginaEstudo } from "./modules/study.js";
import { iniciarPaginaMateria } from "./modules/materia.js";
import { iniciarPaginaStats } from "./modules/stats.js";
import { iniciarPaginaDashboard } from "./modules/dashboard.js";
import { sairDaConta } from "./auth/auth.js";
import { confirmarAcao } from "./utils/helpers.js";

function iniciarAcoesSessao() {
  document.querySelectorAll("[data-acao='sair']").forEach((link) => {
    link.addEventListener("click", async (evento) => {
      evento.preventDefault();
      const confirmou = await confirmarAcao({
        titulo: "Sair da conta",
        mensagem: "Tem certeza que deseja sair agora?",
        textoConfirmar: "Sim, sair",
        textoCancelar: "Cancelar",
        perigoso: true
      });
      if (!confirmou) return;
      sairDaConta("login.html");
    });
  });
}

function iniciarAplicacao() {
  const pagina = document.body.dataset.pagina;

  if (pagina === "estudo") {
    iniciarPaginaEstudo();
  }

  if (pagina === "materia") {
    iniciarPaginaMateria();
  }

  if (pagina === "stats") {
    iniciarPaginaStats();
  }

  if (pagina === "dashboard") {
    iniciarPaginaDashboard();
  }

  iniciarAcoesSessao();
}

iniciarAplicacao();
