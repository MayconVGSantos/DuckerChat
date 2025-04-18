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
  onDisconnect,
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "./firebase.js";

// ===== SELEÇÃO DE ELEMENTOS DOM =====
// Elementos da tela de entrada
const nicknameInput = document.getElementById("nickname-input");
const enterBtn = document.getElementById("enter-chat");
const nicknameScreen = document.getElementById("nickname-screen");
const chatScreen = document.getElementById("chat-screen");
const googleLoginBtn = document.getElementById("google-login");

// Elementos da interface de chat
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-message");
const chatMessages = document.getElementById("chat-messages");
const userList = document.getElementById("user-list");
const leaveBtn = document.getElementById("leave-session");
const typingRef = ref(db, `typing`);
const typingIndicator = document.getElementById("typing-indicator");

// Garantir que o indicador de digitação tenha a cor correta (sobreposição de qualquer estilo inline)
typingIndicator.style.color = "#dcddde";
typingIndicator.style.opacity = "0.8";

// ===== CONFIGURAÇÃO DE EVENTOS DE ENTRADA =====
googleLoginBtn.addEventListener("click", async () => {
  const nick = nicknameInput.value.trim();
  if (!nick) {
    alert("Por favor, escolha um nickname antes de entrar.");
    return;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Nickname será sempre o que o usuário digitou
    nickname = nick;

    const testRef = ref(db, `presence/${nickname}`);
    const snapshot = await get(testRef);

    if (snapshot.exists()) {
      alert("Este nickname já está em uso. Tente outro.");
      return;
    }

    presenceRef = ref(db, `presence/${nickname}`);
    await set(presenceRef, {
      nickname,
      status: "online",
      lastSeen: Date.now(),
      uid: user.uid,
    });

    onDisconnect(presenceRef).remove();

    nicknameScreen.classList.add("d-none");
    chatScreen.classList.remove("d-none");

    setTimeout(() => messageInput.focus(), 100);

    push(messagesRef, {
      nickname,
      text: `${nickname} entrou no chat.`,
      type: "system",
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("Erro no login Google:", err);
    alert("Erro ao autenticar com o Google.");
  }
});

// === Controle de digitação ===
let typingTimeout;
let typingInterval;
let isTyping = false;

// Função para atualizar o estado de digitação
function updateTypingStatus() {
  const inputValue = messageInput.value.trim();

  if (inputValue.length > 0) {
    if (!isTyping) {
      isTyping = true;
      set(ref(db, `typing/${nickname}`), true);
    }

    // Reinicia timeout (não remove se ainda está digitando)
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      // Verifica novamente se ainda tem texto, caso contrário remove
      if (messageInput.value.trim().length === 0) {
        remove(ref(db, `typing/${nickname}`));
        isTyping = false;
      }
    }, 3000);
  } else {
    // Remove imediatamente se apagou tudo
    remove(ref(db, `typing/${nickname}`));
    if (typingTimeout) clearTimeout(typingTimeout);
    isTyping = false;
  }
}

function adjustChatLayout() {
  // Reconfigurar a estrutura se necessário
  const chatScreen = document.getElementById("chat-screen");
  const chatMessages = document.getElementById("chat-messages");
  const typingIndicator = document.getElementById("typing-indicator");
  const messageInputContainer = document.getElementById("message-input-container");
  
  // 1. Ajustar o container de mensagens para permitir overflow sem afetar o indicador de digitação
  chatMessages.style.overflowY = "auto";
  chatMessages.style.display = "flex";
  chatMessages.style.flexDirection = "column";
  chatMessages.style.flex = "1 1 auto";
  
  // 2. Criar container fixo para o indicador + input de mensagem se ainda não existir
  let fixedBottomContainer = document.getElementById("fixed-bottom-container");
  
  if (!fixedBottomContainer) {
    // Não modificar a DOM diretamente se não necessário
    fixedBottomContainer = document.createElement("div");
    fixedBottomContainer.id = "fixed-bottom-container";
    fixedBottomContainer.style.position = "sticky";
    fixedBottomContainer.style.bottom = "0";
    fixedBottomContainer.style.width = "100%";
    fixedBottomContainer.style.backgroundColor = "#36393f";
    fixedBottomContainer.style.zIndex = "100";
    fixedBottomContainer.style.borderTop = "1px solid #42464d";
    
    // Mover os elementos para o container fixo
    typingIndicator.parentNode.insertBefore(fixedBottomContainer, typingIndicator);
    fixedBottomContainer.appendChild(typingIndicator);
    fixedBottomContainer.appendChild(messageInputContainer);
  }
  
  // 3. Ajustar o estilo do indicador de digitação
  typingIndicator.style.color = "#dcddde";
  typingIndicator.style.backgroundColor = "#36393f";
  typingIndicator.style.paddingLeft = "16px";
  typingIndicator.style.paddingRight = "16px";
  typingIndicator.style.paddingTop = "8px";
  typingIndicator.style.paddingBottom = "4px";
  typingIndicator.style.fontSize = "0.85rem";
  typingIndicator.style.fontStyle = "italic";
  typingIndicator.style.opacity = "0.8";
  
  // Garantir que o indicador esteja inicialmente oculto
  if (typingIndicator.textContent.trim() === "") {
    typingIndicator.style.display = "none";
  }
}

