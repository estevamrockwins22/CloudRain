# ☁️ CloudRain — Plataforma de Streaming Independente

Plataforma web para artistas independentes enviarem e compartilharem músicas.

---

## 🚀 Execução do Projeto

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) com tabelas criadas (ver abaixo)

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo de exemplo e edite com suas credenciais:
```bash
cp .env.example .env
```

Edite o `.env`:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_super_secreta_minimo_32_caracteres
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_KEY=sua_chave_publica_supabase
FRONTEND_URL=http://localhost:5500
```

### 3. Rodar o projeto

**Apenas backend:**
```bash
npm start          # produção
npm run dev        # desenvolvimento (com nodemon)
```

**Frontend + Backend juntos:**
```bash
npm run dev:full   # inicia ambos automaticamente
```

O backend estará em `http://localhost:3000`  
O frontend estará em `http://localhost:5500`

### 4. Criar administrador
```bash
npm run seed:admin
```

---



