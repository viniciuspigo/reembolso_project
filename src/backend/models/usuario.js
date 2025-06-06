module.exports = {
  async createUser(pgPool, { nome_completo, email, senha, role }) {
    const data_criacao = new Date(Date.now())
    const query = `
      INSERT INTO usuario (nome_completo, email, senha, role, data_criacao)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pgPool.query(query, [nome_completo, email, senha, role, data_criacao]);
  },

  async findUserByEmail(pgPool, email) {
    const result = await pgPool.query(
      "SELECT * FROM usuario WHERE email = $1",
      [email]
    );
    return result.rows[0];
  },
};
