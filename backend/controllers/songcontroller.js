const supabase = require("../config/database");
const Song = require("../models/song");

async function uploadSong(req, res) {
    try {
        const { titulo } = req.body;
        const arquivo = req.file;

        if (!titulo || !arquivo) {
            return res.status(400).json({ erro: "Título e arquivo são obrigatórios" });
        }

        // Validar tipo de arquivo
        const tiposPermitidos = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/flac"];
        if (!tiposPermitidos.includes(arquivo.mimetype)) {
            return res.status(400).json({ erro: "Tipo de arquivo não permitido. Use MP3, WAV, OGG ou FLAC." });
        }

        // Limite de 50MB
        if (arquivo.size > 50 * 1024 * 1024) {
            return res.status(400).json({ erro: "Arquivo muito grande. Limite: 50MB." });
        }

        const extensao = arquivo.originalname.split(".").pop().toLowerCase();
        const nomeArquivo = `${req.user.id}_${Date.now()}.${extensao}`;

        const { error: uploadError } = await supabase.storage
            .from("musicas")
            .upload(nomeArquivo, arquivo.buffer, { contentType: arquivo.mimetype });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from("musicas")
            .getPublicUrl(nomeArquivo);

        const musica = await Song.create({
            titulo,
            artistaId: req.user.id,
            url: urlData.publicUrl
        });

        res.status(201).json({ mensagem: "Upload realizado com sucesso", musica });

    } catch (err) {
        res.status(500).json({ erro: "Erro interno ao fazer upload" });
    }
}

async function getAllSongs(req, res) {
    try {
        const musicas = await Song.findAll();
        res.json(musicas);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar músicas" });
    }
}

async function getMySongs(req, res) {
    try {
        const musicas = await Song.findByArtist(req.user.id);
        res.json(musicas);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar músicas" });
    }
}

async function deleteSong(req, res) {
    try {
        const { id } = req.params;
        const musica = await Song.findById(id);

        if (!musica) {
            return res.status(404).json({ erro: "Música não encontrada" });
        }

        // Apenas o dono ou admin pode deletar
        if (musica.artista_id !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ erro: "Sem permissão para deletar esta música" });
        }

        // Remove do storage
        const nomeArquivo = musica.url.split("/").pop();
        await supabase.storage.from("musicas").remove([nomeArquivo]);

        await Song.delete(id);

        res.json({ mensagem: "Música removida com sucesso" });

    } catch (err) {
        res.status(500).json({ erro: "Erro ao deletar música" });
    }
}

module.exports = { uploadSong, getAllSongs, getMySongs, deleteSong };
