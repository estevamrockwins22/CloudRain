const supabase = require("../config/database");

class User {
    static async create({ nome, email, senhaHash }) {
        try {
            const { data, error } = await supabase
                .from("usuarios")
                .insert([{
                    nome,
                    email,
                    senha: senhaHash,
                    role: "user",
                    created_at: new Date()
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            throw new Error(`Erro ao criar usuário: ${err.message}`);
        }
    }

    static async findByEmail(email) {
        try {
            const { data, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("email", email)
                .single();

            return data || null;
        } catch (err) {
            return null;
        }
    }

    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from("usuarios")
                .select("id, nome, email, role, created_at")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            throw new Error(`Erro ao buscar usuário: ${err.message}`);
        }
    }

    static async updateProfile(id, { nome, bio }) {
        try {
            const { data, error } = await supabase
                .from("usuarios")
                .update({ nome, bio })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            throw new Error(`Erro ao atualizar perfil: ${err.message}`);
        }
    }
}

module.exports = User;