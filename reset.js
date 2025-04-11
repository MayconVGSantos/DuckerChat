// ===== SCRIPT PARA RESETAR O FIREBASE =====
// Este script limpa todos os dados do chat (mensagens e presenças)
import cron from 'node-cron';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// ===== CONFIGURAÇÃO FIREBASE ADMIN =====
// Usa credenciais de administrador para acesso privilegiado
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL
};

// Inicializa aplicação admin
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = getDatabase();

// ===== FUNÇÃO DE RESET IMEDIATO =====
// Executada automaticamente ao rodar o script (sem cron para teste)
(async () => {
  console.log(`[${new Date().toISOString()}] Iniciando reset...`);

  try {
    // Remove todos os dados do chat
    await db.ref('messages').remove();
    await db.ref('presence').remove(); // Remove usuários conectados

    console.log('✔️ Comando remove() enviado para /messages e /presence.');

    // Verifica se a limpeza foi bem-sucedida
    const snapshotMsgs = await db.ref('messages').once('value');
    const snapshotPres = await db.ref('presence').once('value');

    if (!snapshotMsgs.exists() && !snapshotPres.exists()) {
      console.log('✅ Banco de dados resetado com sucesso.');
    } else {
      console.warn('⚠️ Alguns dados persistem após o reset.');
    }
  } catch (err) {
    console.error('❌ Erro ao tentar resetar Firebase:', err);
  }
})();