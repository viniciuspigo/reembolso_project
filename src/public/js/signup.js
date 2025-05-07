const formSignUp = document.querySelector(".form-sign-up");

// Carregar usuários já cadastrados do localStorage
let users = JSON.parse(localStorage.getItem("usuarios")) || [];

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

// Função pra criar o user e salvar no localStorage (momentaneo)
function registerUser(ev) {
  ev.preventDefault();

  const fullname = document.querySelector("#input-fullname").value.trim();
  const email = document.querySelector("#input-email").value.trim();
  const password = document.querySelector("#input-password").value.trim();
  const passwordConfirmation = document.querySelector("#input-password-confirmation").value.trim();

  if (
    fullname === "" ||
    email === "" ||
    password === "" ||
    passwordConfirmation === ""
  ) {
    showMessage("Por favor, preencha todos os campos.", "red");
    return;
  }

  // Valida se a senha é forte
  if (!validatePassword(password)) {
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

  if (password !== passwordConfirmation) {
    showMessage("As senhas não coincidem!", "red");
    return;
  }

  const hashedPassword = sha256(password);

  const newUser = {
    fullname,
    email,
    password: hashedPassword,
    role: "user",
  };

  users.push(newUser);
  localStorage.setItem("usuarios", JSON.stringify(users));

  showMessage("Cadastro realizado com sucesso!", "green");

  clearInputs();

  setTimeout(() => {
    window.location.href = "sign-in.html";
  }, 1000);
}

// Função pra criar o userAdmin e salvar no localStorage (momentaneo)
function registerAdminUser() {
  let users = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Verifica se o admin já existe
  if (users.some(user => user.email === "admin@exemplo.com")) {
    console.log("Usuário admin já existe.");
    return;
  }

  const adminPassword = "Admin123";
  const hashedPassword = sha256(adminPassword);

  const userAdmin = {
    fullname: "Admin User",
    email: "admin@exemplo.com",
    password: hashedPassword,
    role: "admin"
  };

  users.push(userAdmin);
  localStorage.setItem("usuarios", JSON.stringify(users));
  console.log("Usuário admin criado com sucesso!");
}

registerAdminUser()

formSignUp.addEventListener("submit", registerUser);