// Execute este ajuste quando a página carregar
document.addEventListener("DOMContentLoaded", adjustChatLayout);

// Também execute quando a janela for redimensionada para manter a consistência
window.addEventListener("resize", adjustChatLayout);

// Monitor de entrada com verificação de conteúdo
messageInput.addEventListener("input", updateTypingStatus);

// Certeza que o status é limpo quando o campo perde foco
messageInput.addEventListener("blur", () => {
  // Se o campo estiver vazio quando perder foco, remove status de digitação
  if (messageInput.value.trim().length === 0) {
    remove(ref(db, `typing/${nickname}`));
    if (typingTimeout) clearTimeout(typingTimeout);
    isTyping = false;
  }
});

// === Observa quem está digitando ===
onValue(typingRef, (snapshot) => {
  const data = snapshot.val() || {};
  const typingUsers = Object.keys(data).filter((user) => user !== nickname);

  // Garantir que o indicador existe e tem o estilo correto
  if (!typingIndicator) return;
  
  if (typingUsers.length === 0) {
    // Não há usuários digitando - esconde o indicador
    typingIndicator.style.display = "none";
    typingIndicator.textContent = "";
    if (typingIndicator._dotInterval) {
      clearInterval(typingIndicator._dotInterval);
      typingIndicator._dotInterval = null;
    }
    return;
  }

  // Formatação do texto com pontos animados
  const dots = ["", ".", "..", "..."];
  let dotIndex = 0;
  
  // Limpa intervalo anterior
  if (typingIndicator._dotInterval) {
    clearInterval(typingIndicator._dotInterval);
  }
  
  // Define novo intervalo para animação de pontos
  typingIndicator._dotInterval = setInterval(() => {
    const currentDots = dots[dotIndex++ % dots.length];
    
    // Determina a mensagem baseada no número de usuários
    if (typingUsers.length === 1) {
      typingIndicator.textContent = `${typingUsers[0]} está digitando${currentDots}`;
    } else if (typingUsers.length <= 3) {
      typingIndicator.textContent = `${typingUsers.join(", ")} estão digitando${currentDots}`;
    } else {
      typingIndicator.textContent = `Várias pessoas estão digitando${currentDots}`;
    }
    
    // Certifica-se que o indicador esteja visível e com estilo correto
    typingIndicator.style.display = "block";
    typingIndicator.style.color = "#dcddde";
    typingIndicator.style.backgroundColor = "#36393f";
  }, 500);
});

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
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ===== FUNÇÕES DE RENDERIZAÇÃO =====
// Renderiza uma mensagem no DOM baseada no tipo e origem
function renderMessage(data) {
  const { nickname: user, text, type, timestamp } = data;
  const time = formatTime(timestamp);
  const msgEl = document.createElement("div");
  msgEl.classList.add("message");

  if (type === "system") {
    msgEl.classList.add("system");
    msgEl.innerHTML = text; // usa o texto como foi gravado no Firebase
    msgEl.style.animation = "fadeInUp 0.4s ease-out";
  } else if (user === nickname) {
    // Mensagem do usuário atual (balão à direita)
    msgEl.classList.add("user");
    msgEl.innerHTML = `
      <div class="message-content">
        ${text}
      </div>
      <div class="message-time" style="text-align: right; font-size: 0.7rem; opacity: 0.7; margin-top: 4px;">
        ${time}
      </div>
    `;
  } else {
    // Mensagem de outros usuários (balão à esquerda)
    msgEl.classList.add("other");
    msgEl.innerHTML = `
      <div class="message-user" style="font-weight: bold; margin-bottom: 4px; color: #7289da;">
        ${user}
      </div>
      <div class="message-content">
        ${text}
      </div>
      <div class="message-time" style="font-size: 0.7rem; opacity: 0.7; margin-top: 4px;">
        ${time}
      </div>
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

  // Limpa campo de entrada e remove status de digitação
  messageInput.value = "";

  // Explicitamente remove o status de digitação (importante!)
  remove(ref(db, `typing/${nickname}`));
  if (typingTimeout) clearTimeout(typingTimeout);
  isTyping = false;

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
      offline: "⚫", // Cinza para offline
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
    remove(ref(db, `typing/${nickname}`));
  }
});

// Botão para sair da sessão explicitamente
leaveBtn.addEventListener("click", async () => {
  await remove(ref(db, `typing/${nickname}`));
  await remove(presenceRef);
  window.location.reload();
});
