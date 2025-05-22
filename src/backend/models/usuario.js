module.exports = {
  async createUser(pgPool, { nome_completo, email, senha, role }) {
    const query = `
      INSERT INTO usuario (nome_completo, email, senha, role, data_criacao)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `;
    await pgPool.query(query, [nome_completo, email, senha, role]);
  },

  async findUserByEmail(pgPool, email) {
    const result = await pgPool.query(
      "SELECT * FROM usuario WHERE email = $1",
      [email]
    );
    return result.rows[0];
  },
};
