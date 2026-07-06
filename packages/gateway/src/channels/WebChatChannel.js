const express = require('express');
const path = require('path');

class WebChatChannel {
  constructor(gatewayApp, agents) {
    this.router = express.Router();
    this.agents = agents;
    this.userSectors = {}; // Track user's current sector
    this.setupRoutes();
    gatewayApp.use('/webchat', this.router);
    console.log('Loaded WebChat channel');
  }

  setupRoutes() {
    // Serve chat UI
    this.router.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>SolidAI Web Chat</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Inter, sans-serif; background: #0a0a0f; color: #fff; margin: 0; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .sector-select { margin-bottom: 20px; }
            select { background: #1a1a2e; color: #fff; padding: 10px; border: 1px solid #2a2a4e; border-radius: 8px; }
            .chat-box { background: #1a1a2e; border-radius: 12px; padding: 20px; height: 400px; overflow-y: auto; margin-bottom: 20px; }
            .message { margin-bottom: 10px; padding: 10px; border-radius: 8px; }
            .user { background: #2a2a4e; text-align: right; }
            .bot { background: #16213e; }
            .input-area { display: flex; gap: 10px; }
            input { flex: 1; padding: 10px; background: #1a1a2e; border: 1px solid #2a2a4e; border-radius: 8px; color: #fff; }
            button { padding: 10px 20px; background: #4a90e2; border: none; border-radius: 8px; color: #fff; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>🤖 SolidAI Web Chat</h1></div>
            <div class="sector-select">
              Sector: <select id="sector" onchange="changeSector()">
                ${Object.keys(this.agents).map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="chat-box" id="chatBox"></div>
            <div class="input-area">
              <input type="text" id="messageInput" placeholder="Ask SolidAI..." onkeypress="if(event.key==='Enter') sendMessage()">
              <button onclick="sendMessage()">Send</button>
            </div>
          </div>
          <script>
            let currentSector = '${Object.keys(this.agents)[0] || 'agriculture'}';
            function changeSector() { currentSector = document.getElementById('sector').value; }
            function addMessage(text, sender) {
              const chatBox = document.getElementById('chatBox');
              chatBox.innerHTML += '<div class="message ' + sender + '">' + text + '</div>';
              chatBox.scrollTop = chatBox.scrollHeight;
            }
            async function sendMessage() {
              const input = document.getElementById('messageInput');
              const text = input.value.trim();
              if (!text) return;
              addMessage(text, 'user');
              input.value = '';
              const res = await fetch('/webchat/api', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sector: currentSector, query: text, userId: 'web-user'})
              });
              const data = await res.json();
              addMessage(data.response || 'Error', 'bot');
            }
          </script>
        </body>
        </html>
      `);
    });

    // API endpoint for web chat
    this.router.post('/api', async (req, res) => {
      const { sector, query, userId } = req.body;
      if (!this.agents[sector]) {
        return res.status(400).json({ error: `Unknown sector: ${sector}` });
      }
      try {
        const result = await this.agents[sector].handleQuery(query, userId || 'web-user');
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: 'Agent processing failed' });
      }
    });
  }
}

module.exports = WebChatChannel;