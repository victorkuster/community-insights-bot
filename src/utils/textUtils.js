const normalizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ');
};

const isMeaningfulMessage = (text, minimumMessageLength = 5) => {
  const normalizedText = normalizeText(text);
  return normalizedText.length >= minimumMessageLength;
};

const formatMessageForPrompt = (message) => {
  if (!message.createdAt) throw new Error('Missing createdAt field');
  const date = new Date(message.createdAt);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const content = normalizeText(message.content || '');
  const authorName = message.authorName || 'unknown';
  return `[${day}/${month}/${year} ${hours}:${minutes}] ${authorName}: ${content}`;
};

const buildPromptMessageBlock = (messages, minimumMessageLength = 5) => {
  return messages
    .filter(msg => isMeaningfulMessage(msg.content, minimumMessageLength))
    .map(formatMessageForPrompt)
    .join('\n');
};

module.exports = {
  normalizeText,
  isMeaningfulMessage,
  formatMessageForPrompt,
  buildPromptMessageBlock
};