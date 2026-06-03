const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ erro: "Token não enviado" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ erro: "Token expirado" });
        }
        return res.status(401).json({ erro: "Token inválido" });
    }
}

function verificarAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ erro: "Acesso negado: requer permissão de admin" });
    }
    next();
}

module.exports = { verificarToken, verificarAdmin };
