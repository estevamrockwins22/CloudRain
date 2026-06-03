const supabase = require("../config/database");

class Song {
    static async create({ titulo, artistaId, url }) {
        try {
            const { data, error } = await supabase
                .from("musicas")
                .insert([{
                    titulo,
                    artista_id: artistaId,
                    url,
                    created_at: new Date()
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            throw new Error(`Erro ao criar música: ${err.message}`);
        }
    }

    static async findAll() {
        try {
            const { data, error } = await supabase
                .from("musicas")
                .select(`
                    id,
                    titulo,
                    url,
                    artista_id,
                    usuarios!artista_id(nome),
                    created_at
                `)
                .order("created_at", { ascending: false })
                .limit(100);

            if (error) throw error;
            return data || [];
        } catch (err) {
            throw new Error(`Erro ao buscar músicas: ${err.message}`);
        }
    }

    static async findByArtist(artistaId) {
        try {
            const { data, error } = await supabase
                .from("musicas")
                .select("*")
                .eq("artista_id", artistaId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            throw new Error(`Erro ao buscar músicas do artista: ${err.message}`);
        }
    }

    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from("musicas")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            return null;
        }
    }

    static async delete(id) {
        try {
            const { error } = await supabase
                .from("musicas")
                .delete()
                .eq("id", id);

            if (error) throw error;
            return true;
        } catch (err) {
            throw new Error(`Erro ao deletar música: ${err.message}`);
        }
    }

    static async search(termo) {
        try {
            const { data, error } = await supabase
                .from("musicas")
                .select(`
                    id,
                    titulo,
                    url,
                    artista_id,
                    usuarios!artista_id(nome),
                    created_at
                `)
                .ilike("titulo", `%${termo}%`)
                .limit(50);

            if (error) throw error;
            return data || [];
        } catch (err) {
            throw new Error(`Erro ao pesquisar: ${err.message}`);
        }
    }
}

module.exports = Song;