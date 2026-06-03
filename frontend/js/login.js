// login.js — depende de config.js carregado antes
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErro();

    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Entrando...";

    try {
        const resposta = await fetch(`${window.API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("email").value.trim(),
                senha: document.getElementById("senha").value
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            localStorage.setItem("token", dados.token);
            localStorage.setItem("usuario", JSON.stringify(dados.usuario));
            window.location.href = "dashboard.html";
        } else {
            mostrarErro(dados.erro || "Login inválido");
        }
    } catch {
        mostrarErro("Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Entrar";
    }
});

function mostrarErro(msg) {
    let alerta = document.getElementById("alertaErro");
    if (!alerta) {
        alerta = document.createElement("div");
        alerta.id = "alertaErro";
        alerta.className = "alert-erro";
        document.getElementById("loginForm").after(alerta);
    }
    alerta.textContent = msg;
    alerta.style.display = "block";
}

function limparErro() {
    const alerta = document.getElementById("alertaErro");
    if (alerta) alerta.style.display = "none";
}
