const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Middleware de arquivos estáticos
app.use(
  express.static(path.join(__dirname, '../public'), {
    etag: false,
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
    },
  })
);

// Conectar no bd 
const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Carregar rotas
const solicitacaoRoutes = require('./routes/solicitacoes');
const usuarioRoutes = require('./routes/usuarios');

app.use('/solicitacoes', solicitacaoRoutes);
app.use('/usuarios', usuarioRoutes);
app.set('mysqlPool', mysqlPool);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});