// app.js — Player da página inicial
// Depende de config.js (já carregado)

const player = document.getElementById("audioPlayer");
const title  = document.getElementById("songTitle");

function playSong(nome, arquivo) {
    if (!player || !title) return;
    title.textContent = nome;
    player.src = arquivo;
    player.play().catch(err => console.warn("Autoplay bloqueado:", err));
}

// Carrega lista de músicas públicas da API
async function carregarMusicasPublicas() {
    try {
        const res = await fetch(`${window.API_URL}/songs`);
        if (!res.ok) return;
        const musicas = await res.json();

        // Se tiver músicas, exibe as 3 primeiras como cards
        if (Array.isArray(musicas) && musicas.length > 0) {
            console.log(`[CloudRain] ${musicas.length} músicas disponíveis`);
        }
    } catch (err) {
        // API offline — não quebra a página
        console.warn("[CloudRain] API offline, modo estático ativo.");
    }
}

carregarMusicasPublicas();
console.log("[CloudRain] Frontend iniciado.");
