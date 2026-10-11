const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const PAIRING_PATH = require.resolve('../src/utils/pairing');

function loadPairing() {
  delete require.cache[PAIRING_PATH];
  return require('../src/utils/pairing');
}

function withState(env, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'solidai-pairing-'));
  const previous = {
    SOLIDAI_STATE_DIR: process.env.SOLIDAI_STATE_DIR,
    OWNER_TELEGRAM_ID: process.env.OWNER_TELEGRAM_ID,
  };
  process.env.SOLIDAI_STATE_DIR = dir;
  if (Object.prototype.hasOwnProperty.call(env, 'OWNER_TELEGRAM_ID')) {
    if (env.OWNER_TELEGRAM_ID == null) delete process.env.OWNER_TELEGRAM_ID;
    else process.env.OWNER_TELEGRAM_ID = env.OWNER_TELEGRAM_ID;
  }
  try {
    return fn(loadPairing(), dir);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value == null) delete process.env[key];
      else process.env[key] = value;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('missing OWNER_TELEGRAM_ID approves nobody, including the old hardcoded id', () => {
  withState({ OWNER_TELEGRAM_ID: null }, (pairing) => {
    assert.match(pairing.ownerConfigurationError(), /not set/);
    assert.equal(pairing.resolveOwnerId(), null);
    assert.equal(pairing.approvePairing('123456', '1292960246'), false);
    assert.equal(pairing.approvePairing('123456', '1'), false);
  });
});

test('non-numeric OWNER_TELEGRAM_ID is treated as no approver', () => {
  withState({ OWNER_TELEGRAM_ID: 'not-an-id' }, (pairing) => {
    assert.match(pairing.ownerConfigurationError(), /numeric/);
    assert.equal(pairing.approvePairing('123456', 'not-an-id'), false);
  });
});

test('only the configured owner id can approve a pairing code', () => {
  withState({ OWNER_TELEGRAM_ID: '424242' }, (pairing) => {
    assert.equal(pairing.ownerConfigurationError(), null);
    const code = pairing.generatePairingCode('telegram', 'user-1');
    assert.equal(pairing.approvePairing(code, '1292960246'), false);
    assert.equal(pairing.isApproved('telegram', 'user-1'), false);
    assert.equal(pairing.approvePairing(code, '424242'), true);
    assert.equal(pairing.isApproved('telegram', 'user-1'), true);
  });
});
