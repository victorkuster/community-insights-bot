const dateUtils = require('../utils/dateUtils');
const llmService = require('./llmService');
const config = require('../config/config');
const weeklyPrompt = require('../prompts/weeklyPrompt');
const periodPrompt = require('../prompts/periodPrompt');
const monthlyPrompt = require('../prompts/monthlyPrompt');

class AnalysisService {
  // Helper method to get the model based on type and provider
  getModel(type) {
    const provider = config.llm.provider;
    if (!config.models[provider]) {
      throw new Error(`Unsupported model provider: ${provider}`);
    }
    const model = config.models[provider][type];
    if (!model) {
      throw new Error(`Missing model config for ${provider}.${type}`);
    }
    return model;
  }

  // Helper method to format date
  formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  async analyzeMessages(messages, startDate, endDate, source = 'discord', onProgress = null) {
    console.log(`Analysis source: ${source}`);

    if (!Array.isArray(messages)) {
      throw new Error('Invalid input: messages must be an array');
    }

    const normalizedStartDate = dateUtils.normalizeDate(startDate);
    const normalizedEndDate = dateUtils.normalizeDate(endDate);

    if (isNaN(normalizedStartDate.getTime()) || isNaN(normalizedEndDate.getTime())) {
      throw new Error('Invalid date inputs');
    }

    if (normalizedEndDate < normalizedStartDate) {
      throw new Error('End date must not be earlier than start date');
    }

    console.log(`Number of messages received: ${messages.length}`);

    const groupedWeeks = dateUtils.groupMessagesByWeek(messages, normalizedStartDate, normalizedEndDate);
    console.log(`Number of weeks generated: ${groupedWeeks.length}`);

    if (typeof onProgress === 'function') {
      await onProgress({ stage: 'weeks_detected', totalWeeks: groupedWeeks.length });
    }

    let weeklySummaries = [];

    for (let currentIndex = 0; currentIndex < groupedWeeks.length; currentIndex++) {
      const week = groupedWeeks[currentIndex];

      // Log the selected model before each LLM call
      console.log(`Weekly model selected: ${this.getModel('weekly')}`);

      if (typeof onProgress === 'function') {
        await onProgress({
          stage: 'weekly_processing',
          currentWeek: currentIndex + 1,
          totalWeeks: groupedWeeks.length,
          label: week.range
        });
      }

      const textUtils = require('../utils/textUtils');
      const messageBlock = textUtils.buildPromptMessageBlock(week.messages);
      const prompt = weeklyPrompt(messageBlock, week.range);

      try {
        const summary = await llmService.generateSummary(this.getModel('weekly'), prompt);
        weeklySummaries.push({ range: week.range, summary });
      } catch (error) {
        console.error(`Error generating weekly summary for week ${week.weekNumber}:`, error.message);
        throw new Error('Failed to generate summary');
      }
    }

    const periodLabel = `${this.formatDate(normalizedStartDate)}–${this.formatDate(normalizedEndDate)}`;

    if (weeklySummaries.length > 1) {
      // Log the selected model before each LLM call
      console.log(`Monthly model selected: ${this.getModel('monthly')}`);

      if (typeof onProgress === 'function') {
        await onProgress({ stage: 'monthly_consolidation' });
      }

      const summariesBlock = weeklySummaries
        .map(w => `## Semana ${w.range}\n${w.summary}`)
        .join('\n\n');

      const monthlyPromptContent = monthlyPrompt(summariesBlock, periodLabel);
      try {
        const monthlySummary = await llmService.generateSummary(this.getModel('monthly'), monthlyPromptContent);

        if (typeof onProgress === 'function') {
          await onProgress({ stage: 'finalizing' });
        }

        return monthlySummary;
      } catch (error) {
        console.error('Error generating monthly summary:', error.message);
        throw new Error('Failed to generate summary');
      }
    } else {
      // Log the selected model before each LLM call
      console.log(`Weekly model selected: ${this.getModel('weekly')}`);

      if (typeof onProgress === 'function') {
        await onProgress({ stage: 'short_consolidation' });
      }

      const summariesBlock = `## Semana ${weeklySummaries[0].range}\n${weeklySummaries[0].summary}`;

      const shortPeriodPromptContent = periodPrompt(summariesBlock, periodLabel);
      try {
        const shortPeriodSummary = await llmService.generateSummary(this.getModel('weekly'), shortPeriodPromptContent);

        if (typeof onProgress === 'function') {
          await onProgress({ stage: 'finalizing' });
        }

        return shortPeriodSummary;
      } catch (error) {
        console.error('Error generating short period summary:', error.message);
        throw new Error('Failed to generate summary');
      }
    }
  }
}

module.exports = new AnalysisService();