const TelegramBot = require('node-telegram-bot-api');
const pairing = require('../utils/pairing');
const fs = require('fs');
const path = require('path');

class TelegramChannel {
  constructor() {
    this.token = '__REDACTED_TELEGRAM_BOT_TOKEN__'; // From memory (user: YassinAliYassin)
    this.bot = new TelegramBot(this.token); // No polling
    this.sectorAgents = {}; // Loaded from gateway
    this.userSectors = {}; // Track user's current sector
    this.setupHandlers();
  }

  handleUpdate(update) {
    this.bot.processUpdate(update);
  }

  setAgents(agents) {
    this.sectorAgents = agents;
  }

  setupHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      
      if (!pairing.isApproved('telegram', userId)) {
        const code = pairing.generatePairingCode('telegram', userId);
        this.bot.sendMessage(chatId, `Welcome to SolidAI! Your pairing code is: ${code}\nAsk admin to approve with /approve ${code}`);
        return;
      }
      
      this.bot.sendMessage(chatId, 'Welcome to SolidAI! Use /sector [name] to choose a sector (agriculture, fintech, health, etc.)');
    });

    // Handle /approve command
    this.bot.onText(/\/approve (.+)/, (msg, match) => {
      const code = match[1];
      if (pairing.approvePairing(code)) {
        this.bot.sendMessage(msg.chat.id, 'Pairing approved! You can now use SolidAI.');
      } else {
        this.bot.sendMessage(msg.chat.id, 'Invalid pairing code.');
      }
    });

    // Handle /sector command
    this.bot.onText(/\/sector (.+)/, (msg, match) => {
      const sector = match[1].toLowerCase();
      const userId = msg.from.id.toString();
      
      if (!pairing.isApproved('telegram', userId)) {
        this.bot.sendMessage(msg.chat.id, 'Please pair first with /start');
        return;
      }
      
      if (!this.sectorAgents[sector]) {
        this.bot.sendMessage(msg.chat.id, `Unknown sector: ${sector}. Choose from: ${Object.keys(this.sectorAgents).join(', ')}`);
        return;
      }
      
      this.userSectors[userId] = sector;
      this.bot.sendMessage(msg.chat.id, `Switched to ${sector} sector. Ask your question!`);
    });

    // Handle text messages
    this.bot.on('message', async (msg) => {
      const userId = msg.from.id.toString();
      const chatId = msg.chat.id;
      const text = msg.text;
      
      // Skip commands
      if (text.startsWith('/')) return;
      
      if (!pairing.isApproved('telegram', userId)) {
        this.bot.sendMessage(chatId, 'Please pair first with /start');
        return;
      }
      
      const sector = this.userSectors[userId] || 'agriculture'; // Default to agriculture
      const agent = this.sectorAgents[sector];
      
      if (!agent) {
        this.bot.sendMessage(chatId, `No agent for sector: ${sector}`);
        return;
      }
      
      try {
        const result = await agent.handleQuery(text, userId);
        this.bot.sendMessage(chatId, result.response);
      } catch (err) {
        this.bot.sendMessage(chatId, 'Error processing your query.');
      }
    });
  }
}

module.exports = TelegramChannel;