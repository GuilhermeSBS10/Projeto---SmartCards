import { redirecionarSeAutenticado } from "../auth/auth.js";
import { loginUser, registerUser } from "../services/api.js";
import {
  salvarRefreshToken,
  salvarToken,
  salvarUsuario
} from "../utils/storage.js";
import { mostrarErro, mostrarSucesso } from "../utils/helpers.js";

function extrairSessao(payload) {
  if (!payload || typeof payload !== "object") return {};

  return {
    accessToken: payload.accessToken || payload.token || payload.access_token || "",
    refreshToken: payload.refreshToken || payload.refresh_token || "",
    usuario: payload.user || payload.usuario || null
  };
}

function setEstadoFormulario(form, carregando) {
  const controles = form.querySelectorAll("button, input, select, textarea");
  controles.forEach((item) => {
    item.disabled = carregando;
  });
}

function initLogin() {
  const form = document.querySelector("#formulario-entrada");
  if (!form) return;
  const botaoIrCadastro = document.querySelector("#botao-ir-cadastro");

  redirecionarSeAutenticado("dashboard.html");

  botaoIrCadastro?.addEventListener("click", () => {
    window.location.href = "cadastro.html";
  });

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const email = form.querySelector("#email")?.value.trim();
    const senha = form.querySelector("#senha")?.value;
    if (!email || !senha) {
      mostrarErro("Preencha email e senha.");
      return;
    }

    try {
      setEstadoFormulario(form, true);
      const resposta = await loginUser({ email, senha });
      const sessao = extrairSessao(resposta);

      if (!sessao.accessToken) {
        mostrarErro("Login sem token. Verifique o contrato da API.");
        return;
      }

      salvarToken(sessao.accessToken);
      if (sessao.refreshToken) salvarRefreshToken(sessao.refreshToken);
      if (sessao.usuario) salvarUsuario(sessao.usuario);

      mostrarSucesso("Login realizado com sucesso.");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } catch (erro) {
      mostrarErro(erro?.message || "Não foi possível entrar agora.");
    } finally {
      setEstadoFormulario(form, false);
    }
  });
}

function initCadastro() {
  const form = document.querySelector("#formulario-cadastro");
  if (!form) return;

  redirecionarSeAutenticado("dashboard.html");

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = form.querySelector("#nome")?.value.trim();
    const email = form.querySelector("#email")?.value.trim();
    const senha = form.querySelector("#senha")?.value;
    const confirmarSenha = form.querySelector("#confirmar-senha")?.value;

    if (!nome || !email || !senha || !confirmarSenha) {
      mostrarErro("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      mostrarErro("As senhas não conferem.");
      return;
    }

    try {
      setEstadoFormulario(form, true);
      const resposta = await registerUser({ nome, email, senha });
      const sessao = extrairSessao(resposta);

      if (sessao.accessToken) {
        salvarToken(sessao.accessToken);
        if (sessao.refreshToken) salvarRefreshToken(sessao.refreshToken);
        if (sessao.usuario) salvarUsuario(sessao.usuario);
        mostrarSucesso("Cadastro concluído. Entrando na sua conta.");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 600);
        return;
      }

      mostrarSucesso("Cadastro concluído. Faça login para continuar.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 700);
    } catch (erro) {
      mostrarErro(erro?.message || "Não foi possível concluir cadastro.");
    } finally {
      setEstadoFormulario(form, false);
    }
  });
}

initLogin();
initCadastro();
