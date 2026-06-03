// register.js — depende de config.js carregado antes
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErro();

    const senha = document.getElementById("senha").value;
    const confirmar = document.getElementById("confirmarSenha").value;

    if (senha !== confirmar) { mostrarErro("As senhas não coincidem"); return; }
    if (senha.length < 6)    { mostrarErro("Senha deve ter no mínimo 6 caracteres"); return; }

    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Cadastrando...";

    try {
        const resposta = await fetch(`${window.API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome:  document.getElementById("nome").value.trim(),
                email: document.getElementById("email").value.trim(),
                senha
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            mostrarSucesso("Conta criada com sucesso! Redirecionando para login...");
            setTimeout(() => window.location.href = "login.html", 2000);
        } else {
            mostrarErro(dados.erro || "Erro ao cadastrar");
        }
    } catch {
        mostrarErro("Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Cadastrar";
    }
});

function mostrarErro(msg) {
    mostrarAlerta(msg, "erro");
}

function mostrarSucesso(msg) {
    mostrarAlerta(msg, "sucesso");
}

function mostrarAlerta(msg, tipo) {
    let alerta = document.getElementById("alertaMsg");
    if (!alerta) {
        alerta = document.createElement("div");
        alerta.id = "alertaMsg";
        document.getElementById("registerForm").after(alerta);
    }
    alerta.className = `alert-${tipo}`;
    alerta.textContent = msg;
    alerta.style.display = "block";
}

function limparErro() {
    const alerta = document.getElementById("alertaMsg");
    if (alerta) alerta.style.display = "none";
}
