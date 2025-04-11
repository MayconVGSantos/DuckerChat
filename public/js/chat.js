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
  get
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

// ===== FUNÇÕES DE RENDERIZAÇÃO =====
// Renderiza uma mensagem no DOM baseada no tipo e origem
function renderMessage(data) {
  const { nickname: user, text, type } = data;
  const msgEl = document.createElement("div");
  msgEl.classList.add("message");

  if (type === "system") {
    // Mensagem de sistema (entrada/saída de usuários)
    msgEl.classList.add("system");
    msgEl.innerHTML = text.includes("entrou")
      ? `🟢 <strong>${user}</strong> entrou no chat`
      : text.includes("saiu")
      ? `🔴 <strong>${user}</strong> saiu do chat`
      : text;
  } else if (user === nickname) {
    // Mensagem do usuário atual
    msgEl.classList.add("user");
    msgEl.textContent = `${text}`;
  } else {
    // Mensagem de outros usuários
    msgEl.classList.add("other");
    msgEl.textContent = `${user}: ${text}`;
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

  // Transição para tela de chat
  nicknameScreen.classList.add("d-none");
  chatScreen.classList.remove("d-none");

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
    Object.values(data).forEach((user) => {
      // Código de cor baseado no estado do usuário
      const color =
        user.status === "online"
          ? "limegreen"
          : user.status === "background"
          ? "orange"
          : "gray";
      const li = document.createElement("li");
      li.innerHTML = `<span style="color: ${color}">●</span> ${user.nickname}`;
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