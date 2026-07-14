const fs = require('fs');
const path = require('path');

const PAIRING_FILE = path.join(process.env.HOME, '.solidai', 'pairing.json');

// Admin user who is allowed to approve pairing codes.
const OWNER_ID = parseInt(process.env.OWNER_TELEGRAM_ID || '1292960246', 10);

// Pairing code lifetime (ms). Codes older than this are rejected.
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Per-user rate limit on requesting new pairing codes.
const RATE_LIMIT_MS = 60 * 1000; // at most one code per minute per user
const rateState = {}; // userId -> last issued timestamp

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
    // Rate-limit: prevent code-spamming / brute-force enumeration of approvals.
    const now = Date.now();
    const last = rateState[userId] || 0;
    if (now - last < RATE_LIMIT_MS) {
      const retryAfter = Math.ceil((RATE_LIMIT_MS - (now - last)) / 1000);
      const err = new Error('RATE_LIMITED');
      err.retryAfter = retryAfter;
      throw err;
    }
    rateState[userId] = now;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.pairingData.pending[code] = { channel, userId, timestamp: now };
    this.savePairingData();
    return code;
  }

  // Only an admin (OWNER_ID) may approve. `approverId` is the Telegram user id
  // of whoever issued /approve (or the admin's id for the HTTP endpoint).
  approvePairing(code, approverId) {
    if (parseInt(approverId, 10) !== OWNER_ID) {
      return false; // not authorized to approve
    }

    const pending = this.pairingData.pending[code];
    if (!pending) return false;

    // Reject expired codes.
    if (Date.now() - pending.timestamp > CODE_TTL_MS) {
      delete this.pairingData.pending[code];
      this.savePairingData();
      return false;
    }

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
