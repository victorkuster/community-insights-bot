const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const analysisService = require('../services/analysisService');
const fileParserService = require('../services/fileParserService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('analyze-file')
    .setDescription('Analyze a TXT export file from Discord or WhatsApp')
    .addAttachmentOption(option =>
      option.setName('file')
        .setDescription('The TXT file to analyze')
        .setRequired(true)),

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const attachment = interaction.options.getAttachment('file');

      if (!attachment || !attachment.name.toLowerCase().endsWith('.txt')) {
        return await interaction.editReply({ content: 'Please upload a valid .txt file.', flags: MessageFlags.Ephemeral });
      }

      // Update status
      await interaction.editReply({ content: '📥 Arquivo recebido. Lendo conteúdo...', flags: MessageFlags.Ephemeral });

      // Download the file
      const response = await fetch(attachment.url);
      if (!response.ok) {
        throw new Error('Failed to download the file.');
      }
      const content = await response.text();

      // Update status
      await interaction.editReply({ content: '🧩 Arquivo lido. Processando mensagens...', flags: MessageFlags.Ephemeral });

      // Parse the file
      const messages = fileParserService.parse(content);
      if (messages.length === 0) {
        return await interaction.editReply({ content: 'No valid messages found in file.', flags: MessageFlags.Ephemeral });
      }

      // Extract date range
	const validMessages = messages.filter(
	  msg => msg && msg.timestamp instanceof Date && !isNaN(msg.timestamp.getTime())
	);

	const { startDate, endDate } = fileParserService.getDateRange(validMessages);

	const normalizedMessages = validMessages.map(msg => ({
	  content: msg.content,
	  author: msg.author,
	  createdAt: msg.timestamp
	}));

      // Update status
      await interaction.editReply({ content: '🧩 Mensagens processadas. Foram identificadas X semanas.', flags: MessageFlags.Ephemeral });

      const onProgress = (progress) => {
        switch (progress.stage) {
          case 'weekly_processing':
            return interaction.editReply({ content: `🤖 Gerando análise da semana ${progress.currentWeek} de ${progress.totalWeeks}...`, flags: MessageFlags.Ephemeral });
          case 'short_consolidation':
            return interaction.editReply({ content: '🧠 Consolidando análise do período...', flags: MessageFlags.Ephemeral });
          case 'monthly_consolidation':
            return interaction.editReply({ content: '🧠 Consolidando análise mensal...', flags: MessageFlags.Ephemeral });
          case 'finalizing':
            return interaction.editReply({ content: '📝 Análise concluída. Preparando resposta...', flags: MessageFlags.Ephemeral });
          default:
            break;
        }
      };

      // Run analysis
      const report = await analysisService.analyzeMessages(normalizedMessages, startDate, endDate, 'file', onProgress);

      // Helper function to split message into chunks of max length 1900
      function splitMessage(content) {
        const maxLength = 1900;
        const chunks = [];
        let currentChunk = '';

        for (const line of content.split('\n')) {
          if ((currentChunk + '\n' + line).length <= maxLength) {
            currentChunk += '\n' + line;
          } else {
            chunks.push(currentChunk.trim());
            currentChunk = line;
          }
        }

        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
        }

        return chunks;
      }

      // Split the report into safe chunks
      const chunks = splitMessage(report);

      // Send the first chunk with editReply
      await interaction.editReply({ content: chunks[0], flags: MessageFlags.Ephemeral });

      // Send remaining chunks with followUp
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp({ content: chunks[i], flags: MessageFlags.Ephemeral });
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      await interaction.editReply({ content: `An error occurred while processing the file. Please try again later.`, flags: MessageFlags.Ephemeral });
    }
  }
};