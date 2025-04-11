// ===== IMPORTAÇÃO DE MÓDULOS FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  onValue,
  set,
  remove,
  update,
  get,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// ===== CONFIGURAÇÃO DO FIREBASE =====
// ATENÇÃO: Estas credenciais ficam expostas no cliente
// Usar regras de segurança do Firebase para mitigar riscos
const firebaseConfig = {
    apiKey: "AIzaSyADL4OkCjrdnTuIFKPoKGGOep16WALS4dE",
    authDomain: "duckchat-863fd.firebaseapp.com",
    databaseURL: "https://duckchat-863fd-default-rtdb.firebaseio.com",
    projectId: "duckchat-863fd",
    storageBucket: "duckchat-863fd.firebasestorage.app",
    messagingSenderId: "1066552710989",
    appId: "1:1066552710989:web:960bca04f332e863234904",
    measurementId: "G-0SVH3TD9Z2"
  };
  
// ===== INICIALIZAÇÃO DO APP FIREBASE =====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== EXPORTAÇÃO DE API FIREBASE =====
// Exporta funções necessárias para operações no banco de dados
export {
  db,
  ref,
  push,
  onChildAdded,
  onValue,
  set,
  remove,
  update,
  get,
  onDisconnect
};