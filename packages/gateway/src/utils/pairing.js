const fs = require('fs');
const path = require('path');

const PAIRING_FILE = path.join(process.env.HOME, '.solidai', 'pairing.json');

class PairingManager {
  constructor() {
    this.pairingData = this.loadPairingData();
  }

  loadPairingData() {
    try {
      return JSON.parse(fs.readFileSync(PAIRING_FILE, 'utf8'));
    } catch (err) {
      return { pending: {}, approved: {} };
    }
  }

  savePairingData() {
    fs.writeFileSync(PAIRING_FILE, JSON.stringify(this.pairingData, null, 2));
  }

  generatePairingCode(channel, userId) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.pairingData.pending[code] = { channel, userId, timestamp: Date.now() };
    this.savePairingData();
    return code;
  }

  approvePairing(code) {
    const pending = this.pairingData.pending[code];
    if (!pending) return false;

    const { channel, userId } = pending;
    if (!this.pairingData.approved[channel]) {
      this.pairingData.approved[channel] = [];
    }
    if (!this.pairingData.approved[channel].includes(userId)) {
      this.pairingData.approved[channel].push(userId);
    }

    delete this.pairingData.pending[code];
    this.savePairingData();
    return true;
  }

  isApproved(channel, userId) {
    return this.pairingData.approved[channel]?.includes(userId) || false;
  }
}

module.exports = new PairingManager();