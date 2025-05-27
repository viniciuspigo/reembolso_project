const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { createUser, findUserByEmail } = require("../models/usuario");
const { pgPool } = require("../config/supabase");

const usuarioController = {
  async registerUser(req, res) {
    const { nome_completo, email, senha, role } = req.body;

    try {
      // Verificando se já existe um usuário com o e-mail passado
      const existingUser = await findUserByEmail(pgPool, email);

      if (existingUser) {
        console.log("Email já cadastrado:", email);
        return res.status(400).json({ message: "Email já cadastrado." });
      }

      // "Criptografia" da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Criando o usuário
      await createUser(pgPool, {
        nome_completo,
        email,
        senha: hashedPassword,
        role: role || "user",
      });
      console.log("Usuário inserido com sucesso.");

      res.status(201).json({ message: "Cadastro realizado com sucesso!" });
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error.message);
      res.status(500).json({ message: "Erro ao cadastrar usuário." });
    }
  },

  async createAdmin(req, res) {
    // Criando o Admin na "Força"
    const adminData = {
      nome_completo: "Admin User",
      email: "admin@exemplo.com",
      senha: "Admin123",
      role: "admin",
    };

    try {
      // Verificando se já existe um ADMIN com esse e-mail
      const existingAdmin = await findUserByEmail(pgPool, email);

      if (existingAdmin) {
        console.log("Admin já existe.");
        return res.status(400).json({ message: "Usuário admin já existe." }); 
      }

      // "Criptografia" da senha
      const hashedPassword = await bcrypt.hash(adminData.senha, 10);

      // Criando o Admin
      await createUser(pgPool, {
        ...adminData,
        senha: hashedPassword,
      });

      console.log("Admin criado com sucesso.");
      res.status(201).json({ message: "Usuário admin criado com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar admin." });
    }
  },

  async loginUser(req, res) {
    const { email, senha } = req.body;

    try {
      if (!email || !senha) {
        return res
          .status(400)
          .json({ message: "Email e senha são obrigatórios." });
      }

      const user = await findUserByEmail(pgPool, email);
      const passwordValidation = await bcrypt.compare(senha, user.senha);

      if (!user || !passwordValidation) {
        return res.status(401).json({ message: "Email ou senha incorretos." });
      }

      // Assinatura do token
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Retornar informações do usuário
      res.status(200).json({
        message: "Login bem-sucedido!",
        token: token,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer login." });
    }
  },
};

module.exports = usuarioController;
