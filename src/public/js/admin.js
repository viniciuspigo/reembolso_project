  // Função para carregar e exibir os reembolsos
  async function carregarReembolsos(pagina = 1, nomeFiltro = "") {
    try {
      const url = nomeFiltro
        ? `http://localhost:3000/solicitacoes?pagina=${pagina}&nome=${encodeURIComponent(nomeFiltro)}`
        : `http://localhost:3000/solicitacoes?pagina=${pagina}`;
      
      const response = await fetch(url);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Erro ao carregar reembolsos");
      }
  
      const refundOrder = document.querySelector(".refund-order");
      refundOrder.innerHTML = "";
      // Preenche até 6 itens
      for (let i = 0; i < 6; i++) {
        const reembolso = data.dados[i] || null;
        const orderItem = document.createElement("div");
        orderItem.className = "order-item";
        orderItem.id = `order-${i + 1}`;
  
        if (reembolso) {
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
                iconePath = "./assets/images/order_img/outros.svg"
                break;
            default:
              iconePath = "./assets/images/order_img/outros.svg";
          }
  
          // Formata o valor como moeda
          const valorFormatado = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
          }).format(reembolso.valor).replace("R$", "").trim(); // Remove "R$" para exibir separadamente
  
          // Monta o HTML do Reembolso Item
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
        }
  
        refundOrder.appendChild(orderItem);
      }
  
      // Atualiza os controles de paginação
      atualizarPaginacao(data.paginaAtual, data.totalPaginas);
    } catch (error) {
      console.error("Erro ao carregar reembolsos:", error.message);
    }
  }
  
  // atualizar os controles de paginação
  function atualizarPaginacao(paginaAtual, totalPaginas) {
    const btnAnterior = document.querySelector(".prev-btn");
    const btnProxima = document.querySelector(".next-btn");
    const paginaInfo = document.querySelector(".page-indicator");
  
    btnAnterior.disabled = paginaAtual === 1;
    btnProxima.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
    paginaInfo.textContent = `${paginaAtual}/${totalPaginas || 1}`;
  }
  
  function pesquisarPorNome() {
    const nomeFiltro = document.querySelector(".refund-filter input").value.trim();
    carregarReembolsos(1, nomeFiltro);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    // Carrega o usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || usuarioLogado.role !== "admin") {
      window.location.href =
        usuarioLogado && usuarioLogado.role === "user"
          ? "user.html"
          : "sign-in.html";
      return;
    }
  
    // carrega os reembolsos ao entrar na página (página 1 por padrão)
    carregarReembolsos(1);
  
    // Logout btn
    document.querySelector(".logout-btn").addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      setTimeout(() => {
        window.location.href = "sign-in.html";
      }, 300);
    });
  
    // Controles de pagina
    document.querySelector(".prev-btn").addEventListener("click", () => {
      const paginaAtual = parseInt(document.querySelector(".page-indicator").textContent.split("/")[0]);
      if (paginaAtual > 1) {
        const nomeFiltro = document.querySelector(".refund-filter input").value.trim();
        carregarReembolsos(paginaAtual - 1, nomeFiltro);
      }
    });
  
    document.querySelector(".next-btn").addEventListener("click", () => {
      const paginaAtual = parseInt(document.querySelector(".page-indicator").textContent.split("/")[0]);
      const totalPaginas = parseInt(document.querySelector(".page-indicator").textContent.split("/")[1]);
      if (paginaAtual < totalPaginas) {
        const nomeFiltro = document.querySelector(".refund-filter input").value.trim();
        carregarReembolsos(paginaAtual + 1, nomeFiltro);
      }
    });
  
    // Pesquisa pelo nome que o usuário digitou no input
    document.querySelector(".refund-filter input").addEventListener("keypress", (ev) => {
      if (ev.key === "Enter") {
        pesquisarPorNome();
      }
    });
  
    document.querySelector(".refund-filter button").addEventListener("click", pesquisarPorNome);
  });