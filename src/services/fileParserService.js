const { parseWhatsAppMessages, detectMessageFormat } = require('../utils/whatsappParser');

class FileParserService {
	parseDiscordDate(datePart, timePart) {
	  const [day, month, year] = datePart.split('/').map(Number);
	  const [hours, minutes] = timePart.split(':').map(Number);

	  const date = new Date(year, month - 1, day, hours, minutes);

	  if (isNaN(date.getTime())) {
		return null;
	  }

	  return date;
	}
	parseDiscordExportMessages(content) {
	  const lines = content.split('\n');
	  let messages = [];
	  let currentMessage = null;

	  for (let line of lines) {
		if (line.startsWith('[')) {
		  if (currentMessage) {
			messages.push(currentMessage);
		  }

		  const match = line.match(/\[(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2})] (.*)/);
		  if (match) {
			const timestamp = this.parseDiscordDate(match[1], match[2]);

			if (timestamp) {
			  currentMessage = {
				author: match[3],
				content: '',
				timestamp
			  };
			} else {
			  currentMessage = null;
			}
		  }
		} else if (currentMessage && line.trim() !== '') {
		  currentMessage.content += '\n' + line.trim();
		}
	  }

	  if (currentMessage) {
		messages.push(currentMessage);
	  }

	  messages = messages.filter(
		msg => msg && msg.timestamp instanceof Date && !isNaN(msg.timestamp.getTime())
	  );

	  messages.sort((a, b) => a.timestamp - b.timestamp);

    return messages;
  }

  // Internal method to detect Discord export format
  detectDiscordExportFormat(content) {
    const lines = content.split('\n');
    for (let line of lines) {
      if (line.match(/^\[(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2})] (.*)/)) {
        return true;
      }
    }
    return false;
  }

  // Public method to parse content
  parse(content) {
    const format = detectMessageFormat(content);
    if (format === "whatsapp") {
      console.log("Detected WhatsApp format");
      return parseWhatsAppMessages(content);
    } else if (this.detectDiscordExportFormat(content)) {
      console.log("Detected Discord export format");
      return this.parseDiscordExportMessages(content);
    } else {
      throw new Error('Unsupported file format');
    }
  }

  // Public method to get date range from messages
  getDateRange(messages) {
    let minDate = null;
    let maxDate = null;

    for (let message of messages) {
      if (!minDate || message.timestamp < minDate) {
        minDate = message.timestamp;
      }
      if (!maxDate || message.timestamp > maxDate) {
        maxDate = message.timestamp;
      }
    }

    return { startDate: minDate, endDate: maxDate };
  }

  // Public method to chunk messages
  chunkMessages(messages, chunkSize = 100) {
    const chunks = [];
    for (let i = 0; i < messages.length; i += chunkSize) {
      chunks.push(messages.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

module.exports = new FileParserService();