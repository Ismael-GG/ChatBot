const API_BASE = (window.APP_CONFIG?.apiBase || window.location.origin).replace(/\/$/, '');

const chatContainer = document.getElementById('chatContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const submitBtn = document.getElementById('submitBtn');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');

let isLoading = false;

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function autoResizeTextarea() {
  messageInput.style.height = 'auto';
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 120)}px`;
}

function setLoading(loading) {
  isLoading = loading;
  submitBtn.disabled = loading;
  messageInput.disabled = loading;
}

function setStatus(state, label) {
  statusBadge.classList.remove('header__status--online', 'header__status--offline');
  if (state === 'online') statusBadge.classList.add('header__status--online');
  if (state === 'offline') statusBadge.classList.add('header__status--offline');
  statusText.textContent = label;
}

function createMessageElement(role, content, options = {}) {
  const { isError = false, isLoading = false } = options;

  const wrapper = document.createElement('div');
  wrapper.className = `message message--${role}${isError ? ' message--error' : ''}${isLoading ? ' message--loading' : ''}`;

  const avatar = document.createElement('div');
  avatar.className = 'message__avatar';
  avatar.textContent = role === 'user' ? 'Tú' : 'U';

  const bubble = document.createElement('div');
  bubble.className = 'message__bubble';

  if (isLoading) {
    bubble.innerHTML = `
      <span>Consultando el Estatuto</span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
  } else {
    const paragraphs = content.split('\n').filter(Boolean);
    paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      bubble.appendChild(p);
    });
  }

  wrapper.append(avatar, bubble);
  return wrapper;
}

function appendMessage(role, content, options = {}) {
  const element = createMessageElement(role, content, options);
  chatContainer.appendChild(element);
  scrollToBottom();
  return element;
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();

    if (response.ok && data.estatutoLoaded) {
      if (data.estatutoIsSample) {
        setStatus('offline', 'Estatuto de ejemplo');
      } else {
        setStatus('online', 'Estatuto cargado');
      }
    } else if (response.ok) {
      setStatus('offline', 'Estatuto no disponible');
    } else {
      setStatus('offline', 'Servidor no disponible');
    }
  } catch {
    setStatus('offline', 'Sin conexión');
  }
}

async function sendMessage(message) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al procesar la consulta.');
  }

  return data.data.message;
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();
  if (!message || isLoading) return;

  appendMessage('user', message);
  messageInput.value = '';
  autoResizeTextarea();

  setLoading(true);
  const loadingElement = appendMessage('assistant', '', { isLoading: true });

  try {
    const reply = await sendMessage(message);
    loadingElement.remove();
    appendMessage('assistant', reply);
  } catch (error) {
    loadingElement.remove();
    appendMessage('assistant', error.message, { isError: true });
  } finally {
    setLoading(false);
    messageInput.focus();
  }
});

messageInput.addEventListener('input', autoResizeTextarea);

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

checkHealth();
messageInput.focus();
