const { createSolicitacaoToDB, deleteSolicitacaoFromDB } = require("../models/solicitacao");

const solicitacaoController = {
  async createSolicitacao(req, res) {
    const { email, nome, categoria, valor, comprovante } = req.body;

    try {
      if (!email || !nome || !categoria || !valor) {
        return res
          .status(400)
          .json({ message: "Campos obrigatórios não preenchidos." });
      }

      await createSolicitacaoToDB(req.app.get("mysqlPool"), {
        email,
        nome,
        categoria,
        valor,
        comprovante,
      });

      res.status(201).json({ message: "Solicitação criada com sucesso!" });
    } catch (error) {
      console.error("Erro ao criar solicitação:", error.message);
      res.status(500).json({ message: "Erro ao criar solicitação." });
    }
  },

  async getAllSolicitacoes(req, res) {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = 6;
    const offset = (pagina - 1) * limite;
    const nomeFiltro = req.query.nome ? `%${req.query.nome}%` : null;
    const idFiltro = req.query.id ? parseInt(req.query.id) : null;
    const emailFiltro =
      req.query.email && req.query.email.trim() !== "" ? req.query.email : null;

    if (pagina < 1) {
      return res
        .status(400)
        .json({ message: "A página deve ser um número maior ou igual a 1." });
    }

    if (req.query.id && isNaN(parseInt(req.query.id))) {
      return res
        .status(400)
        .json({ message: "O ID deve ser um número válido." });
    }

    try {
      // Monta a query de contagem
      let countQuery = "SELECT COUNT(*) as total FROM solicitacao";
      let countParams = [];
      let whereClauses = [];

      if (idFiltro !== null) {
        whereClauses.push("id = ?");
        countParams.push(idFiltro);
      }
      if (emailFiltro !== null) {
        whereClauses.push("email = ?");
        countParams.push(emailFiltro);
      }
      if (nomeFiltro !== null) {
        whereClauses.push("nome LIKE ?");
        countParams.push(nomeFiltro);
      }

      if (whereClauses.length > 0) {
        countQuery += ` WHERE ${whereClauses.join(" AND ")}`;
      }

      const [countResult] = await req.app
        .get("mysqlPool")
        .execute(countQuery, countParams);
      const totalRegistros = countResult[0].total;
      const totalPaginas = Math.ceil(totalRegistros / limite);

      // Monta a query de seleção
      let selectQuery = "SELECT * FROM solicitacao";
      let selectParams = [];
      let selectWhereClauses = [];

      if (idFiltro !== null) {
        selectWhereClauses.push("id = ?");
        selectParams.push(idFiltro);
      }
      if (emailFiltro !== null) {
        selectWhereClauses.push("email = ?");
        selectParams.push(emailFiltro);
      }
      if (nomeFiltro !== null) {
        selectWhereClauses.push("nome LIKE ?");
        selectParams.push(nomeFiltro);
      }

      if (selectWhereClauses.length > 0) {
        selectQuery += ` WHERE ${selectWhereClauses.join(" AND ")}`;
      }

      selectQuery += ` LIMIT ${limite} OFFSET ${offset}`; // Concatenar diretamente

      const [rows] = await req.app
        .get("mysqlPool")
        .execute(selectQuery, selectParams);

      res.status(200).json({
        paginaAtual: pagina,
        totalPaginas,
        totalRegistros,
        registrosInfo: rows,
      });
    } catch (error) {
      console.error("Erro ao listar solicitações:", error.message, error.stack);
      res.status(500).json({ message: "Erro ao listar solicitações." });
    }
  },

  async deleteSolicitacao(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
      if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "ID da solicitação é inválido!" });
      }

      await deleteSolicitacaoFromDB(req.app.get('mysqlPool'), {
        id: id
      })

      return res.status(200).json({ message: "Solicitação excluída com sucesso!"})
    } catch (error) {
      console.error("Erro ao excluir solicitação:", error.message);
      res.status(500).json({ message: "Erro ao excluir solicitação." });
    }
  }
};

module.exports = solicitacaoController;
