const formSignIn = document.querySelector(".form-sign-in");

function mostrarMensagem(texto, cor) {
    const message = document.querySelector(".message");
    message.style.display = "block";
    message.style.color = cor;
    message.innerText = texto;
    setTimeout(() => {
      message.style.display = "none";
    }, 5000);
  }

function login(ev) {
  ev.preventDefault();
  const email = document.querySelector("#input-email").value.trim();
  const password = document.querySelector("#input-password").value.trim();

  if (email === "" || password === "") {
    mostrarMensagem("Por favor, preencha todos os campos", "red");
    return;
  }

  // Carrega usuários do localStorage
  let usuarios = [];
  try {
    usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  } catch (e) {
    mostrarMensagem("Erro ao carregar dados. Tente novamente.", "red");
    return;
  }

  const hashedPassword = sha256(password);
  const usuario = usuarios.find(user => user.email === email && user.password === hashedPassword);

  if (!usuario) {
    mostrarMensagem("Email ou senha incorretos.", "red");
    return;
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

  if (usuario.role === "user") {
    window.location.href = "user.html"
  } else if (usuario.role === "admin") {
    window.location.href = "admin.html"
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}


formSignIn.addEventListener("submit", login);