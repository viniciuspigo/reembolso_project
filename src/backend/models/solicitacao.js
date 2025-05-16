module.exports = {
  async createSolicitacaoToDB(mysqlPool, { email, nome, categoria, valor, comprovante }) {
    const query = `
      INSERT INTO solicitacao (email, nome, categoria, valor, comprovante, data_criacao)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await mysqlPool.execute(query, [email, nome, categoria, valor, comprovante]);
  },

  async deleteSolicitacaoFromDB(mysqlPool, { id }) {
    const query = `
    DELETE FROM solicitacao WHERE id = ?
    `;
    await mysqlPool.execute(query, [id]);
  }
};