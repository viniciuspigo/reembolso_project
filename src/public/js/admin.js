let reembolsosAtuais = [];

// Função que recebe pega as infos da API de reembolso e popula no HTML
async function loadReembolsos(pagina = 1, nomeFiltro = "") {
  try {
    const url = nomeFiltro
      ? `http://localhost:3000/solicitacoes?pagina=${pagina}&nome=${encodeURIComponent(nomeFiltro)}`
      : `http://localhost:3000/solicitacoes?pagina=${pagina}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao carregar reembolsos");
    }

    reembolsosAtuais = data.registrosInfo;

    const refundOrder = document.querySelector(".refund-order");
    refundOrder.innerHTML = "";

    // Preenche os itens disponíveis (até o tamanho do array retornado)
    reembolsosAtuais.forEach((reembolso, index) => {
      const orderItem = document.createElement("div");
      orderItem.className = "order-item";
      orderItem.id = `order-${index + 1}`;
      orderItem.dataset.index = index; // Define o índice correto

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

      const valorFormatado = new Intl.NumberFormat("pt-BR", {
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
          <p>${valorFormatado}</p>
        </div>
      `;

      refundOrder.appendChild(orderItem);
    });

    updatePag(data.paginaAtual, data.totalPaginas);
    configurarEventosClique();
  } catch (error) {
    console.error("Erro ao carregar reembolsos:", error.message);
  }
}

// Função que atualiza no html a paginação (Numero de paginas)
function updatePag(paginaAtual, totalPaginas) {
  const btnAnterior = document.querySelector(".prev-btn");
  const btnProxima = document.querySelector(".next-btn");
  const paginaInfo = document.querySelector(".page-indicator");

  btnAnterior.disabled = paginaAtual === 1;
  btnProxima.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
  paginaInfo.textContent = `${paginaAtual}/${totalPaginas || 1}`;
}

// Função que filtra a pesquisa do Input pelo nome do user
function searchByName() {
  const nomeFiltro = document.querySelector(".refund-filter input").value.trim();
  loadReembolsos(1, nomeFiltro);
}

// Verificação do usuário pelo localStorage (POR ENQUANTO) | Vou deixar em um BD no futuro
function verifyUser() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || usuarioLogado.role !== "admin") {
    window.location.href =
      usuarioLogado && usuarioLogado.role === "user"
        ? "user.html"
        : "sign-in.html";
    return null;
  }
  return usuarioLogado;
}

// Configuração do btn de logout
function configLogout() {
  document.querySelector(".logout-btn").addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    setTimeout(() => {
      window.location.href = "sign-in.html";
    }, 150);
  });
}

// DETALHES DO REEMBOLSO
function configurarEventosClique() {
  const refundInformation = document.querySelector(".refund-item-information");
  const refundContent = document.querySelector(".refund-content");
  const refundPanel = document.querySelector(".refund-panel");
  const nomeSolicitacaoInput = document.querySelector("#nomeSolicitacao");
  const categoriaInput = document.querySelector("#categoriaSelect");
  const valorInput = document.querySelector("#valorReembolso");
  const comprovanteBtn = document.querySelector(".comprovante-btn");

  document.querySelectorAll(".order-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = parseInt(item.dataset.index, 10);
      const reembolso = reembolsosAtuais[index];
      if (reembolso) {
        nomeSolicitacaoInput.value = reembolso.nome;
        categoriaInput.value = reembolso.categoria;
        valorInput.value = reembolso.valor.toFixed(2);

        refundInformation.style.display = "flex";
        refundContent.style.display = "none";
        refundPanel.style.width = "512px";
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
  // Carrega o usuário logado
  const usuarioLogado = verifyUser()
  if (!usuarioLogado) return;

  configLogout()

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
  document.querySelector(".refund-filter input").addEventListener("keypress", (ev) => {
      if (ev.key === "Enter") {
        searchByName();
      }
    });

  document.querySelector(".refund-filter button").addEventListener("click", pesquisarPorNome);

  console.log(reembolsosAtuais)
});