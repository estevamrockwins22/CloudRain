// dashboard.js — depende de config.js carregado antes

const token   = localStorage.getItem("token");
const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

// ── Proteção de rota ────────────────────────
if (!token || !usuario) {
    window.location.href = "login.html";
}

// ── Saudação ────────────────────────────────
document.getElementById("nomeUsuario").textContent = `Olá, ${escapeHtml(usuario.nome)}`;

// ── Painel admin ────────────────────────────
if (usuario.role === "admin") {
    document.getElementById("painelAdmin").style.display = "block";
}

// ── Carregar músicas ao iniciar ─────────────
carregarMinhasMusicas();

// ── Upload ──────────────────────────────────
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo  = document.getElementById("titulo").value.trim();
    const arquivo = document.getElementById("musica").files[0];

    if (!titulo || !arquivo) {
        mostrarMensagem("Preencha o título e selecione um arquivo", "danger");
        return;
    }

    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("musica", arquivo);

    try {
        const resposta = await fetch(`${window.API_URL}/songs/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            mostrarMensagem("Música enviada com sucesso! 🎵", "success");
            e.target.reset();
            carregarMinhasMusicas();
        } else {
            mostrarMensagem(dados.erro || "Erro ao enviar", "danger");
        }
    } catch {
        mostrarMensagem("Erro de conexão com o servidor", "danger");
    } finally {
        btn.disabled = false;
        btn.textContent = "Enviar";
    }
});

// ── Carregar músicas ────────────────────────
async function carregarMinhasMusicas() {
    const lista = document.getElementById("listaMusicas");
    lista.innerHTML = "<li class='list-item-loading'>Carregando...</li>";

    try {
        const resposta = await fetch(`${window.API_URL}/songs/minhas`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const musicas = await resposta.json();

        if (!Array.isArray(musicas) || musicas.length === 0) {
            lista.innerHTML = "<li class='list-item-empty'>Nenhuma música enviada ainda.</li>";
            return;
        }

        lista.innerHTML = musicas.map(m => `
            <li class="music-item">
                <div class="music-info">
                    <span class="music-title">${escapeHtml(m.titulo)}</span>
                    <button class="btn-play" onclick="tocarMusica('${escapeHtml(m.titulo)}', '${encodeURIComponent(m.url)}')">
                        ▶ Ouvir
                    </button>
                </div>
                <button class="btn-delete" onclick="deletarMusica('${m.id}')">Remover</button>
            </li>
        `).join("");

    } catch {
        lista.innerHTML = "<li class='list-item-error'>Erro ao carregar músicas.</li>";
    }
}

// ── Deletar música ──────────────────────────
async function deletarMusica(id) {
    if (!confirm("Remover esta música permanentemente?")) return;

    try {
        const resposta = await fetch(`${window.API_URL}/songs/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (resposta.ok) {
            carregarMinhasMusicas();
            mostrarMensagem("Música removida.", "success");
        } else {
            const d = await resposta.json();
            mostrarMensagem(d.erro || "Erro ao remover música", "danger");
        }
    } catch {
        mostrarMensagem("Erro de conexão", "danger");
    }
}

// ── Player ───────────────────────────────────
function tocarMusica(titulo, urlEncoded) {
    const url = decodeURIComponent(urlEncoded);
    const player   = document.getElementById("playerGlobal");
    const tituloEl = document.getElementById("tituloPlayer");
    if (player && tituloEl) {
        tituloEl.textContent = titulo;
        player.src = url;
        player.play();
        document.getElementById("barraPlayer").style.display = "flex";
    }
}

// ── Logout ───────────────────────────────────
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

// ── Helpers ──────────────────────────────────
function mostrarMensagem(msg, tipo) {
    let el = document.getElementById("mensagem");
    if (!el) {
        el = document.createElement("div");
        el.id = "mensagem";
        document.getElementById("uploadForm").before(el);
    }
    el.className = `alert alert-${tipo} mb-3`;
    el.textContent = msg;
    setTimeout(() => { el.textContent = ""; el.className = ""; }, 4000);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
