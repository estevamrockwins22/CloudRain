const express = require("express");
const router = express.Router();
const { register, login, getMe, refreshToken, updateProfile } = require("../controllers/usercontroller");
const { verificarToken } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", verificarToken, getMe);
router.post("/refresh", verificarToken, refreshToken);       // ← novo: renovar token
router.put("/perfil", verificarToken, updateProfile);        // ← novo: atualizar perfil

module.exports = router;
