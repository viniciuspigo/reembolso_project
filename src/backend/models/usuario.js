module.exports = {
  async createUser(mysqlPool, { nome_completo, email, senha, role }) {
    const query = `
      INSERT INTO usuario (nome_completo, email, senha, role, data_criacao)
      VALUES (?, ?, ?, ?, NOW())
    `;
    await mysqlPool.execute(query, [nome_completo, email, senha, role]);
  },

  async findUserByEmail(mysqlPool, email) {
    const [rows] = await mysqlPool.execute(
      "SELECT * FROM usuario WHERE email = ?",
      [email]
    );
    return rows[0];
  },
};
