/**
 * config.js — Configuração centralizada da API
 * 
 * Detecta automaticamente a URL do backend:
 * - Se abrindo via Live Server (porta 5500) → backend em localhost:3000
 * - Se abrindo via arquivo direto (file://) → backend em localhost:3000
 * - Se em produção → usa URL relativa ou variável definida
 */
(function () {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    let API_URL;

    if (protocol === "file:") {
        // Abriu direto no navegador
        API_URL = "http://localhost:3000";
    } else if (hostname === "localhost" || hostname === "127.0.0.1") {
        // Live Server, serve, ou outro servidor local
        API_URL = "http://localhost:3000";
    } else {
        // Produção: supõe que backend está no mesmo domínio em /api
        API_URL = window.location.origin + "/api";
    }

    window.API_URL = API_URL;
    console.log(`[CloudRain] API conectada em: ${API_URL}`);
})();
