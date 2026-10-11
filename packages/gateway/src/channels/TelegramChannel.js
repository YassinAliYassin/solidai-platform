const { Bot } = require('node-telegram-bot-api');
const pairing = require('../utils/pairing');

class TelegramChannel {
  constructor() {
    // Token MUST come from the environment, never hardcoded.
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    if (!this.token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set in the environment');
    }
    // Construct only. Polling is not started; updates arrive via the webhook route.
    this.bot = new Bot(this.token);
    this.sectorAgents = {}; // Loaded from gateway
    this.userSectors = {}; // Track user's current sector
    this.setupHandlers();
  }

  handleUpdate(update) {
    return this.bot.handleUpdate(update);
  }

  setAgents(agents) {
    this.sectorAgents = agents;
  }

  setupHandlers() {
    this.bot.command('start', async (ctx) => {
      const userId = ctx.from?.id?.toString();
      if (!userId) return;

      if (!pairing.isApproved('telegram', userId)) {
        try {
          const code = pairing.generatePairingCode('telegram', userId);
          await ctx.reply(`Welcome to SolidAI! Your pairing code is: ${code}\nAsk admin to approve with /approve ${code}`);
        } catch (err) {
          if (err.message === 'RATE_LIMITED') {
            await ctx.reply(`Please wait ${err.retryAfter}s before requesting a new code.`);
          } else {
            await ctx.reply('Could not generate a pairing code. Try again later.');
          }
        }
        return;
      }

      await ctx.reply('Welcome to SolidAI! Use /sector [name] to choose a sector (agriculture, fintech, health, etc.)');
    });

    this.bot.command('approve', async (ctx) => {
      const code = typeof ctx.match === 'string' ? ctx.match.trim() : '';
      const approverId = ctx.from?.id?.toString();
      if (!code || !approverId || !pairing.approvePairing(code, approverId)) {
        await ctx.reply('Invalid pairing code or not authorized to approve.');
        return;
      }
      await ctx.reply('Pairing approved! You can now use SolidAI.');
    });

    this.bot.command('sector', async (ctx) => {
      const sector = (typeof ctx.match === 'string' ? ctx.match : '').trim().toLowerCase();
      const userId = ctx.from?.id?.toString();
      if (!userId) return;

      if (!pairing.isApproved('telegram', userId)) {
        await ctx.reply('Please pair first with /start');
        return;
      }

      if (!this.sectorAgents[sector]) {
        await ctx.reply(`Unknown sector: ${sector}. Choose from: ${Object.keys(this.sectorAgents).join(', ')}`);
        return;
      }

      this.userSectors[userId] = sector;
      await ctx.reply(`Switched to ${sector} sector. Ask your question!`);
    });

    this.bot.on('message', async (ctx) => {
      const userId = ctx.from?.id?.toString();
      const text = ctx.message?.text;
      if (!userId || !text || text.startsWith('/')) return;

      if (!pairing.isApproved('telegram', userId)) {
        await ctx.reply('Please pair first with /start');
        return;
      }

      const sector = this.userSectors[userId] || 'agriculture';
      const agent = this.sectorAgents[sector];

      if (!agent) {
        await ctx.reply(`No agent for sector: ${sector}`);
        return;
      }

      try {
        const result = await agent.handleQuery(text, userId);
        await ctx.reply(result.response);
      } catch (err) {
        await ctx.reply('Error processing your query.');
      }
    });
  }
}

module.exports = TelegramChannel;
