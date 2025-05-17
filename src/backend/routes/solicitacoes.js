const express = require('express');
const router = express.Router();
const solicitacaoController = require('../controllers/solicitacaoController');
const { authenticateToken } = require('../middleware/auth')

router.post('/', authenticateToken, solicitacaoController.createSolicitacao);
router.get('/', authenticateToken, solicitacaoController.getAllSolicitacoes);
router.delete('/:id', authenticateToken, solicitacaoController.deleteSolicitacao)

module.exports = router;