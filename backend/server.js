require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const userRoutes = require("./routes/users");
const songRoutes = require("./routes/songs");
const playlistRoutes = require("./routes/playlists");
const searchRoutes = require("./routes/search");

const app = express();

// ────────────────────────────────────────────
// Segurança com Helmet (ajustado para dev)
// ────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ────────────────────────────────────────────
// CORS — aceita múltiplas origens de dev
// ────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "null" // file:// para abrir direto no navegador
];

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origin (ex: Postman, curl) em dev
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`CORS bloqueou origem: ${origin}`);
        callback(new Error("Origem não permitida por CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Responde preflight OPTIONS imediatamente
app.options("*", cors());

// ────────────────────────────────────────────
// Rate limiting
// ────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: "Muitas requisições. Tente novamente em 15 minutos." }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: "Muitas tentativas de autenticação. Aguarde 15 minutos." }
});

app.use(limiter);
app.use(express.json({ limit: "1mb" }));

// ────────────────────────────────────────────
// Rotas
// ────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        plataforma: "CloudRain",
        status: "online",
        versao: "1.0.0",
        rotas: ["/auth", "/songs", "/playlists", "/search"]
    });
});

app.use("/auth", authLimiter, userRoutes);
app.use("/songs", songRoutes);
app.use("/playlists", playlistRoutes);
app.use("/search", searchRoutes);

// ────────────────────────────────────────────
// Erros globais
// ────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("[ERRO]", err.stack);
    if (err.message?.includes("CORS")) {
        return res.status(403).json({ erro: "Acesso negado por política de CORS" });
    }
    res.status(500).json({ erro: "Erro interno no servidor" });
});

app.use((req, res) => {
    res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.path}` });
});

// ────────────────────────────────────────────
// Inicialização
// ────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("╔══════════════════════════════════════╗");
    console.log(`║  ☁️  CloudRain rodando na porta ${PORT}   ║`);
    console.log("╚══════════════════════════════════════╝");
    console.log(`→ API:      http://localhost:${PORT}`);
    console.log(`→ Frontend: ${process.env.FRONTEND_URL || "http://localhost:5500"}`);
    console.log(`→ Ambiente: ${process.env.NODE_ENV || "development"}`);
});
