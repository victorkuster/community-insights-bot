module.exports = {
  llm: {
    provider: 'ollama'
  },
  providers: {
    ollama: {
      baseUrl: 'http://localhost:11434/api/generate'
    },
    openai: {
      apiKeyEnvVar: 'OPENAI_API_KEY'
    }
  },
  models: {
    ollama: {
      weekly: 'gemma3:12b',
      monthly: 'qwen3:14b'
    },
    openai: {
      weekly: 'gpt-5-nano',
      monthly: 'gpt-5-nano'
    }
  },
  generation: {
    temperature: 0.3,
    top_p: 0.9
  },
  filters: {
    minimumMessageLength: 10
  }
};