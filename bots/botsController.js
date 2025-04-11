// =============================================
// 🤖 BOT CONTROLLER — Executar apenas no Node.js
// =============================================

import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import bots from "./botsConfig.js";

dotenv.config();

// 🔐 Inicializa Firebase Admin com credenciais
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

// 🤖 Simula mensagens de bots no loop
async function simulateConversation() {
  let lastBot = null;

  while (true) {
    const bot = getRandomBot(lastBot);
    lastBot = bot;
    const frase = getRandomPhrase(bot);
    const id = uuidv4();

    // ✅ ref e set via instância
    await db.ref(`messages/${id}`).set({
      nickname: bot.nickname,
      message: frase,
      timestamp: Date.now(),
    });

    console.log(`[BOT] ${bot.nickname}: ${frase}`);
    await delay(getRandomDelay(6000, 15000));
  }
}

// 🔁 Funções auxiliares
function getRandomBot(exclude) {
  const filtered = bots.filter((b) => b.nickname !== exclude?.nickname);
  return filtered[Math.floor(Math.random() * filtered.length)];
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

// ▶️ Inicia bot
simulateConversation().catch(console.error);
