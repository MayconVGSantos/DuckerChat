// Não estou usando esse código, por causa do Netlify, que não suporta WebSockets

// ===== CONFIGURAÇÃO DO SERVIDOR EXPRESS =====
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3000;

// ===== RESOLUÇÃO DE CAMINHOS (para ES Modules) =====
// Resolve __dirname em ESModules que não tem suporte nativo a essa variável
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== DEFINIÇÃO DE ROTEAMENTO ESTÁTICO =====
// Serve arquivos estáticos para o cliente
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// ===== ROTEAMENTO DE PÁGINAS =====
// Rota principal - entrega o HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== API DE CONFIGURAÇÃO =====
// Rota para fornecer credenciais Firebase de forma segura
// evitando hard-coding no cliente
app.get('/config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  });
});

// ===== INICIALIZAÇÃO DO SERVIDOR =====
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});