/**
 * auth.js — Módulo de autenticação centralizado
 * Depende de config.js (carregado antes)
 */

const AUTH_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000,
    tokenRefreshTime: 6 * 24 * 60 * 60 * 1000 // 6 dias
};

let tokenRefreshInterval = null;

// ────────────────────────────────────────────
// Requisição com retry automático
// ────────────────────────────────────────────
async function fetchWithRetry(url, options = {}, retryCount = 0) {
    try {
        const token = localStorage.getItem("token");
        if (token && !options.headers?.Authorization) {
            options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
        }

        const response = await fetch(url, options);

        if (response.status === 401) {
            const errorData = await response.clone().json().catch(() => ({}));
            if (errorData.erro?.includes("Token expirado")) {
                const renovado = await refreshToken();
                if (renovado) return fetchWithRetry(url, options, retryCount);
            }
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "login.html";
            return response;
        }

        return response;
    } catch (error) {
        if (retryCount < AUTH_CONFIG.maxRetries) {
            console.warn(`Tentativa ${retryCount + 1}/${AUTH_CONFIG.maxRetries}...`);
            await new Promise(r => setTimeout(r, AUTH_CONFIG.retryDelay));
            return fetchWithRetry(url, options, retryCount + 1);
        }
        throw error;
    }
}

// ────────────────────────────────────────────
// Login
// ────────────────────────────────────────────
async function login(email, senha) {
    try {
        const response = await fetch(`${window.API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const dados = await response.json();

        if (response.ok) {
            localStorage.setItem("token", dados.token);
            localStorage.setItem("usuario", JSON.stringify(dados.usuario));
            setupTokenRefresh();
            return { success: true, usuario: dados.usuario };
        }
        return { success: false, erro: dados.erro || "Erro ao fazer login" };
    } catch (error) {
        return { success: false, erro: "Servidor indisponível. Verifique se o backend está rodando." };
    }
}

// ────────────────────────────────────────────
// Registro
// ────────────────────────────────────────────
async function register(nome, email, senha) {
    try {
        const response = await fetch(`${window.API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await response.json();

        if (response.ok) return { success: true, mensagem: dados.mensagem };
        return { success: false, erro: dados.erro || "Erro ao registrar" };
    } catch (error) {
        return { success: false, erro: "Servidor indisponível. Verifique se o backend está rodando." };
    }
}

// ────────────────────────────────────────────
// Refresh token
// ────────────────────────────────────────────
async function refreshToken() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return false;

        const response = await fetch(`${window.API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const dados = await response.json();
            localStorage.setItem("token", dados.token);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

// ────────────────────────────────────────────
// Refresh automático
// ────────────────────────────────────────────
function setupTokenRefresh() {
    if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = setInterval(() => {
        refreshToken().catch(console.error);
    }, AUTH_CONFIG.tokenRefreshTime);
}

// ────────────────────────────────────────────
// Logout
// ────────────────────────────────────────────
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);
    window.location.href = "login.html";
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
function isAuthenticated() {
    return !!localStorage.getItem("token");
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("usuario"));
    } catch {
        return null;
    }
}

// Expõe globalmente
window.auth = { login, register, logout, isAuthenticated, getCurrentUser, fetchWithRetry };
