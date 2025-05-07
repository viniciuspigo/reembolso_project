const confirmationSection = document.querySelector(".confirmation-section");
const form = document.querySelector("#form");
const sendBtn = document.querySelector("#send-btn");
const uploadButton = document.querySelector(".upload-button");
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

// Verificação do usuário pelo localStorage (POR ENQUANTO) | Vou deixar em um BD no futuro
function verifyUser() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || usuarioLogado.role !== "user") {
    window.location.href =
      usuarioLogado && usuarioLogado.role === "admin"
        ? "admin.html"
        : "sign-in.html";
    return null;
  }
  return usuarioLogado;
}

// Configuração do btn de logout
function configLogout() {
  document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    setTimeout(() => {
      window.location.href = "sign-in.html";
    }, 150);
  });
}

// Configuração do input de Arquivo
function configFileInput() {
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

// Função para enviar a Req no BD (SQLite)
async function enviarSolicitacao(ev, usuarioLogado) {
  ev.preventDefault();

  const nomeSolicitacao = document
    .querySelector("#nomeSolicitacao")
    .value.trim();
  const select = document.querySelector("#categoriaSelect");
  const categoria = select.value;
  const valorReembolso = parseFloat(
    document.querySelector("#valorReembolso").value
  );
  const comprovante =
    fileInput.files.length > 0 ? fileInput.files[0].name : null;

  if (categoria === "selecione") {
    select.style.borderColor = "red";
    showMessage("Selecione uma categoria!", "red");
    return;
  } else {
    select.style.borderColor = "";
  }

  const solicitacao = {
    usuarioEmail: usuarioLogado.email,
    nome: nomeSolicitacao,
    categoria: categoria,
    valor: valorReembolso,
    comprovante: comprovante,
    createdAt: new Date().toISOString(),
  };

  try {
    const response = await fetch("http://localhost:3000/solicitacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(solicitacao),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Erro ao enviar solicitação.");
    }

    // Ativa a div escondida no html de confirmação do form
    form.style.display = "none";
    confirmationSection.style.display = "block";
  } catch (error) {
    showMessage(error.message, "red");
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

  // Mostrar o nome do user no header
  document.querySelector("#user-name").textContent = usuarioLogado.fullname;

  form.addEventListener("submit", (ev) => enviarSolicitacao(ev, usuarioLogado));

  configLogout();
  configFileInput()
});
