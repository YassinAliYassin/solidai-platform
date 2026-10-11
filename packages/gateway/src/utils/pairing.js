const fs = require('fs');
const os = require('os');
const path = require('path');

// Pairing code lifetime (ms). Codes older than this are rejected.
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Per-user rate limit on requesting new pairing codes.
const RATE_LIMIT_MS = 60 * 1000; // at most one code per minute per user
const rateState = {}; // userId -> last issued timestamp

function stateDir() {
  if (process.env.SOLIDAI_STATE_DIR) return process.env.SOLIDAI_STATE_DIR;
  return path.join(process.env.HOME || os.tmpdir(), '.solidai');
}

function pairingFile() {
  return path.join(stateDir(), 'pairing.json');
}

// Numeric Telegram user id, or null when unset or not a plain integer.
// There is no built-in default approver.
function resolveOwnerId(env = process.env) {
  const raw = env.OWNER_TELEGRAM_ID;
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!/^[1-9][0-9]*$/.test(value)) return null;
  return value;
}

function ownerConfigurationError(env = process.env) {
  const raw = env.OWNER_TELEGRAM_ID;
  if (raw == null || String(raw).trim() === '') {
    return 'OWNER_TELEGRAM_ID is not set. Pairing approval is disabled; no default approver is configured.';
  }
  if (!resolveOwnerId(env)) {
    return 'OWNER_TELEGRAM_ID must be a numeric Telegram user id. Pairing approval is disabled.';
  }
  return null;
}

class PairingManager {
  constructor() {
    this.pairingData = this.loadPairingData();
  }

  loadPairingData() {
    try {
      return JSON.parse(fs.readFileSync(pairingFile(), 'utf8'));
    } catch (err) {
      return { pending: {}, approved: {} };
    }
  }

  savePairingData() {
    const file = pairingFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(this.pairingData, null, 2));
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

  // Only the configured owner may approve. `approverId` is the Telegram user id
  // of whoever issued /approve (or OWNER_TELEGRAM_ID for the HTTP endpoint,
  // which has already checked PAIRING_ADMIN_SECRET).
  approvePairing(code, approverId) {
    const ownerId = resolveOwnerId();
    if (!ownerId) return false;
    if (String(approverId == null ? '' : approverId).trim() !== ownerId) {
      return false;
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

const pairing = new PairingManager();
pairing.resolveOwnerId = resolveOwnerId;
pairing.ownerConfigurationError = ownerConfigurationError;
pairing.PairingManager = PairingManager;

module.exports = pairing;
