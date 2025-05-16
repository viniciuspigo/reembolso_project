const jwt = require('jsonwebtoken');
require("dotenv").config()

const authenticateToken = async(req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // -> "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Acesso negado, token não fornecido!"})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next()
    } catch (error) {
        console.error("Erro ao verificar Token", error.message)
        return res.status(403).json({ message: "Token inválido ou expirado."})
    }
}

module.exports = { authenticateToken }