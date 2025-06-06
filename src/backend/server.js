const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Middleware de arquivos estáticos
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

// Carregar rotas
const solicitacaoRoutes = require("./routes/solicitacoes");
const usuarioRoutes = require("./routes/usuarios");
const passwordRoutes = require("./routes/password");

app.use("/solicitacoes", solicitacaoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/password", passwordRoutes);

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "reset-password.html"));
});

/* app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); */

module.exports = app;