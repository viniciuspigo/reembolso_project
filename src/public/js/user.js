const confirmationSection = document.querySelector(".confirmation-section");
const form = document.querySelector("#form");
const sendBtn = document.querySelector("#send-btn");
const fileInput = document.querySelector("#comprovante");
const fileNameSpan = document.querySelector(".file-name");

// Função para mostrar mensagem de erro ou algum aviso
function showMessage(text, color) {
  const message = document.querySelector(".message");
  message.style.display = "block";
  message.style.color = color;
  message.innerText = text;
  setTimeout(() => {
    message.style.display = "none";
  }, 3000);
}

// Função para resetar o form
function resetForm() {
  form.reset();
  fileNameSpan.textContent = "Nome do arquivo.pdf";
  categoriaSelect.style.borderColor = "";
}

// Função para decodificar o token JWT
function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

// Verificação do usuário pelo localStorage
function verifyUser() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    window.location.href = "/";
    return null;
  }

  if (role !== "user") {
    window.location.href = role === "admin" ? "admin.html" : "/";
    return null;
  }

  const decoded = decodeToken(token);
  return { token, role, email: decoded.email };
}
// Configuração do btn de logout
function configLogout() {
  document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setTimeout(() => {
      window.location.href = "/";
    }, 150);
  });
}

// Configuração do input de Arquivo
function configFileInput() {
  const uploadButton = document.querySelector(".upload-button");
  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });

  // Nome do arquivo sendo mostrado no input do span
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      fileNameSpan.textContent = fileInput.files[0].name;
    }
  });
}

// Função para enviar a Req no BD
async function enviarSolicitacao(ev, usuarioLogado) {
  ev.preventDefault();
  const BASE_URL = window.location.origin;
  console.log("BASE_URL:", BASE_URL)

  const nomeSolicitacao = document
    .querySelector("#nomeSolicitacao")
    .value.trim();
  const select = document.querySelector("#categoriaSelect");
  const categoria = select.value;
  const valorReembolso = parseFloat(
    document.querySelector("#valorReembolso").value
  );
  const comprovante = fileInput.files.length > 0 ? fileInput.files[0] : null;
  console.log(comprovante)
  const token = localStorage.getItem("token");

  if (categoria === "selecione") {
    select.style.borderColor = "red";
    showMessage("Selecione uma categoria!", "red");
    return;
  } else {
    select.style.borderColor = "";
  }

  const formData = new FormData()
  formData.append("email", usuarioLogado.email)
  formData.append("nome", nomeSolicitacao)
  formData.append("categoria", categoria)
  formData.append("valor", valorReembolso)
  if (comprovante) {
    formData.append("comprovante", comprovante)
  }

  try {
    if (!token) {
      throw new Error("Token não encontrado. Faça login novamente.");
    }

    const response = await fetch(`${BASE_URL}/solicitacoes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/";
        return;
      }
      throw new Error(data.message || "Erro ao enviar solicitação.");
    }

    // Mostra a div de realizar uma nova solicitação
    form.style.display = "none";
    confirmationSection.style.display = "block";
  } catch (error) {
    showMessage(error.message, "red");
    console.error(error.message, error.stack)
  }
}

// Quando o btn é ativado, mostra a div do formulario novamente
document.querySelector("#new-request-button").addEventListener("click", () => {
  confirmationSection.style.display = "none";
  form.style.display = "block";
  resetForm();
});

// Quando a pagina é carregada, ativa tudo o que estiver dentro da função
document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = verifyUser();
  if (!usuarioLogado) return;

  const emailFormatado = usuarioLogado.email.split("@")[0] 
  // Mostrar o nome do user no header
  document.querySelector("#user-name").textContent = emailFormatado ?? "Usuário";

  form.addEventListener("submit", (ev) => enviarSolicitacao(ev, usuarioLogado));

  configLogout();
  configFileInput();
});
