const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
function gerarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, role: usuario.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// ────────────────────────────────────────────
// Registro
// ────────────────────────────────────────────
async function register(req, res) {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });
        }

        // Valida formato de e-mail básico
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ erro: "Formato de e-mail inválido" });
        }

        if (senha.length < 6) {
            return res.status(400).json({ erro: "Senha deve ter no mínimo 6 caracteres" });
        }

        if (nome.trim().length < 2) {
            return res.status(400).json({ erro: "Nome deve ter no mínimo 2 caracteres" });
        }

        const existente = await User.findByEmail(email.toLowerCase().trim());
        if (existente) {
            return res.status(409).json({ erro: "E-mail já cadastrado" });
        }

        const senhaHash = await bcrypt.hash(senha, 12);
        const usuario = await User.create({
            nome: nome.trim(),
            email: email.toLowerCase().trim(),
            senhaHash
        });

        // Remove senha do retorno
        const { senha: _, ...usuarioSeguro } = usuario;

        res.status(201).json({ mensagem: "Conta criada com sucesso", usuario: usuarioSeguro });

    } catch (err) {
        console.error("[register]", err.message);
        res.status(500).json({ erro: "Erro interno ao cadastrar usuário" });
    }
}

// ────────────────────────────────────────────
// Login
// ────────────────────────────────────────────
async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: "Email e senha são obrigatórios" });
        }

        const usuario = await User.findByEmail(email.toLowerCase().trim());

        // Timing-safe: mesmo tempo para email inexistente e senha errada
        const senhaValida = usuario
            ? await bcrypt.compare(senha, usuario.senha)
            : await bcrypt.hash(senha, 12).then(() => false);

        if (!usuario || !senhaValida) {
            return res.status(401).json({ erro: "E-mail ou senha inválidos" });
        }

        const token = gerarToken(usuario);

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role
            }
        });

    } catch (err) {
        console.error("[login]", err.message);
        res.status(500).json({ erro: "Erro interno ao fazer login" });
    }
}

// ────────────────────────────────────────────
// Dados do usuário autenticado
// ────────────────────────────────────────────
async function getMe(req, res) {
    try {
        const usuario = await User.findById(req.user.id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
        res.json(usuario);
    } catch (err) {
        console.error("[getMe]", err.message);
        res.status(500).json({ erro: "Erro interno" });
    }
}

// ────────────────────────────────────────────
// Renovar token (refresh)
// ────────────────────────────────────────────
async function refreshToken(req, res) {
    try {
        // O token já foi verificado pelo middleware verificarToken
        const usuario = await User.findById(req.user.id);
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const novoToken = gerarToken(usuario);
        res.json({ token: novoToken });

    } catch (err) {
        console.error("[refreshToken]", err.message);
        res.status(500).json({ erro: "Erro ao renovar token" });
    }
}

// ────────────────────────────────────────────
// Atualizar perfil
// ────────────────────────────────────────────
async function updateProfile(req, res) {
    try {
        const { nome, bio } = req.body;

        if (!nome || nome.trim().length < 2) {
            return res.status(400).json({ erro: "Nome deve ter no mínimo 2 caracteres" });
        }

        const usuario = await User.updateProfile(req.user.id, {
            nome: nome.trim(),
            bio: bio?.trim() || ""
        });

        res.json({ mensagem: "Perfil atualizado com sucesso", usuario });

    } catch (err) {
        console.error("[updateProfile]", err.message);
        res.status(500).json({ erro: "Erro ao atualizar perfil" });
    }
}

module.exports = { register, login, getMe, refreshToken, updateProfile };
