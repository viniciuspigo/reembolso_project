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

async function login(ev) {
  ev.preventDefault();

  const email = document.querySelector("#input-email").value.trim();
  const password = document.querySelector("#input-password").value.trim();

  if (email === "" || password === "") {
    showMessage("Por favor, preencha todos os campos", "red");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha: password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao fazer login.");
    }

    const data = await response.json();
    showMessage(data.message, "green");

    // Salvar o usuário logado no localStorage (opcional, para uso nas páginas user.html/admin.html)
    localStorage.setItem("usuarioLogado", JSON.stringify(data.user));

    // Redirecionar com base na role
    if (data.user.role === "user") {
      window.location.href = "user.html";
    } else if (data.user.role === "admin") {
      window.location.href = "admin.html";
    }
  } catch (error) {
    showMessage(error.message, "red");
    console.error("Erro ao fazer login:", error);
  }
}

document.querySelector(".form-sign-in").addEventListener("submit", login);