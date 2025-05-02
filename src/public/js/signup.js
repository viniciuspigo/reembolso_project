const formSignUp = document.querySelector(".form-sign-up");

// Carregar usuários já cadastrados do localStorage
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

function mostrarMensagem(texto, cor) {
  const message = document.querySelector(".message");
  message.style.display = "block";
  message.style.color = cor;
  message.innerText = texto;
  setTimeout(() => {
    message.style.display = "none";
  }, 5000);
}

function limparCampos() {
  document.querySelector("#input-fullname").value = "";
  document.querySelector("#input-email").value = "";
  document.querySelector("#input-password").value = "";
  document.querySelector("#input-password-confirmation").value = "";
}

function validarSenha(password) {
  // A senha deve ter pelo menos 8 caracteres, pelo menos uma letra e um número
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return regex.test(password);
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function cadastrarUsuario(ev) {
  ev.preventDefault();

  const fullname = document.querySelector("#input-fullname").value.trim();
  const email = document.querySelector("#input-email").value.trim();
  const password = document.querySelector("#input-password").value.trim();
  const passwordConfirmation = document
    .querySelector("#input-password-confirmation")
    .value.trim();

  if (
    fullname === "" ||
    email === "" ||
    password === "" ||
    passwordConfirmation === ""
  ) {
    mostrarMensagem("Por favor, preencha todos os campos.", "red");
    return;
  }

  // Valida se a senha é forte
  if (!validarSenha(password)) {
    mostrarMensagem(
      "A senha deve ter no mínimo 8 caracteres e conter letras e números.",
      "red"
    );
    return;
  }

  // Validação do e-mail
  if (!validarEmail(email)) {
    mostrarMensagem("Por favor, insira um email válido.", "red");
    return;
  }

  if (password !== passwordConfirmation) {
    mostrarMensagem("As senhas não coincidem!", "red");
    return;
  }

  const hashedPassword = sha256(password);

  const novoUsuario = {
    fullname,
    email,
    password: hashedPassword,
    role: "user",
  };

  usuarios.push(novoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  mostrarMensagem("Cadastro realizado com sucesso!", "green");

  limparCampos();

  setTimeout(() => {
    window.location.href = "sign-in.html";
  }, 3000);
}

function criarUsuarioAdmin() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Verifica se o admin já existe
  if (usuarios.some(user => user.email === "admin@exemplo.com")) {
    console.log("Usuário admin já existe.");
    return;
  }

  const adminPassword = "Admin123";
  const hashedPassword = sha256(adminPassword);

  const adminUsuario = {
    fullname: "Admin User",
    email: "admin@exemplo.com",
    password: hashedPassword,
    role: "admin"
  };

  usuarios.push(adminUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  console.log("Usuário admin criado com sucesso!");
}

criarUsuarioAdmin()

formSignUp.addEventListener("submit", cadastrarUsuario);
