const axios = require('axios');

class HealthAgent {
  constructor(config) {
    this.name = 'health';
    this.model = config.agent.model;
    this.apiKey = config.agent.openrouterApiKey;
    this.systemPrompt = `You are an expert in African healthcare. Provide advice on public health, disease prevention, maternal care, and affordable healthcare solutions for African communities.`;
  }

  async handleQuery(query, userId) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: this.model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: query }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return {
        sector: this.name,
        response: response.data.choices[0].message.content,
        userId
      };
    } catch (error) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      return {
        sector: this.name,
        response: 'Sorry, I encountered an error processing your health query.',
        userId
      };
    }
  }
}

module.exports = HealthAgent;