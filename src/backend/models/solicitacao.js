module.exports = {
  async createSolicitacaoToDB(mysqlPool, { email, nome, categoria, valor, comprovante }) {
    const query = `
      INSERT INTO solicitacao (email, nome, categoria, valor, comprovante, data_criacao)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await mysqlPool.execute(query, [email, nome, categoria, valor, comprovante]);
  },

  async deleteSolicitacaoFromDB(mysqlPool, { id }) {
    const checkQuery = `SELECT id FROM solicitacao WHERE (id = ?)`
    const [rows] = await mysqlPool.execute(checkQuery, [id]) 

    if (rows.length === 0) {
      throw new Error("Nenhuma solicitação encontrada com esse ID.")
      }

    const deleteQuery = `DELETE FROM solicitacao WHERE (id = ?)`;
    const result = await mysqlPool.execute(deleteQuery, [id]);

    if (result.affectedRows === 0 ) {
      throw new Error ("Nenhuma Solicitação encontrada.")
    }
  }
};