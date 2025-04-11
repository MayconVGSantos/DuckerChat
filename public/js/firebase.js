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

// ===== CONFIGURAÇÃO ADMIN =====
import { initializeApp as initializeAdminApp, cert } from "firebase-admin/app";
import { getDatabase as getAdminDatabase } from "firebase-admin/database";

let adminDb;
try {
  const serviceAccount = {
    type: "service_account",
    project_id: "duckchat-863fd",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDB1lStugCaQUFn\nP7prfM0JY56pJM59tz7RKGm20BJD98hBhR7ci1MqI3CceuNBaRCiBfsQ+uk55wJB\nNZ9pnxAuUu8NwrHuUg45FpizO2TfExT9v/TskfyY6RRtCiMayWiN/FqB5LdpoX5d\nrj/CZqPt+BsMsYwepyddmwxr4pOGr13H9z0qG+YJs+CIpV7VGC2GAH69HB6FaVFb\ntU56PST6lxnG1UXhTu0iipJ6LT6FsrM5CEHJSL2n597OF6u4uexGWpLhla5x6NRh\nfRv+Yj0YugPglgLWFSWVK9btJTVuLDCwywuJHmsObhyWWXOQM/EQ9EHE3N9VaobR\nCxpQmeJTAgMBAAECggEAAPtXv4G2NE7EyNk9dCe70M1DkIRt1BZshlDg5Yh87/Vi\n6M6e/9NDgJ9gSMncFRsRXnPFx3Lz//HkICC3c6iZ+lUjNO+i517WjcuRLA55Yzq6\nUtMXj07ROsU8/D9z5ZdEDKRxZCe08VxD/7wMEcWUXlHGZX2KEQ6iEfu8WiIEecEQ\nnUFUCVGJUzoRpwYJpz/2RMf4NaeLDCJxqfHAYZwGo6N31VkUoHA+W7VgZI3bsvZS\nYWeeZ3Lc27hVWJlnatwYDo1IM4ZGl8OidflHcyuAhqTV02fjSxM4utMy3f8oCeIh\nXgElmx2kP5FwdDhtVH15IdXDjaQqx0CHASjfzv/IuQKBgQDzEvOiBUrJVfhqPcG5\nsy/gXXAq6aFfY6nTMiqr63d3yBfp0ZmQSFyHaO6DkMocoHVxXNo/Z4x3u4IJ4oAi\niUt25SQmlra5rl00uYx4cDttdOzitJB8s8PKQ/1ETo9jUOKIxq2iAXoQ+g7q8vlD\nFARZCGMO6aO2TRm7QoHS9kqG/QKBgQDMJRoc8LR8SuBaKhO1U3y0liWURaj9vKxL\ng8gUV71xOrauD8b8EtvlTY2VoWYrNwGvNqFlMIpZc5zwg9H8qUDNT9/yHY2reDJl\nPK/49WHEQM9NILYQ3hehfyQ71n8+yRjgnzTP0p/Pp1LNDsYTpcMJWFZmB8Om2sy5\nEbI2mCLXjwKBgQCscb+CLDr4RxNrW9C6C5NlmyRebUzcvXnXqPl46h3hToUYjmhh\nYdSzBBBiKjAYywVGnVcAMFgJAW+pz5ST688r1DgnYDjV1gutwg0TzJt8db0wwGTY\n8zdtoXpmIU28ab+sxTadfmq47I30xNdtbSAAgeC0zbAlPuGIZhBwN+Z7iQKBgQCz\ndXo7Lq67BOes24hvwnDCH6vxaDtis1WTHMnqeCclPsQQx/XY6os8TKzGeRfjrXth\nl9jRp5Y3hJbWKEuUnQVGd40avjgoIIXM0UiwxqWnbIHP/42Nzm9fnPExWSKLAyVH\ncS1v9Gxgk2sKsI4X/4Qw1uM81l58c6O8nX3Y2GzoqQKBgHWolFPG5+QqwwB4JlOp\no9WU59yZhhwWCsmPRRjziEazodFjBd/in785hpnYCCefgTVQrnr8GU3uPL8vKXFG\nPAfQBosf8mfi+rTyScsiHZJZBwvhCdv05YIfgVPHx9Y0dLCaUW3hUEP+2UB4HbBF\nmmN8rSGVN92EYNnBIR9g6Lgz\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-fbsvc@duckchat-863fd.iam.gserviceaccount.com",
  };

  initializeAdminApp({
    credential: cert(serviceAccount),
    databaseURL: "https://duckchat-863fd-default-rtdb.firebaseio.com",
  });

  adminDb = getAdminDatabase();
} catch (err) {
  console.warn("⚠️ Firebase Admin não inicializado:", err.message);
}

export { adminDb };

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
