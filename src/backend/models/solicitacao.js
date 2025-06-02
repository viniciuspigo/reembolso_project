module.exports = {
  async createSolicitacaoToDB(
    pgPool,
    { email, nome, categoria, valor, comprovante_url, comprovante_nome }
  ) {
    const data_criacao = new Date(Date.now());
    const query = `
      INSERT INTO solicitacao (email, nome, categoria, valor, comprovante_url, comprovante_nome, data_criacao)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await pgPool.query(query, [
      email,
      nome,
      categoria,
      valor,
      comprovante_url,
      comprovante_nome,
      data_criacao,
    ]);
  },

  async deleteSolicitacaoFromDB(pgPool, { id }) {
    const checkQuery = `SELECT id FROM solicitacao WHERE (id = $1)`;
    const result = await pgPool.query(checkQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error("Nenhuma solicitação encontrada com esse ID.");
    }

    const deleteQuery = `DELETE FROM solicitacao WHERE (id = $1)`;
    const deleteResult = await pgPool.query(deleteQuery, [id]);

    if (deleteResult.rowCount === 0) {
      throw new Error("Nenhuma Solicitação encontrada.");
    }
  },

  async getSolicitacaoFromDB(pgPool, { id }) {
    const query = `
    SELECT * FROM solicitacao WHERE (id = $1)
    `;
    const result = await pgPool.query(query, [id]);
    return result.rows[0];
  },

  async aproveSolicitacaoToDB(pgPool, { id }) {
    const checkQuery = `SELECT * FROM solicitacao WHERE (id = $1)`;
    const result = await pgPool.query(checkQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error("Nenhuma solicitação encontrada com esse ID.");
    }

    const updateQuery = `UPDATE solicitacao SET status = 'aprovado' WHERE (id = $1)`;
    await pgPool.query(updateQuery, [id]);
  },

  async rejectSolicitacaoToDB(pgPool, { id }) {
    const checkQuery = `SELECT * FROM solicitacao WHERE (id = $1)`
    const result = await pgPool.query(checkQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error("Nenhuma solicitação encontrada com esse ID.")
    }

    const updateQuery = `UPDATE solicitacao SET status = 'rejeitado' WHERE (id = $1)`;
    await pgPool.query(updateQuery, [id]);
  }
};
