// Resets a profile's PIN when it has been forgotten. Run while the app is stopped:
//   docker compose stop
//   docker compose run --rm web node reset-pin.js "Mak" 1234
//   docker compose start
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(process.env.DATA_DIR || path.join(__dirname, 'data'), 'db.json');
const [name, pin] = process.argv.slice(2);

if (!name || !/^\d{4,6}$/.test(pin || '')) {
  console.error('Usage: node reset-pin.js "<profile name>" <new PIN, 4-6 digits>');
  process.exit(1);
}
let db;
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
catch (e) { console.error('Cannot read ' + DB_FILE + ': ' + e.message); process.exit(1); }

const profile = (db.profiles || []).find(p => p.name.toLowerCase() === name.toLowerCase());
if (!profile) {
  console.error('No profile named "' + name + '". Profiles: ' + (db.profiles || []).map(p => p.name).join(', '));
  process.exit(1);
}
profile.salt = crypto.randomBytes(16).toString('hex');
profile.pinHash = crypto.scryptSync(pin, profile.salt, 32).toString('hex');
profile.pinLen = pin.length;
for (const [t, s] of Object.entries(db.sessions || {})) if (s.pid === profile.id) delete db.sessions[t];
fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db));
fs.renameSync(DB_FILE + '.tmp', DB_FILE);
console.log('PIN for "' + profile.name + '" has been reset. Their other sessions were signed out.');
