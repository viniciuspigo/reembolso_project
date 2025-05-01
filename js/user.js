function mostrarMensagem(texto, cor) {
  const message = document.querySelector(".message");
  message.style.display = "block";
  message.style.color = cor;
  message.innerText = texto;
  setTimeout(() => {
    message.style.display = "none";
  }, 3000);
}

const content = document.querySelector(".content");
const confirmationSection = document.querySelector(".confirmation-section");
const userForm = document.querySelector("#user-form");
const sendBtn = document.querySelector("#send-btn")

document.addEventListener("DOMContentLoaded", () => {
  // Carrega o user logado
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || usuarioLogado.role !== "user") {
    window.location.href =
      usuarioLogado && usuarioLogado.role === "admin"
        ? "admin.html"
        : "sign-in.html";
    return;
  }

  // Preenche o nome do user no header
  document.querySelector("#user-name").textContent = usuarioLogado.fullname;

  // Configuração do Input Personalizado
  const uploadButton = document.querySelector(".upload-button");
  const fileInput = document.querySelector("#comprovante");
  const fileNameSpan = document.querySelector(".file-name");

  // Adicionando a funcionalidade do fileInput(hidden) no button
  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });

  // Atualizar o nome do documento no span
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      fileNameSpan.textContent = fileInput.files[0].name;
    }
  });

  async function envioForm(ev) {
    ev.preventDefault();

    const nomeSolicitacao = document.querySelector("#nomeSolicitacao").value.trim();
    const select = document.querySelector("#categoriaSelect");
    const categoria = select.value;
    const valorReembolso = parseFloat(document.querySelector("#valorReembolso").value);
    const comprovante = fileInput.files.length > 0 ? fileInput.files[0].name : null;

    if (categoria === "selecione") {
      select.style.borderColor = "red";
      mostrarMensagem("Selecione uma categoria!", "red");
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

      // Oculta o form e altera para a "pagina" de confirmação
      console.log("Simulando envio bem-sucedido...");
      userForm.style.display = "none";
      content.style.display = "none";
      confirmationSection.style.display = "block";
    } catch (error) {
      mostrarMensagem(error.message, "red");
    }
  }
  
  // Evento do form
  userForm.addEventListener("submit", envioForm);

  // Botão nova solicitacao
  document.querySelector("#new-request-button").addEventListener("click", () => {
      // Oculta a tela de confirmação e exibe o formulário novamente
      confirmationSection.style.display = "none";
      userForm.style.display = "flex";
      content.style.display = "flex";

      fileNameSpan.textContent = "Nome do arquivo.pdf";
    });

  // Botao de deslogar o user
  document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    setTimeout(() => {
      window.location.href = "sign-in.html";
    }, 300);
  });
});
