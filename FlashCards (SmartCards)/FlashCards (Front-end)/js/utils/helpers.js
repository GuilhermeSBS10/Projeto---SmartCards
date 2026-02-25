export function escaparHtml(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function criarElemento(tag, { classes = [], attrs = {}, texto = "" } = {}) {
  const el = document.createElement(tag);
  if (classes.length) el.classList.add(...classes);
  Object.entries(attrs).forEach(([chave, valor]) => el.setAttribute(chave, valor));
  if (texto) el.textContent = texto;
  return el;
}

export function debounce(fn, espera = 250) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), espera);
  };
}

export function scoreParaTexto(score) {
  const mapa = {
    1: "Ruim",
    2: "Médio",
    3: "Bom",
    4: "Excelente"
  };
  return mapa[Number(score)] || "Sem classificação";
}

export function mostrarErro(mensagem) {
  mostrarToast(mensagem, "erro");
}

export function mostrarSucesso(mensagem) {
  mostrarToast(mensagem, "sucesso");
}

function obterContainerToast() {
  let container = document.querySelector(".toast-container");
  if (container) return container;

  container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

export function mostrarToast(mensagem, tipo = "info", duracao = 3200) {
  const container = obterContainerToast();
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensagem;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("visivel"));

  const remover = () => {
    toast.classList.remove("visivel");
    setTimeout(() => toast.remove(), 180);
  };

  setTimeout(remover, duracao);
  toast.addEventListener("click", remover);
}

export function confirmarAcao({
  titulo = "Confirmar ação",
  mensagem = "Tem certeza que deseja continuar?",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  perigoso = false
} = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-confirmacao-overlay";

    overlay.innerHTML = `
      <div class="modal-confirmacao" role="dialog" aria-modal="true" aria-labelledby="modal-confirmacao-titulo">
        <h3 id="modal-confirmacao-titulo">${escaparHtml(titulo)}</h3>
        <p>${escaparHtml(mensagem)}</p>
        <div class="modal-confirmacao-acoes">
          <button type="button" class="botao botao-secundario" data-cancelar>${escaparHtml(textoCancelar)}</button>
          <button type="button" class="botao ${perigoso ? "botao-perigo" : "botao-primario"}" data-confirmar>${escaparHtml(textoConfirmar)}</button>
        </div>
      </div>
    `;

    function fechar(resultado) {
      overlay.classList.remove("visivel");
      setTimeout(() => {
        overlay.remove();
        resolve(resultado);
      }, 140);
    }

    overlay.addEventListener("click", (evento) => {
      if (evento.target === overlay) fechar(false);
    });

    overlay.querySelector("[data-cancelar]")?.addEventListener("click", () => fechar(false));
    overlay.querySelector("[data-confirmar]")?.addEventListener("click", () => fechar(true));

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("visivel"));
  });
}
