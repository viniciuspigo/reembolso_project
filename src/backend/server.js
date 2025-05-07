const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(
  express.static(path.join(__dirname, "../public"), {
    etag: false,
    setHeaders: (res) => {
      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      res.set("Surrogate-Control", "no-store");
    },
  })
);

const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(query);
    stmt.run(params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
    stmt.finalize();
  });
};

// Conectando ao bd
const db = new sqlite3.Database("./reembolsos.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados", err.message);
  } else {
    console.log("Conectado ao banco de dados");
  }
});

// Criando a table de solicitações, se não existir força criação
db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS solicitacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuarioEmail TEXT NOT NULL,
        nome TEXT NOT NULL,
        categoria TEXT NOT NULL,
        valor REAL NOT NULL,
        comprovante TEXT,
        createdAt TEXT NOT NULL
        )`);
});

// Endpoint para criar uma solicitação
app.post("/solicitacoes", async (req, res) => {
  console.log("Recebendo requisição POST /solicitacoes:", req.body);
  console.log("Cabeçalhos da requisição:", req.headers);

  const { usuarioEmail, nome, categoria, valor, comprovante, createdAt } =
    req.body;

  if (!usuarioEmail || !nome || !categoria || !valor || !createdAt) {
    console.log("Campos obrigatórios ausentes:", {
      usuarioEmail,
      nome,
      categoria,
      valor,
      createdAt,
    });
    res
      .status(400)
      .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
    return;
  }

  try {
    console.log("Executando inserção no banco de dados...");
    await runQuery(
      `INSERT INTO solicitacoes (usuarioEmail, nome, categoria, valor, comprovante, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [usuarioEmail, nome, categoria, valor, comprovante || null, createdAt]
    );
    console.log("Inserção bem-sucedida, enviando resposta 201");
    res.status(201).json({ message: "Solicitação criada com sucesso!" });
    console.log("Resposta enviada:", {
      status: 201,
      body: { message: "Solicitação criada com sucesso!" },
    });
  } catch (error) {
    console.error("Erro ao salvar solicitação:", error.message);
    res
      .status(500)
      .json({ error: "Erro ao salvar solicitação: " + error.message });
    console.log("Resposta de erro enviada:", {
      status: 500,
      body: { error: "Erro ao salvar solicitação: " + error.message },
    });
  }
});

// Endpoint para listar as solicitações
app.get("/solicitacoes", (req, res) => {
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = 6;
  const offset = (pagina - 1) * limite;
  const nomeFiltro = req.query.nome ? `%${req.query.nome}%` : null;
  const idFiltro = req.query.id ? parseInt(req.query.id) : null;
  const emailFiltro = req.query.usuarioEmail || null;

  if (pagina < 1) {
    return res
      .status(400)
      .json({ error: "A página deve ser um número maior ou igual a 1." });
  }

  if (req.query.id && isNaN(parseInt(req.query.id))) {
    return res.status(400).json({ error: "O ID deve ser um número válido." });
  }

  // Monta a query de contagem com ou sem filtro
  let countQuery = `SELECT COUNT(*) as total FROM solicitacoes`;
  let countParams = [];
  let whereClauses = [];

  if (idFiltro) {
    whereClauses.push(`id = ?`);
    countParams.push(idFiltro);
  }

  if (emailFiltro) {
    whereClauses.push(`usuarioEmail = ?`);
    countParams.push(emailFiltro);
  }

  if (nomeFiltro) {
    whereClauses.push(`nome LIKE ?`);
    countParams.push(nomeFiltro);
  }

  if (whereClauses.length > 0) {
    countQuery += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  db.get(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error("Erro ao contar solicitações:", err);
      return res.status(500).json({ error: "Erro ao contar solicitações" });
    }

    // Monta a query de seleção com ou sem filtro
    let selectQuery = `SELECT * FROM solicitacoes`;
    let selectParams = [];
    let selectWhereClauses = [];

    if (idFiltro) {
      selectWhereClauses.push(`id = ?`);
      selectParams.push(idFiltro);
    }
    if (emailFiltro) {
      selectWhereClauses.push(`usuarioEmail = ?`);
      selectParams.push(emailFiltro);
    }
    if (nomeFiltro) {
      selectWhereClauses.push(`nome LIKE ?`);
      selectParams.push(nomeFiltro);
    }

    if (selectWhereClauses.length > 0) {
      selectQuery += ` WHERE ${selectWhereClauses.join(" AND ")}`;
    }

    selectQuery += ` LIMIT ? OFFSET ?`;
    selectParams.push(limite, offset);

    db.all(selectQuery, selectParams, (err, rows) => {
      if (err) {
        console.error("Erro ao buscar solicitações:", err);
        return res.status(500).json({ error: "Erro ao buscar solicitações" });
      }

      const totalPaginas = Math.ceil(countResult.total / limite);

      res.json({
        paginaAtual: pagina,
        totalPaginas,
        totalRegistros: countResult.total,
        registrosInfo: rows,
      });
    });
  });
});

// iniciando o server
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Fechar o banco de dados ao encerrar o servidor
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Erro ao fechar o banco de dados:", err.message);
    }
    console.log("Banco de dados fechado.");
    process.exit(0);
  });
});
