const { supabase, pgPool } = require("../config/supabase");
const { createSolicitacaoToDB, deleteSolicitacaoFromDB } = require("../models/solicitacao");

const solicitacaoController = {
  async createSolicitacao(req, res) {
    try {
      const { email, nome, categoria, valor } = req.body;
      const comprovante = req.file;

      if (!email || !nome || !categoria || !valor) {
        return res
          .status(400)
          .json({ message: "Campos obrigatórios não preenchidos." });
      }

      if (req.user.role !== "user") {
        return res.status(401).json({ message: "Apenas usuários podem criar uma solicitacação." });
      }

      if (comprovante && comprovante.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "O arquivo de comprovante deve ser um PDF." });}

      let comprovanteUrl = null;
      // Upload para o Bucket do Supabase
      if (comprovante) {
        const fileName = `comprovantes-reembolso/${Date.now()}_${comprovante.originalname}`;
        console.log("Fazendo upload para Supabase:", fileName);
        const { data, error } = await supabase.storage.from("comprovantes-reembolso")
        .upload(fileName, comprovante.buffer, {
            contentType: "application/pdf",
          });

        if (error) {
          console.error("Erro ao enviar comprovante:", error);
          return res.status(500).json({ message: "Erro ao enviar comprovante.", details: error.message, });
        }

        // Pegando a URL pública do Bucket
        const { data: urlData } = supabase.storage.from("comprovantes-reembolso").getPublicUrl(fileName);

        if (!urlData.publicUrl) {
          console.error("Erro ao obter URL pública do comprovante");
          return res.status(500).json({ message: "Erro ao obter URL do comprovante." });
        }

        comprovanteUrl = urlData.publicUrl;
        console.log("URL pública gerada:", comprovanteUrl);
      } else {
        console.log("Nenhum comprovante enviado");
      }

      // Criando a Solicitação
      await createSolicitacaoToDB(pgPool, {
        email,
        nome,
        categoria,
        valor,
        comprovante: comprovanteUrl,
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
        whereClauses.push("id = $1");
        countParams.push(idFiltro);
      }
      if (emailFiltro !== null) {
        whereClauses.push("email = $" + (countParams.length + 1));
        countParams.push(emailFiltro);
      }
      if (nomeFiltro !== null) {
        whereClauses.push("nome ILIKE $" + (countParams.length + 1));
        countParams.push(nomeFiltro);
      }

      if (whereClauses.length > 0) {
        countQuery += ` WHERE ${whereClauses.join(" AND ")}`;
      }

      const { rows: countRows } = await pgPool.query(countQuery, countParams);
      const totalRegistros = countRows[0].total
      const totalPaginas = Math.ceil(totalRegistros / limite);

      // Monta a query de seleção
      let selectQuery = "SELECT * FROM solicitacao";
      let selectParams = [];
      let selectWhereClauses = [];

      if (idFiltro !== null) {
        selectWhereClauses.push("id = $1");
        selectParams.push(idFiltro);
      }
      if (emailFiltro !== null) {
        selectWhereClauses.push("email = $" + (selectParams.length + 1));
        selectParams.push(emailFiltro);
      }
      if (nomeFiltro !== null) {
        selectWhereClauses.push("nome ILIKE $" + (selectParams.length + 1));
        selectParams.push(nomeFiltro);
      }

      if (selectWhereClauses.length > 0) {
        selectQuery += ` WHERE ${selectWhereClauses.join(" AND ")}`;
      }

      selectQuery += ` ORDER BY id DESC LIMIT $${selectParams.length + 1} OFFSET $${selectParams.length + 2}`;
      selectParams.push(limite, offset);

      const { rows } = await pgPool.query(selectQuery, selectParams);

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
        return res
          .status(400)
          .json({ message: "ID da solicitação é inválido!" });
      }

      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Apenas administradores podem excluir solicitações!",
        });
      }

      // Deletando a Solicitação de um ID específico
      await deleteSolicitacaoFromDB(pgPool, {
        id: id,
      });

      return res
        .status(200)
        .json({ message: "Solicitação excluída com sucesso!" });
    } catch (error) {
      console.error("Erro ao excluir solicitação:", error.message);
      if (error.message === "Nenhuma solicitação encontrada com esse ID.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao excluir solicitação." });
    }
  },
};

module.exports = solicitacaoController;
