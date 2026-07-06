const axios = require('axios');

class RetailAgent {
  constructor(config) {
    this.name = 'retail';
    this.model = config.agent.model;
    this.apiKey = config.agent.openrouterApiKey;
    this.systemPrompt = `You are an expert in African retail and e-commerce. Advise on supply chain, market access, digital storefronts, and supporting small retailers across Africa.`;
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
        response: 'Sorry, I encountered an error processing your retail query.',
        userId
      };
    }
  }
}

module.exports = RetailAgent;