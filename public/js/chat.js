// ===== IMPORTAÇÃO DE FUNÇÕES FIREBASE =====
import {
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
} from "./firebase.js";

// ===== SELEÇÃO DE ELEMENTOS DOM =====
// Elementos da tela de entrada
const nicknameInput = document.getElementById("nickname-input");
const enterBtn = document.getElementById("enter-chat");
const nicknameScreen = document.getElementById("nickname-screen");
const chatScreen = document.getElementById("chat-screen");

// Elementos da interface de chat
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-message");
const chatMessages = document.getElementById("chat-messages");
const userList = document.getElementById("user-list");
const leaveBtn = document.getElementById("leave-session");

// ===== CONFIGURAÇÃO DE EVENTOS DE ENTRADA =====
// Permite enviar mensagem com Enter
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendBtn.click(); // Simula clique no botão "Enviar"
  }
});

// Foco automático no campo de entrada quando o chat é aberto
nicknameInput.focus();

// ===== VARIÁVEIS DE ESTADO =====
let nickname = "";
let presenceRef;
const presenceListRef = ref(db, "presence");
const messagesRef = ref(db, "messages");

// ===== FUNÇÕES DE UTILIDADE =====
// Função para rolar automaticamente para a última mensagem
function scrollToBottom() {
  chatMessages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
}

// Formata timestamp para mostrar hora da mensagem (estilo Discord)
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===== FUNÇÕES DE RENDERIZAÇÃO =====
// Renderiza uma mensagem no DOM baseada no tipo e origem
function renderMessage(data) {
  const { nickname: user, text, type, timestamp } = data;
  const time = formatTime(timestamp);
  const msgEl = document.createElement("div");
  msgEl.classList.add("message");

  if (type === "system") {
    // Mensagem de sistema (entrada/saída de usuários)
    msgEl.classList.add("system");
    msgEl.innerHTML = text.includes("entrou")
      ? `<strong>${user}</strong> acabou de entrar`
      : text.includes("saiu")
      ? `<strong>${user}</strong> saiu do chat`
      : text;
  } else if (user === nickname) {
    // Mensagem do usuário atual
    msgEl.classList.add("user");
    msgEl.innerHTML = `
      <div class="d-flex align-items-center mb-1">
        <span class="fw-bold">${user}</span>
        <span class="text-muted ms-2" style="font-size: 0.7rem;">${time}</span>
      </div>
      ${text}
    `;
  } else {
    // Mensagem de outros usuários
    msgEl.classList.add("other");
    msgEl.innerHTML = `
      <div class="d-flex align-items-center mb-1">
        <span class="fw-bold">${user}</span>
        <span class="text-muted ms-2" style="font-size: 0.7rem;">${time}</span>
      </div>
      ${text}
    `;
  }

  chatMessages.appendChild(msgEl);
  scrollToBottom();
}

// ===== EVENTOS DE INTERAÇÃO =====
// 1. Evento: entrar no chat
enterBtn.addEventListener("click", async () => {
  const nick = nicknameInput.value.trim();
  if (!nick) return;

  // Verifica se o nickname já está em uso
  const testRef = ref(db, `presence/${nick}`);
  const snapshot = await get(testRef);

  if (snapshot.exists()) {
    alert("Este nickname já está em uso. Tente outro.");
    return;
  }

  // Inicializa usuário e sessão
  nickname = nick;
  presenceRef = ref(db, `presence/${nickname}`);

  // Registra presença no Firebase
  set(presenceRef, {
    nickname,
    status: "online",
    lastSeen: Date.now(),
  });

  onDisconnect(presenceRef).remove(); // Remove presença ao desconectar

  // Transição para tela de chat
  nicknameScreen.classList.add("d-none");
  chatScreen.classList.remove("d-none");
  
  // Foco no campo de mensagem após entrar
  setTimeout(() => messageInput.focus(), 100);

  // Notificação de entrada no chat
  push(messagesRef, {
    nickname,
    text: `${nickname} entrou no chat.`,
    type: "system",
    timestamp: Date.now(),
  });
});

// 2. Evento: enviar mensagem
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text) return;

  // Salva mensagem no Firebase
  push(messagesRef, {
    nickname,
    text,
    type: "user",
    timestamp: Date.now(),
  });

  // Limpa campo de entrada
  messageInput.value = "";
  messageInput.focus();
});

// ===== LISTENERS DE TEMPO REAL FIREBASE =====
// 1. Receber novas mensagens
onChildAdded(messagesRef, (snapshot) => {
  const data = snapshot.val();
  renderMessage(data);
});

// 2. Atualização da lista de usuários online
onValue(presenceListRef, (snapshot) => {
  const data = snapshot.val();
  userList.innerHTML = "";

  if (data) {
    // Criar status icons diferentes tipo discord
    const statusIcons = {
      online: "🟢", // Verde para online
      background: "🟠", // Laranja para ausente
      offline: "⚫" // Cinza para offline
    };
    
    Object.values(data).forEach((user) => {
      const statusIcon = statusIcons[user.status] || statusIcons.offline;
      const li = document.createElement("li");
      li.innerHTML = `<span>${statusIcon}</span> ${user.nickname}`;
      
      // Adiciona classe para o próprio usuário
      if (user.nickname === nickname) {
        li.classList.add("fw-bold");
      }
      
      userList.appendChild(li);
    });
  }
});

// ===== GERENCIAMENTO DE PRESENÇA =====
// Atualização de status ao mudar o foco da aba
window.addEventListener("focus", () => {
  if (presenceRef) {
    set(presenceRef, {
      nickname,
      status: "online",
      lastSeen: Date.now(),
    });
  }
});

window.addEventListener("blur", () => {
  if (presenceRef) {
    set(presenceRef, {
      nickname,
      status: "background",
      lastSeen: Date.now(),
    });
  }
});

// ===== GERENCIAMENTO DE SAÍDA =====
// Ao fechar a janela ou recarregar a página
window.addEventListener("beforeunload", () => {
  if (nickname && presenceRef) {
    // Atualiza status como offline
    set(presenceRef, {
      nickname,
      status: "offline",
      lastSeen: Date.now(),
    });

    // Publica mensagem de saída
    push(messagesRef, {
      nickname,
      text: `${nickname} saiu do chat.`,
      type: "system",
      timestamp: Date.now(),
    });
  }
});

// Botão para sair da sessão explicitamente
leaveBtn.addEventListener("click", () => {
  if (presenceRef) {
    remove(presenceRef); // Remove presença completamente
  }
  location.reload(); // Recarrega a página para voltar à tela inicial
});