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

    // Salvar o usuário logado no localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    console.log(data.token, data.role);

    // Redirecionar com base na role
    if (data.role === "user") {
      window.location.href = "user.html";
    } else if (data.role === "admin") {
      window.location.href = "admin.html";
    }
  } catch (error) {
    showMessage(error.message, "red");
    console.error("Erro ao fazer login:", error);
  }
}

// Função para enviar o e-mail do password recovery
async function recoveryPassword(ev) {
  ev.preventDefault();

  const { value: email } = await Swal.fire({
    width: "40em",
    title: "Recuperar senha",
    input: "email",
    inputLabel:
      "Informe o e-mail cadastrado para receber o link de redefinição de senha.",
    inputPlaceholder: "Seu e-mail",
  });

  try {
    const response = await fetch(
      "http://localhost:3000/password/password-recovery",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showMessage("Erro ao recuperar senha:" + data.message, "red");
    }
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: `${data.message}`,
    });
  } catch (error) {
    showMessage("Erro ao tentar recuperar senha: ", error);
  }
}

document
  .querySelector("#password-recovery")
  .addEventListener("click", recoveryPassword);
document.querySelector(".form-sign-in").addEventListener("submit", login);
