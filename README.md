# 🦆 DuckerChat

DuckerChat é um aplicativo de chat em tempo real inspirado no Discord, desenvolvido com Firebase, JavaScript e hospedado no Netlify. Ele permite autenticação com Google, exibição de usuários online, e notificações de digitação em tempo real.

---

## 🚀 Funcionalidades

- 📩 Envio e recepção de mensagens em tempo real via Firebase Realtime Database
- 👥 Lista de usuários online e status de presença (online/ausente/offline)
- ✍️ Indicador ao vivo de usuários que estão digitando
- 🔐 Login com conta Google
- 🔄 Script para reset automático do Firebase
- ☁️ Deploy automatizado via Netlify

---

## 🧱 Estrutura do Projeto

```plaintext
📁 public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── chat.js
│
├── index.html
├── firebase.js
├── firebase.json
├── reset.js
├── server.js (opcional, não utilizado no Netlify)
├── netlify.toml
├── deploy.sh
```

---

## 🔧 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 (inspirado no Discord), JavaScript
- **Backend:** Firebase Realtime Database, Firebase Auth (Google)
- **Autenticação:** `GoogleAuthProvider`
- **Deploy:** Netlify
- **Gerenciamento de ambiente:** dotenv
- **Ferramentas auxiliares:** `node-cron`, `firebase-admin`

---

## 📦 Instalação Local

1. **Clone o projeto:**

```bash
git clone https://github.com/seu-usuario/duckerchat.git
cd duckerchat
```

2. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` para uso com o `reset.js`:

```env
FIREBASE_PROJECT_ID=duckchat-863fd
FIREBASE_DB_URL=https://duckchat-863fd-default-rtdb.firebaseio.com
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

3. **Instale as dependências (se for usar `reset.js`):**

```bash
npm install firebase-admin dotenv node-cron
```

---

## 🌍 Deploy no Netlify

Este projeto está pronto para deploy com:

```bash
./deploy.sh "mensagem do commit"
```

Ou diretamente:

```bash
netlify deploy --prod --dir=.
```

---

## 🛠 Scripts

- `deploy.sh`: script para automatizar commit + push + deploy Netlify
- `reset.js`: limpa mensagens e usuários ativos do Firebase (executável com `node reset.js`)

---

## 📜 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.

---

## ✨ Créditos

Desenvolvido com 💙 por [Seu Nome ou Equipe]  
Interface inspirada no visual do Discord.