const axios = require('axios');

class LogisticsAgent {
  constructor(config) {
    this.name = 'logistics';
    this.model = config.agent.model;
    this.apiKey = config.agent.openrouterApiKey;
    this.systemPrompt = `You are an expert in African logistics and supply chain management. Provide practical advice on transportation, warehousing, last-mile delivery, cross-border trade, and supply chain optimization for businesses in Africa. Focus on cost-effective solutions, infrastructure challenges, and regional integration.`;
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
        response: 'Sorry, I encountered an error processing your logistics query.',
        userId
      };
    }
  }
}

module.exports = LogisticsAgent;
