module.exports = {
  async createSolicitacao(mysqlPool, { email, nome, categoria, valor, comprovante }) {
    const query = `
      INSERT INTO solicitacao (email, nome, categoria, valor, comprovante, data_criacao)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await mysqlPool.execute(query, [email, nome, categoria, valor, comprovante]);
  },

  async getAllSolicitacoes(mysqlPool) {
    const [rows] = await mysqlPool.execute('SELECT * FROM solicitacao');
    return rows;
  }
};