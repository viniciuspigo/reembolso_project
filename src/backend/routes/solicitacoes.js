const express = require('express');
const router = express.Router();
const multer = require('multer')
const solicitacaoController = require('../controllers/solicitacaoController');
const { authenticateToken } = require('../middleware/auth')
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('O arquivo deve ser um PDF'));
    }
  }
});

router.post('/', authenticateToken, upload.single("comprovante"), solicitacaoController.createSolicitacao);
router.get('/', authenticateToken, solicitacaoController.getAllSolicitacoes);
router.delete('/:id', authenticateToken, solicitacaoController.deleteSolicitacao)
router.put("/:id/aprovar", authenticateToken, solicitacaoController.aproveSolicitacao)
router.put("/:id/rejeitar", authenticateToken, solicitacaoController.rejectSolicitacao)

module.exports = router;