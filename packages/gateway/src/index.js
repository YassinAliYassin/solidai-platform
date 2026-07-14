const express = require('express');
const https = require('https');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
console.log('Loaded .env, ELEVENLABS_API_KEY starts with:', process.env.ELEVENLABS_API_KEY ? process.env.ELEVENLABS_API_KEY.substring(0, 10) + '...' : 'undefined');

const pairing = require('./utils/pairing');
const voiceManager = require('./utils/voice');
const app = express();
app.use(express.json());

// Serve static audio files
app.use('/audio', express.static(path.join(process.env.HOME, '.solidai', 'audio')));

// Load config
const configPath = path.join(process.env.HOME, '.solidai', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Load sector agents
const agents = {};
config.sectorAgents.forEach(sector => {
  try {
    const AgentClass = require(`./agents/${sector.charAt(0).toUpperCase() + sector.slice(1)}Agent`);
    agents[sector] = new AgentClass(config);
    console.log(`Loaded ${sector} agent`);
  } catch (err) {
    console.error(`Failed to load ${sector} agent:`, err.message);
  }
});

// Load channels
const channels = {};
try {
  const TelegramChannel = require('./channels/TelegramChannel');
  channels.telegram = new TelegramChannel();
  channels.telegram.setAgents(agents);
  console.log('Loaded Telegram channel');
} catch (err) {
  console.error('Failed to load Telegram channel:', err.message);
}

try {
  const WebChatChannel = require('./channels/WebChatChannel');
  channels.webchat = new WebChatChannel(app, agents);
  console.log('Loaded WebChat channel');
} catch (err) {
  console.error('Failed to load WebChat channel:', err.message);
}

// Status dashboard
app.get('/status', (req, res) => {
  const status = {
    gateway: 'online',
    uptime: process.uptime(),
    agents: Object.keys(agents).map(sector => ({
      name: sector,
      status: 'loaded',
      hasApiKey: !!config.agent.openrouterApiKey && config.agent.openrouterApiKey !== 'YOUR_OPENROUTER_KEY'
    })),
    channels: Object.keys(channels).map(channel => ({
      name: channel,
      status: 'loaded'
    })),
    features: {
      dmPairing: true,
      voiceTTS: !!process.env.ELEVENLABS_API_KEY,
      webChat: !!channels.webchat,
      telegramBot: !!channels.telegram
    },
    issues: [
      !config.agent.openrouterApiKey || config.agent.openrouterApiKey === 'YOUR_OPENROUTER_KEY' ? 'OpenRouter API key not configured' : null,
      !process.env.ELEVENLABS_API_KEY ? 'ElevenLabs API key not set' : null
    ].filter(Boolean)
  };
  res.json(status);
});

// Health check
app.get('/health', (req, res) => res.json({ 
  status: 'ok', 
  sectorAgents: Object.keys(agents),
  channels: Object.keys(channels)
}));

// Voice endpoint
app.post('/voice', async (req, res) => {
  const { text, sector } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }
  
  try {
    const filepath = await voiceManager.generateSpeech(text, sector || 'agriculture');
    if (!filepath) {
      return res.status(500).json({ error: 'Voice generation failed' });
    }
    const filename = path.basename(filepath);
    res.json({ 
      audioUrl: voiceManager.getAudioUrl(filename),
      filename 
    });
  } catch (err) {
    res.status(500).json({ error: 'Voice generation error' });
  }
});

// Query endpoint
app.post('/query', async (req, res) => {
  const { sector, query, userId } = req.body;  
  if (!agents[sector]) {
    return res.status(400).json({ error: `Unknown sector: ${sector}` });
  }
  
  try {
    const result = await agents[sector].handleQuery(query, userId || 'anonymous');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Agent processing failed' });
  }
});

// Pairing approval endpoint (admin only)
app.post('/pairing/approve', (req, res) => {
  // Require the admin secret header — this endpoint was previously open to anyone
  // who could reach the gateway port.
  const adminSecret = req.get('X-Admin-Secret') || req.body.adminSecret;
  if (!adminSecret || adminSecret !== process.env.PAIRING_ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  const success = pairing.approvePairing(code, process.env.OWNER_TELEGRAM_ID || '1292960246');
  if (success) {
    res.json({ status: 'approved' });
  } else {
    res.status(400).json({ error: 'Invalid or expired pairing code' });
  }
});

// Serve Solid Solutions website (static files)
const solidSolutionsDist = path.join(__dirname, '../../Solid-Solutions');
app.use(express.static(solidSolutionsDist));

// SPA fallback for Solid Solutions website
app.use((req, res, next) => {
  // Only fallback for GET requests that aren't API endpoints
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/telegram') && !req.path.startsWith('/query') && !req.path.startsWith('/voice') && !req.path.startsWith('/pairing') && !req.path.startsWith('/status') && !req.path.startsWith('/health') && !req.path.startsWith('/webchat')) {
    const indexPath = path.join(solidSolutionsDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Start gateway
const port = config.gateway.port || 18789;
app.listen(port, () => {
  console.log(`SolidAI Gateway running on port ${port}`);
  console.log(`Active agents: ${Object.keys(agents).join(', ')}`);
  console.log(`Active channels: ${Object.keys(channels).join(', ')}`);
  console.log(`Serving Solid Solutions website from ${solidSolutionsDist}`);
});

// Telegram webhook endpoint
app.post('/telegram-webhook', (req, res) => {
  console.log('Received Telegram webhook update:', req.body.update_id);
  if (channels.telegram && channels.telegram.handleUpdate) {
    channels.telegram.handleUpdate(req.body);
  }
  res.sendStatus(200);
});