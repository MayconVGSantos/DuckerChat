import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb as db } from "../firebase.js";
import { bots } from "./botsConfig.js";
import { ref, push } from "firebase-admin/database";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI("AIzaSyDxqp5Q4LMVowmML6Pj2pAXqBLdD2k9_uI");

async function generateBotResponse(bot, input) {
  const result = await genAI.generateContent({
    model: "models/gemini-2.0-flash",
    contents: [
      { role: "user", parts: [{ text: `${bot.behaviorPrompt}\n${input}` }] },
    ],
  });

  return result.response.text();
}

async function sendMessageToChat(botName, message) {
  await push(ref(db, "messages"), {
    nickname: botName,
    text: message,
    type: "user",
    timestamp: Date.now(),
  });
}

async function simulateConversation() {
  console.log("💬 Iniciando diálogo entre bots...");
  while (true) {
    const speaker = bots[0];
    const listener = bots[1];

    try {
      const response = await generateBotResponse(listener, speaker.lastMessage);
      console.log(`[${listener.name}]: ${response}`);
      listener.lastMessage = response;

      await sendMessageToChat(listener.name, response);

      bots.reverse(); // Alterna papéis
      await new Promise((r) => setTimeout(r, 5000)); // Delay de 5 segundos
    } catch (err) {
      console.error("❌ Erro ao gerar/responder:", err.message);
    }
  }
}

simulateConversation();
