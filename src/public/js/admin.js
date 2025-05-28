let reembolsosAtuais = [];

// Função que recebe pega as infos da API de reembolso e popula no HTML
async function loadReembolsos(page = 1, filterName = "") {
  const token = localStorage.getItem("token");
  const BASE_URL = window.location.origin;

  try {
    if (!token) {
      throw new Error("Token não encontrado. Faça login novamente.");
    }

    const url = filterName
      ? `${BASE_URL}/solicitacoes?pagina=${page}&nome=${encodeURIComponent(
          filterName
        )}`
      : `${BASE_URL}/solicitacoes?pagina=${page}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/";
        return;
      } else {
        throw new Error(data.message || "Erro ao carregar dados");
      }
    }

    reembolsosAtuais = data.registrosInfo;

    const refundOrder = document.querySelector(".refund-order");
    refundOrder.innerHTML = "";

    // Preenche os itens disponíveis (até o tamanho do array retornado)
    reembolsosAtuais.forEach((reembolso, index) => {
      const orderItem = document.createElement("div");
      orderItem.className = "order-item";
      orderItem.id = `order-${index + 1}`;
      orderItem.dataset.index = index;

      let iconePath;
      switch (reembolso.categoria.toLowerCase()) {
        case "alimentação":
          iconePath = "./assets/images/order_img/alimentacao.svg";
          break;
        case "hospedagem":
          iconePath = "./assets/images/order_img/hospedagem.svg";
          break;
        case "transporte":
          iconePath = "./assets/images/order_img/transporte.svg";
          break;
        case "serviços":
          iconePath = "./assets/images/order_img/servicos.svg";
          break;
        case "outros":
          iconePath = "./assets/images/order_img/outros.svg";
          break;
        default:
          iconePath = "./assets/images/order_img/outros.svg";
      }

      const formatedValue = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
        .format(reembolso.valor)
        .replace("R$", "")
        .trim();

      orderItem.innerHTML = `
        <div class="left-content">
          <img src="${iconePath}" alt="${reembolso.categoria}">
          <div class="text-content">
            <h2>${reembolso.nome}</h2>
            <p>${reembolso.categoria}</p>
          </div>
        </div>
        <div class="right-content">
          <span>R$</span>
          <p>${formatedValue}</p>
        </div>
      `;

      refundOrder.appendChild(orderItem);
    });

    updatePages(data.paginaAtual, data.totalPaginas);
    configItensDetails();
  } catch (error) {
    console.error("Erro ao carregar reembolsos:", error.message);
  }
}

// Função para deletar o reembolso especificado
async function deleteReembolso() {
  const BASE_URL = window.location.origin;
  const refundInformation = document.querySelector(".refund-item-information");
  const refundContent = document.querySelector(".refund-content");
  const refundPanel = document.querySelector(".refund-panel");
  const reembolsoId = refundInformation.dataset.reembolsoId;
  const token = localStorage.getItem("token");

  if (!reembolsoId) {
    console.error("ID do reembolso não encontrado!");
    return;
  }

  Swal.fire({
    title: "Tem certeza?",
    text: `Você deseja deletar o reembolso ${reembolsoId}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Deletar!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${BASE_URL}/solicitacoes/${reembolsoId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/";
            return;
          } else {
            throw new Error(data.message || "Erro ao carregar dados");
          }
        }

        await Swal.fire(
          "Excluído!",
          "O reembolso foi deletado com sucesso.",
          "success"
        );

        loadReembolsos(1);
        refundInformation.style.display = "none";
        refundContent.style.display = "flex";
        refundPanel.style.width = "1082px";

        // Configuração da Notificação pós exclussão de documentos.
        const notyf = new Notyf({
          duration: 3500,
          ripple: true,
          dismissible: true,
          position: {
            x: "right",
            y: "top",
          },
        });
        notyf.success(" Reembolso removido com sucesso.");
      } catch (error) {
        console.error("Erro ao deletar reembolso:", error.message);
        Swal.fire(
          "Erro!",
          `Houve um problema ao tentar deletar o reembolso. ${error.message}`,
          "error"
        );
      }
    }
  });
}

// Função que atualiza no html a paginação (Numero de paginas)
function updatePages(page, totalPages) {
  const btnAnterior = document.querySelector(".prev-btn");
  const btnProxima = document.querySelector(".next-btn");
  const paginaInfo = document.querySelector(".page-indicator");

  btnAnterior.disabled = page === 1;
  btnProxima.disabled = page === totalPages || totalPages === 0;
  paginaInfo.textContent = `${page}/${totalPages || 1}`;
}

