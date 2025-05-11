const express = require("express")
const router = express.Router()
const usuarioController = require('../controllers/usuarioController');

router.post('/register', usuarioController.registerUser);
router.get('/create-admin', usuarioController.createAdmin);
router.post('/login', usuarioController.loginUser);

module.exports = router;