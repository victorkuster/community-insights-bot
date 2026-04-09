const axios = require('axios');
const config = require('../config/config');

class LLMService {
  async generateSummary(model, prompt) {
    try {
      if (config.llm.provider === 'ollama') {
        return await this.generateWithOllama(model, prompt);
      } else if (config.llm.provider === 'openai') {
        return await this.generateWithOpenAI(model, prompt);
      } else {
        throw new Error(`Unsupported LLM provider: ${config.llm.provider}`);
      }
    } catch (error) {
      console.error(`LLM API Error (${config.llm.provider}):`, error.message);
      throw new Error('Failed to generate summary');
    }
  }

  async generateWithOllama(model, prompt) {
    const options = {
      model,
      prompt,
      stream: false,
      options: {
        temperature: config.generation.temperature,
        top_p: config.generation.top_p
      }
    };

    const response = await axios.post(config.providers.ollama.baseUrl, options);
    return response.data.response;
  }

  async generateWithOpenAI(model, prompt) {
    const apiKey = process.env[config.providers.openai.apiKeyEnvVar];
    if (!apiKey) {
      throw new Error('Missing OpenAI API key.');
    }

    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model,
      input: prompt,
      temperature: config.generation.temperature,
      top_p: config.generation.top_p
    });

    if (response.output_text && response.output_text.trim() !== '') {
      return response.output_text;
    }

    if (response.output && response.output.length > 0) {
      const assistantMessages = response.output.filter(item => item.role === 'assistant');
      for (const message of assistantMessages) {
        if (message.content && message.content.text && message.content.text.trim() !== '') {
          return message.content.text;
        }
      }
    }

    throw new Error('Empty response from OpenAI.');
  }
}

module.exports = new LLMService();