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

// Função para validar a senha
function validatePassword(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// Função para validar a senha passada e dar update no db do supabase
async function updatePassword(ev) {
  const BASE_URL = window.location.origin;
  ev.preventDefault();

  const newPassword = document.querySelector("#newPassword").value.trim();
  const newPasswordConfirmation = document.querySelector("#newPasswordConfirmation").value.trim();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    showMessage("Token inválido ou ausente.", "red");
    setTimeout(() => {
      window.location.href = `${BASE_URL}/sign-in`;
    }, 1500);
    return;
  }

  if (!validatePassword(newPassword)) {
    showMessage(
      "A senha deve ter no mínimo 8 caracteres e conter letra e números.",
      "red"
    );
    return;
  }

  if (newPassword !== newPasswordConfirmation) {
    showMessage("As senhas não coincidem!", "red");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/password/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showMessage(`Erro: ${data.message}`, "red");
      setTimeout(() => {
        window.location.href = "sign-in.html";
      }, 1500);
      return;
    }

    showMessage(
      "Senha atualizada com sucesso! Redirecionando para o login...",
      "green"
    );
    setTimeout(() => {
      window.location.href = "sign-in.html";
    }, 1500);
  } catch (error) {
    showMessage(`Erro ao redefinir senha: ${error.message}`, "red");
    console.error(error.message);
  }
}

document.querySelector("#update-password-btn").addEventListener("click", updatePassword);
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    alert("Token inválido ou ausente.");
    setTimeout(() => {
      window.location.href = "sign-in.html";
    }, 1500);
  }
});
