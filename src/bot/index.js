const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const logger = require('../utils/logger');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const commands = {
  analyze: require('./analyzeCommand'),
  'analyze-file': require('./analyzeFileCommand')
};

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commands[interaction.commandName];
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(error.stack || error.message || error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'An unexpected error occurred.' });
    } else {
      await interaction.reply({ content: 'An unexpected error occurred.' });
    }
  }
});

client.once('ready', () => {
  logger.success('Bot is now online and running!');
});

client.login(process.env.DISCORD_TOKEN);