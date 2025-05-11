// Função para mostrar mensagem de erro ou algum aviso
function showMessage(text, color) {
  const message = document.querySelector(".message");
  message.style.display = "block";
  message.style.color = color;
  message.innerText = text;
  setTimeout(() => {
    message.style.display = "none";
  }, 5000);
}

// Função para limpar todos os inputs do form
function clearInputs() {
  document.querySelector("#input-fullname").value = "";
  document.querySelector("#input-email").value = "";
  document.querySelector("#input-password").value = "";
  document.querySelector("#input-password-confirmation").value = "";
}

// Função para validar a senha
function validatePassword(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return regex.test(password);
}

// Função para validar o email
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Função pra criar o user e salvar no bd
async function registerUser(ev) {
  ev.preventDefault();

  const nome_completo = document.querySelector("#input-fullname").value.trim();
  const email = document.querySelector("#input-email").value.trim();
  const senha = document.querySelector("#input-password").value.trim();
  const senhaConfirmation = document
    .querySelector("#input-password-confirmation")
    .value.trim();

  if (
    nome_completo === "" ||
    email === "" ||
    senha === "" ||
    senhaConfirmation === ""
  ) {
    showMessage("Por favor, preencha todos os campos.", "red");
    return;
  }

  // Valida se a senha é forte
  if (!validatePassword(senha)) {
    showMessage(
      "A senha deve ter no mínimo 8 caracteres e conter letras e números.",
      "red"
    );
    return;
  }

  // Validação do e-mail
  if (!validateEmail(email)) {
    showMessage("Por favor, insira um email válido.", "red");
    return;
  }

  if (senha !== senhaConfirmation) {
    showMessage("As senhas não coincidem!", "red");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/usuarios/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome_completo, email, senha, role: "user" }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Erro ${response.status}: ${text || "Sem resposta do servidor"}`
      );
    }

    const data = await response.json(); // Linha 82: Deve ser response.json() com parênteses
    showMessage(data.message, "green");
    clearInputs();
    setTimeout(() => {
      window.location.href = "sign-in.html";
    }, 1000);
  } catch (error) {
    showMessage("Erro ao cadastrar usuário: " + error.message, "red");
    console.error(error);
  }
}

// Função pra criar o userAdmin e salvar no bd
async function registerAdminUser() {
  try {
    const response = await fetch(
      "http://localhost:3000/usuarios/create-admin",
      {
        method: "GET",
      }
    );

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error);
  }
}

// Forçar a criação do user adm
document.addEventListener("DOMContentLoaded", () => {
  registerAdminUser();
});

document
  .querySelector(".form-sign-up")
  .addEventListener("submit", registerUser);
