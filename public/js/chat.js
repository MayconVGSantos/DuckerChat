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


const nicknameInput = document.getElementById("nickname-input");
const enterBtn = document.getElementById("enter-chat");
const nicknameScreen = document.getElementById("nickname-screen");
const chatScreen = document.getElementById("chat-screen");
const messageInput = document.getElementById("message-input");
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendBtn.click(); // 🔁 Simula clique no botão "Enviar"
  }
});

const sendBtn = document.getElementById("send-message");
const chatMessages = document.getElementById("chat-messages");
const userList = document.getElementById("user-list");
const leaveBtn = document.getElementById("leave-session");

let nickname = "";
let presenceRef;
const presenceListRef = ref(db, "presence");
const messagesRef = ref(db, "messages");

// Scroll automático
function scrollToBottom() {
  chatMessages.lastElementChild?.scrollIntoView({ behavior: "smooth" });

}

// Renderiza mensagens
function renderMessage(data) {
  const { nickname: user, text, type } = data;
  const msgEl = document.createElement("div");
  msgEl.classList.add("message");

  if (type === "system") {
    msgEl.classList.add("system");
    msgEl.innerHTML = text.includes("entrou")
      ? `🟢 <strong>${user}</strong> entrou no chat`
      : text.includes("saiu")
      ? `🔴 <strong>${user}</strong> saiu do chat`
      : text;
  } else if (user === nickname) {
    msgEl.classList.add("user");
    msgEl.textContent = `${text}`;
  } else {
    msgEl.classList.add("other");
    msgEl.textContent = `${user}: ${text}`;
  }

  chatMessages.appendChild(msgEl);
  scrollToBottom();
}

// Evento: entrar no chat
enterBtn.addEventListener("click", async () => {
  const nick = nicknameInput.value.trim();
  if (!nick) return;

  const testRef = ref(db, `presence/${nick}`);
  const snapshot = await get(testRef);

  if (snapshot.exists()) {
    alert("Este nickname já está em uso. Tente outro.");
    return;
  }

  nickname = nick;
  presenceRef = ref(db, `presence/${nickname}`);

  set(presenceRef, {
    nickname,
    status: "online",
    lastSeen: Date.now(),
  });

  nicknameScreen.classList.add("d-none");
  chatScreen.classList.remove("d-none");

  push(messagesRef, {
    nickname,
    text: `${nickname} entrou no chat.`,
    type: "system",
    timestamp: Date.now(),
  });
});

// Envia mensagem
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text) return;

  push(messagesRef, {
    nickname,
    text,
    type: "user",
    timestamp: Date.now(),
  });

  messageInput.value = "";
});

// Recebe mensagens em tempo real
onChildAdded(messagesRef, (snapshot) => {
  const data = snapshot.val();
  renderMessage(data);
});

// Atualiza lista de usuários online
onValue(presenceListRef, (snapshot) => {
  const data = snapshot.val();
  userList.innerHTML = "";

  if (data) {
    Object.values(data).forEach((user) => {
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

// Atualiza presença ao mudar foco da aba
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

// Ao sair da aba
window.addEventListener("beforeunload", () => {
  if (nickname && presenceRef) {
    set(presenceRef, {
      nickname,
      status: "offline",
      lastSeen: Date.now(),
    });

    push(messagesRef, {
      nickname,
      text: `${nickname} saiu do chat.`,
      type: "system",
      timestamp: Date.now(),
    });
  }
});

// Botão sair da sessão
leaveBtn.addEventListener("click", () => {
  if (presenceRef) {
    remove(presenceRef);
  }
  location.reload();
});
