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

## 🔐 Conta Administrador

Após rodar `npm run seed:admin`:

| Campo  | Valor                     |
|--------|---------------------------|
| Email  | `admin@cloudrain.com`     |
| Senha  | `CloudRain@Admin2024`     |
| Role   | `admin`                   |

> ⚠️ **IMPORTANTE**: Troque a senha após o primeiro login!

### Como promover um usuário a admin manualmente
No painel do Supabase, execute:
```sql
UPDATE usuarios SET role = 'admin' WHERE email = 'email@do.usuario';
```

---

## 🗄️ Estrutura do Banco (Supabase)

Execute no SQL Editor do Supabase:

```sql
-- Tabela de usuários
CREATE TABLE usuarios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  senha      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user',
  bio        TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de músicas
CREATE TABLE musicas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo     TEXT NOT NULL,
  url        TEXT NOT NULL,
  artista_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de playlists
CREATE TABLE playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  descricao   TEXT,
  oficial     BOOLEAN DEFAULT false,
  created_by  UUID REFERENCES usuarios(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Tabela de relação playlist-músicas
CREATE TABLE playlist_musicas (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  musica_id   UUID REFERENCES musicas(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (playlist_id, musica_id)
);
```

No Supabase Storage, crie um bucket chamado `musicas` (público).

---

## 📁 Estrutura do Projeto

```
CloudRain/
├── .env                          ← variáveis de ambiente (não commitar!)
├── .env.example                  ← exemplo de configuração
├── package.json
├── backend/
│   ├── server.js                 ← servidor Express
│   ├── config/database.js        ← conexão Supabase
│   ├── middleware/auth.js        ← JWT + verificação de admin
│   ├── models/user.js            ← model de usuário
│   ├── models/song.js            ← model de música
│   ├── controllers/
│   │   ├── usercontroller.js
│   │   ├── songcontroller.js
│   │   └── playlistcontroller.js
│   ├── routes/
│   │   ├── users.js              ← /auth/*
│   │   ├── songs.js              ← /songs/*
│   │   ├── playlists.js          ← /playlists/*
│   │   └── search.js             ← /search
│   └── scripts/
│       └── seed-admin.js         ← cria conta admin
└── frontend/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── css/styles.css
    └── js/
        ├── config.js             ← URL da API (detecção automática)
        ├── auth.js               ← módulo de autenticação
        ├── app.js                ← player da página inicial
        ├── login.js
        ├── register.js
        └── dashboard.js
```

---

## 🔌 Rotas da API

### Autenticação (`/auth`)
| Método | Rota             | Proteção | Descrição                  |
|--------|------------------|----------|----------------------------|
| POST   | /auth/register   | —        | Registrar novo usuário     |
| POST   | /auth/login      | —        | Login (retorna JWT)        |
| GET    | /auth/me         | Token    | Dados do usuário logado    |
| POST   | /auth/refresh    | Token    | Renovar token JWT          |
| PUT    | /auth/perfil     | Token    | Atualizar perfil           |

### Músicas (`/songs`)
| Método | Rota             | Proteção | Descrição                  |
|--------|------------------|----------|----------------------------|
| GET    | /songs           | —        | Listar todas as músicas    |
| GET    | /songs/minhas    | Token    | Músicas do usuário logado  |
| POST   | /songs/upload    | Token    | Enviar nova música         |
| DELETE | /songs/:id       | Token    | Remover música             |

### Playlists (`/playlists`)
| Método | Rota                              | Proteção | Descrição              |
|--------|-----------------------------------|----------|------------------------|
| GET    | /playlists                        | —        | Listar playlists       |
| GET    | /playlists/:id/musicas            | —        | Músicas da playlist    |
| POST   | /playlists                        | Admin    | Criar playlist         |
| POST   | /playlists/:id/musicas            | Admin    | Adicionar música       |
| DELETE | /playlists/:id/musicas/:musicaId  | Admin    | Remover música         |
| DELETE | /playlists/:id                    | Admin    | Deletar playlist       |

### Busca (`/search`)
| Método | Rota      | Proteção | Descrição          |
|--------|-----------|----------|--------------------|
| GET    | /search?q | —        | Buscar músicas     |

---

## ⚠️ Possíveis Problemas

- **CORS**: O backend aceita `localhost:5500` e `127.0.0.1:5500`. Se usar outra porta, adicione em `FRONTEND_URL` no `.env`
- **JWT_SECRET**: Nunca use o valor padrão em produção — gere uma chave forte com `openssl rand -hex 32`
- **Supabase Key**: O `.env.example` contém uma chave publishable de exemplo. Substitua pela sua
- **Bucket Storage**: O bucket `musicas` no Supabase precisa ser público para que as URLs funcionem
