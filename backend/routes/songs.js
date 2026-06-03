const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadSong, getAllSongs, getMySongs, deleteSong } = require("../controllers/songcontroller");
const { verificarToken } = require("../middleware/auth");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.get("/", getAllSongs);
router.get("/minhas", verificarToken, getMySongs);
router.post("/upload", verificarToken, upload.single("musica"), uploadSong);
router.delete("/:id", verificarToken, deleteSong);

module.exports = router;
