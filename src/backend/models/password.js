const { v4: uuidv4 } = require("uuid");

module.exports = {
  async createResetToken(pgPool, usuario_id) {
    const token = uuidv4();
    const data_expiracao = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const data_criacao = new Date().toISOString();
    const query = `
      INSERT INTO password_reset_tokens (usuario_id, token, data_expiracao, data_criacao)
      VALUES ($1, $2, $3, $4)
    `;
    await pgPool.query(query, [
      usuario_id,
      token,
      data_expiracao,
      data_criacao,
    ]);
    return { token, data_expiracao };
  },

  async findResetToken(pgPool, token) {
    const result = await pgPool.query(
      `SELECT * FROM password_reset_tokens WHERE token = $1`,
      [token]
    );
    return result.rows[0];
  },

  async deleteResetToken(pgPool, token) {
    if (!token) {
      throw new Error("Token não fornecido para deletar");
    }
    const query = `DELETE FROM password_reset_tokens WHERE token = $1`;
    const result = await pgPool.query(query, [token]);
    return result.rowCount;
  },

  async updateUserPassword(pgPool, usuario_id, hashedPassword) {
    const query = `
      UPDATE usuario
      SET senha = $1
      WHERE id = $2
    `;
    await pgPool.query(query, [hashedPassword, usuario_id]);
  },
};
