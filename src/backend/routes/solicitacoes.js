const express = require('express');
const router = express.Router();
const solicitacaoController = require('../controllers/solicitacaoController');

router.post('/', solicitacaoController.createSolicitacao);
router.get('/', solicitacaoController.getAllSolicitacoes);

module.exports = router;