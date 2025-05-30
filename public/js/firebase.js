// ===== IMPORTAÇÃO FIREBASE CORE E DATABASE (CLIENT-SIDE) =====
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
  onDisconnect,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// ===== CONFIGURAÇÃO DO FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyADL4OkCjrdnTuIFKPoKGGOep16WALS4dE",
  authDomain: "duckchat-863fd.firebaseapp.com",
  databaseURL: "https://duckchat-863fd-default-rtdb.firebaseio.com",
  projectId: "duckchat-863fd",
  storageBucket: "duckchat-863fd.appspot.com",
  messagingSenderId: "1066552710989",
  appId: "1:1066552710989:web:960bca04f332e863234904",
  measurementId: "G-0SVH3TD9Z2",
};

// ===== INICIALIZAÇÃO DO APP FIREBASE =====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ===== EXPORTAÇÃO DE API FIREBASE PARA USO NO CLIENTE =====
export {
  db,
  auth,
  provider,
  ref,
  push,
  onChildAdded,
  onValue,
  set,
  remove,
  update,
  get,
  onDisconnect,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
};
