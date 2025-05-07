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

function login(ev) {
  ev.preventDefault();
  const email = document.querySelector("#input-email").value.trim();
  const password = document.querySelector("#input-password").value.trim();

  if (email === "" || password === "") {
    showMessage("Por favor, preencha todos os campos", "red");
    return;
  }

  // Carrega os users do localStorage
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem("usuarios")) || [];
  } catch (e) {
    showMessage("Erro ao carregar dados. Tente novamente.", "red");
    return;
  }

  const hashedPassword = sha256(password);
  const user = users.find(user => user.email === email && user.password === hashedPassword);

  if (!user) {
    showMessage("Email ou senha incorretos.", "red");
    return;
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(user));

  if (user.role === "user") {
    window.location.href = "user.html"
  } else if (user.role === "admin") {
    window.location.href = "admin.html"
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(user));
}

const formSignIn = document.querySelector(".form-sign-in")
.addEventListener("submit", login);