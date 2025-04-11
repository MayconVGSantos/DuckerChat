// =============================================
// 🤖 BOT CONTROLLER — Executar apenas no Node.js
// =============================================

import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase, ref, push } from "firebase-admin/database";
import { getDatabase } from "firebase-admin/database";
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv";
import bots from "./botsConfig.js"; // Deve conter um array de bots [{ nickname, frases: [...] }]

dotenv.config();

// ========= Inicializar Firebase Admin =========
const app = initializeApp({
  credential: cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DB_URL,
});

const db = getDatabase(app);

// ========= Função para simular fala dos bots =========
async function simulateConversation() {
  let lastBot = null;

  while (true) {
    const bot = getRandomBot(lastBot);
    lastBot = bot;

    const id = uuidv4(); // Gera uma chave aleatória

    const frase = getRandomPhrase(bot);
    const messagesRef = ref(db, "messages");

    await set(ref(db, `messages/${id}`), {
        nickname: bot.nickname,
        message: frase,
        timestamp: Date.now(),
      });

    console.log(`[BOT] ${bot.nickname}: ${frase}`);

    // Esperar entre 6 e 15 segundos
    await delay(getRandomDelay(6000, 15000));
  }
}

// ========= Utilitários =========

function getRandomBot(excludeBot = null) {
  const candidates = bots.filter((b) => b.nickname !== excludeBot?.nickname);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getRandomPhrase(bot) {
  return bot.frases[Math.floor(Math.random() * bot.frases.length)];
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========= Iniciar loop de bots =========
simulateConversation().catch((err) =>
  console.error("Erro ao rodar bots:", err)
);
