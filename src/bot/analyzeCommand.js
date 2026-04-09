const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const analysisService = require('../services/analysisService');
const discordService = require('../services/discordService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('analyze')
    .setDescription('Analisa mensagens de um canal do Discord em um intervalo de datas')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('O canal a ser analisado')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('data_inicial')
        .setDescription('A data inicial no formato YYYY-MM-DD')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('data_final')
        .setDescription('A data final no formato YYYY-MM-DD')
        .setRequired(true)),

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const channel = interaction.options.getChannel('canal');
      const startDateStr = interaction.options.getString('data_inicial');
      const endDateStr = interaction.options.getString('data_final');

      // Validate date format
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(startDateStr) || !datePattern.test(endDateStr)) {
        return await interaction.editReply({ content: 'Datas inválidas. Use o formato YYYY-MM-DD.', flags: MessageFlags.Ephemeral });
      }

      // Validate channel type
      if (!channel.isTextBased()) {
        return await interaction.editReply({ content: 'Selecione um canal de texto válido.', flags: MessageFlags.Ephemeral });
      }

      // Parse dates with UTC to handle timezone issues correctly
      const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
      const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

      const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0));
      const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59));

      // Update status
      await interaction.editReply({ content: '📡 Coletando mensagens do canal...', flags: MessageFlags.Ephemeral });

      // Fetch messages from the channel using discordService
      const channelId = channel.id;
      const messages = await discordService.fetchMessages(interaction.client, channelId, startDate, endDate);

      const onProgress = (progress) => {
        switch (progress.stage) {
          case 'weeks_detected':
            return interaction.editReply({
              content: `🧩 Mensagens processadas. Foram identificadas ${progress.totalWeeks} semanas.`,
              flags: MessageFlags.Ephemeral
            });
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
      const report = await analysisService.analyzeMessages(messages, startDate, endDate, 'discord', onProgress);

      // Handle long responses
      const maxMessageLength = 2000;
      const chunks = [];
      for (let i = 0; i < report.length; i += maxMessageLength) {
        chunks.push(report.slice(i, i + maxMessageLength));
      }

      await interaction.editReply({ content: chunks[0], flags: MessageFlags.Ephemeral });
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp({ content: chunks[i], flags: MessageFlags.Ephemeral });
      }
    } catch (error) {
      console.error('Error processing analysis:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'An error occurred while processing the analysis.', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: 'An error occurred while processing the analysis.', flags: MessageFlags.Ephemeral });
      }
    }
  }
};