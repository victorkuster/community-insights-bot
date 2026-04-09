const config = require('../config/config');
const textUtils = require('../utils/textUtils');
const dateUtils = require('../utils/dateUtils');

console.log(config);

class DiscordService {
  async fetchMessages(client, channelId, startDate, endDate) {
    if (!client || !channelId) {
      throw new Error('Invalid input parameters');
    }

    const normalizedStartDate = dateUtils.normalizeDate(startDate);
    const normalizedEndDate = dateUtils.normalizeDate(endDate);

    if (isNaN(normalizedStartDate.getTime()) || isNaN(normalizedEndDate.getTime())) {
      throw new Error('Invalid date inputs');
    }

    if (normalizedEndDate < normalizedStartDate) {
      throw new Error('End date must not be earlier than start date');
    }

    console.log('Start fetching messages...');

    const channel = await client.channels.fetch(channelId);
    if (!channel.isTextBased()) {
      throw new Error('Channel does not support messages');
    }

    console.log(`Channel found: ${channel.name}`);

    let allMessages = [];
    let lastMessageId = null;
    let hasMoreMessages = true;

    while (hasMoreMessages) {
      const options = { limit: 100 };
      if (lastMessageId) {
        options.before = lastMessageId;
      }

      const messages = await channel.messages.fetch(options);
      console.log(`Fetched ${messages.size} messages`);

      for (const message of messages.values()) {
        if (!message.content || !textUtils.isMeaningfulMessage(message.content, config.filters.minimumMessageLength)) {
          continue;
        }

        if (message.createdAt >= normalizedStartDate && message.createdAt <= normalizedEndDate) {
          allMessages.push({
            id: message.id,
            content: message.content,
            authorName: message.author.username,
            createdAt: message.createdAt
          });
        }
      }

      lastMessageId = messages.lastKey();
      hasMoreMessages = messages.size > 0 && messages.last().createdAt >= normalizedStartDate;
    }

    allMessages.sort((a, b) => a.createdAt - b.createdAt);

    console.log(`Total messages returned: ${allMessages.length}`);

    return allMessages;
  }
}

module.exports = new DiscordService();