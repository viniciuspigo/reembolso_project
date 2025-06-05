const { supabase, pgPool } = require("../config/supabase");
const {
  createSolicitacaoToDB,
  deleteSolicitacaoFromDB,
  getSolicitacaoFromDB,
  aproveSolicitacaoToDB,
  rejectSolicitacaoToDB,
} = require("../models/solicitacao");

const solicitacaoController = {
  async createSolicitacao(req, res) {
    try {
      const { email, nome, categoria, valor } = req.body;
      const comprovante = req.file;
      const comprovante_nome = `${comprovante?.originalname}_${Date.now()}`;

      if (!email || !nome || !categoria || !valor) {
        return res
          .status(400)
          .json({ message: "Campos obrigatórios não preenchidos." });
      }

      if (req.user.role !== "user") {
        return res
          .status(401)
          .json({ message: "Apenas usuários podem criar uma solicitacação." });
      }

      if (comprovante && comprovante.mimetype !== "application/pdf") {
        return res
          .status(400)
          .json({ message: "O arquivo de comprovante deve ser um PDF." });
      }

      let comprovanteUrl = null;
      // Upload para o Bucket do Supabase
      if (comprovante) {
        const fileName = `comprovantes-reembolso/${comprovante_nome}`;
        console.log("Fazendo upload para Supabase:", fileName);
        const { data, error } = await supabase.storage
          .from("comprovantes-reembolso")
          .upload(fileName, comprovante.buffer, {
            contentType: "application/pdf",
          });

        if (error) {
          console.error("Erro ao enviar comprovante:", error.message);
          return res.status(500).json({
            message: "Erro ao enviar comprovante.",
            details: error.message,
          });
        }

        // Pegando a URL privada e personalizada do Bucket
        const { data: urlData } = await supabase.storage
          .from("comprovantes-reembolso")
          .createSignedUrl(fileName, 60 * 60 * 24 * 365);

        if (!urlData.signedUrl) {
          console.error("Erro ao obter URL do comprovante");
          return res
            .status(500)
            .json({ message: "Erro ao obter URL do comprovante." });
        }

        comprovanteUrl = urlData.signedUrl;
        console.log("URL gerada:", comprovanteUrl);
      } else {
        console.log("Nenhum comprovante enviado");
      }

      // Criando a Solicitação
      await createSolicitacaoToDB(pgPool, {
        email,
        nome,
        categoria,
        valor,
        comprovante_url: comprovanteUrl,
        comprovante_nome: comprovante_nome,
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
      const totalRegistros = countRows[0].total;
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

      selectQuery += ` ORDER BY id DESC LIMIT $${
        selectParams.length + 1
      } OFFSET $${selectParams.length + 2}`;
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

    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID da solicitação é inválido!" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Apenas administradores podem excluir solicitações!",
      });
    }

    try {
      // Buscando a solicitação pelo id
      const reembolso = await getSolicitacaoFromDB(pgPool, {
        id: id,
      });

      if (!reembolso) {
        return res.status(204).json({ message: "Solicitação não encontrada!" });
      }

      // Verificando se o nome do pdf existe, se existir apaga o doc do Storage
      if (reembolso.comprovante_nome) {
        const fileName = `comprovantes-reembolso/${reembolso.comprovante_nome}`;
        console.log(
          "Realizando exclusão do documento via Supabase Storage",
          fileName
        );
        const { data, error } = await supabase.storage
          .from("comprovantes-reembolso")
          .remove([fileName]);

        if (error) {
          return res.status(500).json({
            message: "Erro ao excluir Documento do Supabase Storage",
            error: error.message,
          });
        } else {
          console.log(
            "Documento excluído com sucesso do Supabase Storage",
            fileName
          );
        }
      }

      // Deletando a Solicitação de um ID específico
      await deleteSolicitacaoFromDB(pgPool, {
        id: id,
      });

      return res
        .status(200)
        .json({ message: "Solicitação excluída com sucesso!" });
    } catch (error) {
      if (error.message === "Nenhuma solicitação encontrada com esse ID.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao excluir solicitação." });
    }
  },

  async aproveSolicitacao(req, res) {
    const id = parseInt(req.params.id, 10);

    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID da solicitação é inválido!" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Apenas administradores podem aprovar solicitações!",
      });
    }

    try {
      const reembolso = await getSolicitacaoFromDB(pgPool, {
        id: id,
      });

      if (!reembolso) {
        return res
          .status(404)
          .json({ message: "Nenhuma solicitação encontrada com esse ID." });
      }

      if (reembolso.status === "aprovado") {
        return res
          .status(400)
          .json({ message: "Solicitação já foi aprovada." });
      }

      await aproveSolicitacaoToDB(pgPool, {
        id: id,
      });

      return res
        .status(200)
        .json({ message: "Solicitação aprovada com sucesso!" });
    } catch (error) {
      console.error("Erro ao aprovar solicitação", error.message);
      return res.status(500).json({ message: "Erro ao aprovar solicitação." });
    }
  },

  async rejectSolicitacao(req, res) {
    const id = parseInt(req.params.id, 10);

    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID da solicitação é inválido!" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Apenas administradores podem rejeitar solicitações!",
      });
    }

    try {
      const reembolso = await getSolicitacaoFromDB(pgPool, {
        id: id,
      });

      if (!reembolso) {
        return res
          .status(404)
          .json({ message: "Nenhuma solicitação encontrada com esse ID." });
      }

      if (reembolso.status === "rejeitado") {
        return res
          .status(400)
          .json({ message: "Solicitação já foi rejeitada." });
      }

      await rejectSolicitacaoToDB(pgPool, {
        id: id,
      });

      return res
        .status(200)
        .json({ message: "Solicitação rejeitada com sucesso!" });
    } catch (error) {
      console.error("Erro ao rejeitar solicitação", error.message);
      return res.status(500).json({ message: "Erro ao rejeitar solicitação." });
    }
  },

  async getSolicitacaoEmail(req, res) {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = 6;
    const offset = (pagina - 1) * limite;
    const email = req.user.email;
    const nomeFiltro = req.query.nome ? `%${req.query.nome}%` : null;

    if (pagina < 1) {
      return res
        .status(400)
        .json({ message: "A página deve ser um número maior ou igual a 1." });
    }

    if (!email) {
      return res
        .status(400)
        .json({ message: "E-mail do usuário não fornecido." });
    }

    try {
      // Monta a query de contagem
      let countQuery =
        "SELECT COUNT(*) as total FROM solicitacao WHERE email = $1";
      let countParams = [email];
      if (nomeFiltro !== null) {
        countQuery += " AND nome ILIKE $2";
        countParams.push(nomeFiltro);
      }

      const { rows: countRows } = await pgPool.query(countQuery, countParams);
      const totalRegistros = parseInt(countRows[0].total, 10);
      const totalPaginas = Math.ceil(totalRegistros / limite);

      // Monta a query de seleção
      let selectQuery = "SELECT * FROM solicitacao WHERE email = $1";
      let selectParams = [email];
      if (nomeFiltro !== null) {
        selectQuery += " AND nome ILIKE $2";
        selectParams.push(nomeFiltro);
        selectQuery += " ORDER BY id DESC LIMIT $3 OFFSET $4";
        selectParams.push(limite, offset);
      } else {
        selectQuery += " ORDER BY id DESC LIMIT $2 OFFSET $3";
        selectParams.push(limite, offset);
      }

      const { rows } = await pgPool.query(selectQuery, selectParams);

      res.status(200).json({
        paginaAtual: pagina,
        totalPaginas,
        totalRegistros,
        registrosInfo: rows,
      });
    } catch (error) {
      console.error(
        "Erro ao listar solicitações do usuário:",
        error.message,
        error.stack
      );
      res
        .status(500)
        .json({ message: "Erro ao listar solicitações do usuário." });
    }
  },
};

module.exports = solicitacaoController;
