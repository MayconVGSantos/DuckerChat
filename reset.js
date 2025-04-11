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
    await db.ref('presence').remove(); // ✅ Remove usuários conectados

    console.log('✔️ Comando remove() enviado para /messages e /presence.');

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
