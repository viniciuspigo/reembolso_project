const express = require("express")
const router = express.Router()
const passwordController = require("../controllers/passwordController")

router.post("/password-recovery", passwordController.passwordRecovery)

module.exports = router;