import cron from 'node-cron';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL
};

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = getDatabase();

// Teste imediato (sem cron para debug)
(async () => {
  console.log(`[${new Date().toISOString()}] Iniciando reset...`);

  try {
    await db.ref('messages').remove();
    console.log('✔️ Comando remove() enviado.');

    const snapshot = await db.ref('messages').once('value');

    if (snapshot.exists()) {
      console.log('❌ Ainda existem dados após remove():', snapshot.val());
    } else {
      console.log('✅ Banco de dados resetado com sucesso.');
    }
  } catch (err) {
    console.error('❌ Erro ao tentar resetar Firebase:', err);
  }
})();