// Função que filtra a pesquisa do Input pelo nome do user
function searchByName() {
  const nomeFiltro = document
    .querySelector(".refund-filter input")
    .value.trim();
  loadReembolsos(1, nomeFiltro);
}

// Verificação do usuário pelo localStorage (POR ENQUANTO) | Vou deixar em um BD no futuro
function verifyUser() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    window.location.href = "/";
    return null;
  }

  if (role !== "admin") {
    window.location.href = role === "user" ? "user.html" : "admin.html";
    return null;
  }

  return { token, role };
}

// Configuração do btn de logout
function configLogout() {
  document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setTimeout(() => {
      window.location.href = "/";
    }, 150);
  });
}

// DETALHES DO REEMBOLSO
function configItensDetails() {
  let comprovanteAtual = null;
  const refundInformation = document.querySelector(".refund-item-information");
  const refundContent = document.querySelector(".refund-content");
  const refundPanel = document.querySelector(".refund-panel");
  const nomeSolicitacaoInput = document.querySelector("#nomeSolicitacao");
  const categoriaInput = document.querySelector("#categoriaSelect");
  const valorInput = document.querySelector("#valorReembolso");
  const comprovanteBtn = document.querySelector(".comprovante-btn");

  // Adicionado o "onclick" ao invés do eventlistener para os events não ficarem tudo acumulado gerando erros
  comprovanteBtn.onclick = () => {
    if (
      comprovanteAtual === undefined ||
      comprovanteAtual === null ||
      !comprovanteAtual.startsWith("https://")
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Essa solicitação não possuí um comprovante vinculado.",
      });
    } else {
      window.open(comprovanteAtual, "_blank");
    }
  };

  document.querySelectorAll(".order-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = parseInt(item.dataset.index, 10);
      const reembolso = reembolsosAtuais[index];
      /* console.log(reembolsosAtuais[index].comprovante); */
      if (reembolso) {
        nomeSolicitacaoInput.value = reembolso.nome;
        categoriaInput.value = reembolso.categoria;
        valorInput.value = parseFloat(reembolso.valor).toFixed(2);
        refundInformation.dataset.reembolsoId = reembolso.id;

        refundInformation.style.display = "flex";
        refundContent.style.display = "none";
        refundPanel.style.width = "512px";
        comprovanteAtual = reembolso.comprovante_url;
      } else {
        console.error("Reembolso não encontrado para o índice:", index);
      }
    });
  });

  document.querySelector("#voltarBtn").addEventListener("click", () => {
    refundInformation.style.display = "none";
    refundContent.style.display = "flex";
    refundPanel.style.width = "1082px";
  });

  document
    .querySelector("#deleteBtn")
    .addEventListener("click", deleteReembolso);
}

// Quando a pagina é carregada, ativa tudo o que estiver dentro da função
document.addEventListener("DOMContentLoaded", () => {
  // Carrega o usuário logado
  const usuarioLogado = verifyUser();
  if (!usuarioLogado) return;

  configLogout();

  // carrega os reembolsos ao entrar na página (página 1 por padrão)
  loadReembolsos(1);

  // Controles de pagina
  document.querySelector(".prev-btn").addEventListener("click", () => {
    const paginaAtual = parseInt(
      document.querySelector(".page-indicator").textContent.split("/")[0]
    );
    if (paginaAtual > 1) {
      const nomeFiltro = document
        .querySelector(".refund-filter input")
        .value.trim();
      loadReembolsos(paginaAtual - 1, nomeFiltro);
    }
  });

  document.querySelector(".next-btn").addEventListener("click", () => {
    const paginaAtual = parseInt(
      document.querySelector(".page-indicator").textContent.split("/")[0]
    );
    const totalPaginas = parseInt(
      document.querySelector(".page-indicator").textContent.split("/")[1]
    );
    if (paginaAtual < totalPaginas) {
      const nomeFiltro = document
        .querySelector(".refund-filter input")
        .value.trim();
      loadReembolsos(paginaAtual + 1, nomeFiltro);
    }
  });

  // Pesquisa pelo nome que o usuário digitou no input
  document
    .querySelector(".refund-filter input")
    .addEventListener("keypress", (ev) => {
      if (ev.key === "Enter") {
        searchByName();
      }
    });

  document
    .querySelector(".refund-filter button")
    .addEventListener("click", searchByName);
});
