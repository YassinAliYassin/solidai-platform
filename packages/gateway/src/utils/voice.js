const axios = require('axios');
const fs = require('fs');
const path = require('path');

class VoiceManager {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.voiceMap = {
      agriculture: 'pNInz6obpgDQGcFmaJgB', // Adam
      fintech: 'EXAVDx5p6cHra5fGhgBx', // Bella
      health: 'ErXwobaYiN019PkySvjV', // Antoni
      education: 'MF3mGyEYCl7XYWbV9V6O', // Elli
      energy: 'TxGEqnHWrfTf4DxowW1j', // Josh
      governance: 'VR6AewLTigWGpkDt3FqK', // Arnold
      retail: 'yoZ06aMxZJJ28mfd3POQ' // Sam
    };
    this.audioDir = path.join(process.env.HOME, '.solidai', 'audio');
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async generateSpeech(text, sector = 'agriculture') {
    try {
      const voiceId = this.voiceMap[sector] || this.voiceMap.agriculture;
      if (!this.apiKey) {
        console.warn('ElevenLabs: ELEVENLABS_API_KEY not set — TTS disabled');
        return null;
      }

      const response = await axios({
        method: 'post',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        data: {
          text: text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        responseType: 'arraybuffer'
      });

      const filename = `response_${Date.now()}.mp3`;
      const filepath = path.join(this.audioDir, filename);

      fs.writeFileSync(filepath, Buffer.from(response.data));

      return filepath;
    } catch (error) {
      console.error('ElevenLabs TTS error:', error.message);
      if (error.response) {
        console.error('ElevenLabs API error:', error.response.data.toString());
      }
      return null;
    }
  }

  getAudioUrl(filename) {
    return `http://localhost:18789/audio/${filename}`;
  }
}

module.exports = new VoiceManager();
