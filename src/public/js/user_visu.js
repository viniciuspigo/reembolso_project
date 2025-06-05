let reembolsosAtuais = [];

// Função que recebe pega as infos da API de reembolso e popula no HTML
async function loadReembolsos(page = 1, filterName = "") {
  const usuarioLogado = verifyUser();
  if (!usuarioLogado) return;

  const { token } = usuarioLogado;
  const BASE_URL = window.location.origin;

  try {
    const url = filterName
      ? `${BASE_URL}/solicitacoes/email?pagina=${page}&nome=${encodeURIComponent(filterName)}`
      : `${BASE_URL}/solicitacoes/email?pagina=${page}`;

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

    // Preenche os itens disponíveis
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
          <div class="reembolso-status">
            <p>${reembolso.status}</p>
          </div>
          <div class="reembolso-value">
            <span>R$</span>
            <p>${formatedValue}</p>
          </div>
        </div>
      `;

      if (reembolso.status === "pendente") {
        const reembolsoStatus = orderItem.querySelector(".reembolso-status");
        reembolsoStatus.classList.add("pending");
      } else if (reembolso.status === "aprovado") {
        const reembolsoStatus = orderItem.querySelector(".reembolso-status");
        reembolsoStatus.classList.add("approved");
      } else if (reembolso.status === "rejeitado") {
        const reembolsoStatus = orderItem.querySelector(".reembolso-status");
        reembolsoStatus.classList.add("rejected");
      }

      refundOrder.appendChild(orderItem);
    });

    updatePages(data.paginaAtual, data.totalPaginas);
    configItensDetails();
  } catch (error) {
    console.error("Erro ao carregar reembolsos:", error.message, error.stack);
  }
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

// Função que filtra a pesquisa do Input pelo nome
function searchByName() {
  const nomeFiltro = document
    .querySelector(".refund-filter input")
    .value.trim();
  loadReembolsos(1, nomeFiltro);
}


// Função para decodificar o token JWT
function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

// Verificação do usuário pelo localStorage
function verifyUser() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    window.location.href = "/";
    return null;
  }

  if (role !== "user") {
    window.location.href = role === "admin" ? "admin.html" : "/";
    return null;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.email) {
    console.error("E-mail não encontrado no token.");
    window.location.href = "/";
    return null;
  }

  return { token, role, email: decoded.email };
}

// Função para preencher o nome do usuário no header
async function setUserName() {
  const usuarioLogado = verifyUser();
  if (!usuarioLogado) return;

  const userNameSpan = document.querySelector("#user-name");
  userNameSpan.textContent = usuarioLogado.email.split("@")[0];
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
}

// Quando a pagina é carregada, ativa tudo o que estiver dentro da função
document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = verifyUser();
  if (!usuarioLogado) return;

  setUserName();
  configLogout();
  loadReembolsos(1);

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
