const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlistcontroller");
const { verificarToken, verificarAdmin } = require("../middleware/auth");

// Listar todas as playlists (público)
router.get("/", playlistController.listarPlaylists);

// Buscar músicas de uma playlist (público)
router.get("/:id/musicas", playlistController.buscarMusicasPlaylist);

// Criar playlist (somente admin)
router.post("/", verificarToken, verificarAdmin, playlistController.criarPlaylist);

// Adicionar música a uma playlist (somente admin)
router.post("/:id/musicas", verificarToken, verificarAdmin, playlistController.adicionarMusicaPlaylist);

// Remover música de uma playlist (somente admin)
router.delete("/:playlistId/musicas/:musicaId", verificarToken, verificarAdmin, playlistController.removerMusicaPlaylist);

// Deletar playlist (somente admin)
router.delete("/:id", verificarToken, verificarAdmin, playlistController.deletarPlaylist);

module.exports = router;
