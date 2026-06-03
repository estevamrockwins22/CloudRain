/**
 * Script para criar conta administrador padrão
 * Uso: node backend/scripts/seed-admin.js
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const ADMIN_EMAIL = "admin@cloudrain.com";
const ADMIN_SENHA = "CloudRain@Admin2024";
const ADMIN_NOME  = "Administrador";

async function seedAdmin() {
    console.log("🌱 Iniciando criação do administrador...\n");

    // Verifica se já existe
    const { data: existente } = await supabase
        .from("usuarios")
        .select("id, email, role")
        .eq("email", ADMIN_EMAIL)
        .single();

    if (existente) {
        if (existente.role === "admin") {
            console.log("✅ Admin já existe:");
            console.log(`   Email: ${ADMIN_EMAIL}`);
            console.log(`   Role:  ${existente.role}`);
            console.log(`   ID:    ${existente.id}`);
        } else {
            // Promove para admin
            const { error } = await supabase
                .from("usuarios")
                .update({ role: "admin" })
                .eq("id", existente.id);

            if (error) {
                console.error("❌ Erro ao promover para admin:", error.message);
            } else {
                console.log("✅ Usuário promovido para admin!");
                console.log(`   Email: ${ADMIN_EMAIL}`);
            }
        }
        process.exit(0);
    }

    // Cria novo admin
    const senhaHash = await bcrypt.hash(ADMIN_SENHA, 12);

    const { data, error } = await supabase
        .from("usuarios")
        .insert([{
            nome: ADMIN_NOME,
            email: ADMIN_EMAIL,
            senha: senhaHash,
            role: "admin",
            created_at: new Date()
        }])
        .select()
        .single();

    if (error) {
        console.error("❌ Erro ao criar admin:", error.message);
        console.error("   Verifique se a tabela 'usuarios' existe no Supabase.");
        process.exit(1);
    }

    console.log("✅ Administrador criado com sucesso!\n");
    console.log("┌─────────────────────────────────────┐");
    console.log("│  CREDENCIAIS DO ADMINISTRADOR        │");
    console.log("├─────────────────────────────────────┤");
    console.log(`│  Email:  ${ADMIN_EMAIL.padEnd(27)}│`);
    console.log(`│  Senha:  ${ADMIN_SENHA.padEnd(27)}│`);
    console.log(`│  Role:   admin                       │`);
    console.log(`│  ID:     ${String(data.id).substring(0,27).padEnd(27)}│`);
    console.log("└─────────────────────────────────────┘");
    console.log("\n⚠️  ATENÇÃO: Troque a senha após o primeiro login!");

    process.exit(0);
}

seedAdmin().catch(err => {
    console.error("❌ Erro inesperado:", err.message);
    process.exit(1);
});
