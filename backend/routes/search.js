const express = require("express");
const router = express.Router();
const Song = require("../models/song");

// Buscar músicas por termo
router.get("/", async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ erro: "Digite um termo para buscar" });
        }

        const musicas = await Song.search(q.trim());
        res.json(musicas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao buscar músicas" });
    }
});

module.exports = router;