const supabase = require("../config/database");

async function listarPlaylists(req, res) {
    try {
        const { data, error } = await supabase
            .from("playlists")
            .select("id, nome, descricao, oficial, created_at")
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao buscar playlists" });
    }
}

async function buscarMusicasPlaylist(req, res) {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("playlist_musicas")
            .select(`
                musica_id,
                musicas(
                    id,
                    titulo,
                    url,
                    artista_id,
                    usuarios!artista_id(nome)
                )
            `)
            .eq("playlist_id", id);

        if (error) throw error;
        res.json(data?.map(r => r.musicas) || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao buscar músicas da playlist" });
    }
}

async function criarPlaylist(req, res) {
    try {
        const { nome, descricao } = req.body;

        if (!nome || nome.trim().length === 0) {
            return res.status(400).json({ erro: "Nome da playlist é obrigatório" });
        }

        const { data, error } = await supabase
            .from("playlists")
            .insert([{
                nome: nome.trim(),
                descricao: descricao?.trim() || "",
                oficial: true,
                created_by: req.user.id,
                created_at: new Date()
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ mensagem: "Playlist criada com sucesso", playlist: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao criar playlist" });
    }
}

async function adicionarMusicaPlaylist(req, res) {
    try {
        const { id } = req.params;
        const { musica_id } = req.body;

        if (!musica_id) {
            return res.status(400).json({ erro: "ID da música é obrigatório" });
        }

        const { data, error } = await supabase
            .from("playlist_musicas")
            .insert([{
                playlist_id: id,
                musica_id,
                added_at: new Date()
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ mensagem: "Música adicionada à playlist", data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao adicionar música" });
    }
}

async function removerMusicaPlaylist(req, res) {
    try {
        const { playlistId, musicaId } = req.params;

        const { error } = await supabase
            .from("playlist_musicas")
            .delete()
            .eq("playlist_id", playlistId)
            .eq("musica_id", musicaId);

        if (error) throw error;
        res.json({ mensagem: "Música removida da playlist" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao remover música" });
    }
}

async function deletarPlaylist(req, res) {
    try {
        const { id } = req.params;

        // Primeiro remove as músicas da playlist
        await supabase
            .from("playlist_musicas")
            .delete()
            .eq("playlist_id", id);

        // Depois deleta a playlist
        const { error } = await supabase
            .from("playlists")
            .delete()
            .eq("id", id);

        if (error) throw error;
        res.json({ mensagem: "Playlist removida com sucesso" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao deletar playlist" });
    }
}

module.exports = {
    listarPlaylists,
    buscarMusicasPlaylist,
    criarPlaylist,
    adicionarMusicaPlaylist,
    removerMusicaPlaylist,
    deletarPlaylist
};