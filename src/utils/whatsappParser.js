function parseWhatsAppDate(datePart, timePart) {
  const [day, month, year] = datePart.split('/').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  const date = new Date(year, month - 1, day, hours, minutes);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function parseWhatsAppMessages(text) {
  const lines = text.split(/\r?\n/);
  let messages = [];
  let currentMessage = null;

  for (let line of lines) {
    const match = line.match(/^(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2}) - (.*?): (.*)$/);
    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
      }
      currentMessage = {
        author: match[3],
        content: match[4],
        timestamp: parseWhatsAppDate(match[1], match[2])
      };
    } else if (currentMessage) {
	  currentMessage.content += '\n' + line;
	}
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  console.log(`Parsed ${messages.length} messages from WhatsApp`);
  return messages;
}

function detectMessageFormat(text) {
  const lines = text.split(/\r?\n/);
  const messageRegex = /^(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2}) - (.*?): (.*)$/;

  let matches = 0;

  for (const line of lines) {
    if (messageRegex.test(line)) {
      matches += 1;
      if (matches >= 2) {
        return 'whatsapp';
      }
    }
  }

  return 'unknown';
}

module.exports = {
  parseWhatsAppMessages,
  detectMessageFormat
};