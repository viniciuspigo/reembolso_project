const userForm = document.querySelector("#user-form");


function pegarValores(ev) {
  ev.preventDefault();

  const nomeSolicitacao = document.querySelector("#nomeSolicitacao").value;
  const categoria = document.querySelector("#categoriaSelect").value;
  const valorReembolso = document.querySelector("#valorReembolso").value;

  console.log(nomeSolicitacao, categoria, valorReembolso);

  userForm.reset()
}

userForm.addEventListener("submit", pegarValores);

 // Adicionando a funcionalidade o fileInput(hidden) no button
const uploadButton = document.querySelector(".upload-button");
const fileInput = document.querySelector("#comprovante");
uploadButton.addEventListener("click", () => {
  fileInput.click();
});

 // Atualizar o nome do documento no span
const fileNameSpan = document.querySelector(".file-name");
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileNameSpan.textContent = fileInput.files[0].name;
  }
});
