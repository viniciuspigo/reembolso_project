const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json())
app.use(cors())

// Conectando ao bd
const db = new sqlite3.Database("./reembolsos.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados", err.message)
    } else {
        console.log("Conectado ao banco de dados")
    }
})

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
        )`)
})

// Endpoint para criar uma solicitação
app.post("/solicitacoes", (req, res) => {
    const { usuarioEmail, nome, categoria, valor, comprovante, createdAt } = req.body;
  
    if (!usuarioEmail || !nome || !categoria || !valor || !createdAt) {
      return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
    }
  
    const stmt = db.prepare(`
      INSERT INTO solicitacoes (usuarioEmail, nome, categoria, valor, comprovante, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      usuarioEmail,
      nome,
      categoria,
      valor,
      comprovante || null,
      createdAt,
      (err) => {
        stmt.finalize(); // Finaliza o statement após a execução
        if (err) {
          return res.status(500).json({ error: "Erro ao salvar solicitação: " + err.message });
        }
        res.status(201).json({ message: "Solicitação criada com sucesso!" });
      }
    );
});

app.get("/solicitacoes", (req, res) => {
    db.all(`SELECT * FROM solicitacoes`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao buscar solicitações: " + err.message })
        }
        res.json(rows)
    })
})

// iniciando o server
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})

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