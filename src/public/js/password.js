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
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return regex.test(password);
}

document.querySelector("#update-password-btn").addEventListener("click", (ev) => {
    ev.preventDefault();

    const newPassord = document.querySelector("#newPassword").value;
    const newPasswordConfirmation = document.querySelector(
      "#newPasswordConfirmation"
    ).value;

    if (!validatePassword(newPassord)) {
        showMessage("A senha deve ter no mínimo 8 caracteres e conter letra e números.", "red")
    }

    if (newPassord !== newPasswordConfirmation) {
        showMessage("As senhas não coincidem!", "red")
    }
  });
