// Rancang Belanja server: serves public/ and a small JSON API.
// Each profile has its own PIN and its own data. No dependencies (Node built-ins only).
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;   // a session lasts at most 12 hours
const MAX_ATTEMPTS = 5;                        // wrong PINs before a lockout
const LOCKOUT_MS = 5 * 60 * 1000;              // lockout length
const MAX_PROFILES = 6;
const MAX_BODY = 2 * 1024 * 1024;
const COLORS = ['#3A80C2', '#D64545', '#1F9A66', '#C98304', '#7A5AF8', '#D9468F'];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json'
};

// ---------- storage ----------
let db = { profiles: [], users: {}, sessions: {} };
function load() {
  try { db = Object.assign({ profiles: [], users: {}, sessions: {} }, JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))); }
  catch (e) { if (e.code !== 'ENOENT') console.error('Could not read database:', e.message); }
}
function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, DB_FILE);
}
load();

// ---------- PIN + sessions ----------
const validPin = p => typeof p === 'string' && /^\d{4,6}$/.test(p);
const cleanName = n => typeof n === 'string' ? n.trim().replace(/\s+/g, ' ').slice(0, 30) : '';
function hashPin(pin, salt) { return crypto.scryptSync(pin, salt, 32).toString('hex'); }
function checkPin(profile, pin) {
  const a = Buffer.from(hashPin(pin, profile.salt), 'hex'), b = Buffer.from(profile.pinHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function makeProfile(name, pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const used = new Set(db.profiles.map(p => p.color));
  return {
    id: 'p_' + crypto.randomBytes(6).toString('hex'), name, pinLen: pin.length,
    color: COLORS.find(c => !used.has(c)) || COLORS[db.profiles.length % COLORS.length],
    salt, pinHash: hashPin(pin, salt), createdAt: Date.now()
  };
}
const publicProfile = p => ({ id: p.id, name: p.name, color: p.color, pinLen: p.pinLen });
function newSession(pid) {
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = { pid, exp: Date.now() + SESSION_TTL_MS };
  return token;
}
function pruneSessions() {
  const now = Date.now();
  for (const [t, s] of Object.entries(db.sessions)) if (s.exp < now || !db.profiles.some(p => p.id === s.pid)) delete db.sessions[t];
}
function sessionFrom(req) {
  const m = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || '');
  if (!m) return null;
  const s = db.sessions[m[1]];
  if (!s || s.exp < Date.now()) return null;
  const profile = db.profiles.find(p => p.id === s.pid);
  return profile ? { token: m[1], profile } : null;
}

// Wrong-PIN tracking, per profile + client address.
const attempts = new Map();
function lockedFor(key) { const a = attempts.get(key); return a && a.until > Date.now() ? a.until - Date.now() : 0; }
function failed(key) {
  const a = attempts.get(key) || { n: 0, until: 0 };
  a.n += 1;
  if (a.n >= MAX_ATTEMPTS) { a.n = 0; a.until = Date.now() + LOCKOUT_MS; }
  attempts.set(key, a);
  return MAX_ATTEMPTS - a.n;
}

// ---------- http helpers ----------
function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(data);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error('too_large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(Object.assign(new Error('bad_json'), { status: 400 })); } });
    req.on('error', reject);
  });
}
const clientKey = req => (req.socket.remoteAddress || '');

// ---------- API ----------
async function api(req, res, url) {
  const route = req.method + ' ' + url.pathname;

  if (route === 'GET /api/profiles') {
    return send(res, 200, { setupNeeded: db.profiles.length === 0, profiles: db.profiles.map(publicProfile) });
  }

  if (route === 'POST /api/setup') {
    if (db.profiles.length) return send(res, 409, { error: 'already_setup' });
    const body = await readBody(req);
    const list = Array.isArray(body.profiles) ? body.profiles : [];
    if (!list.length || list.length > MAX_PROFILES) return send(res, 400, { error: 'bad_profiles' });
    const made = [];
    for (const p of list) {
      const name = cleanName(p.name);
      if (!name || !validPin(p.pin)) return send(res, 400, { error: 'bad_profiles' });
      made.push(makeProfile(name, p.pin));
      db.profiles.push(made[made.length - 1]);
    }
    save();
    return send(res, 201, { profiles: db.profiles.map(publicProfile) });
  }

  if (route === 'POST /api/login') {
    const body = await readBody(req);
    const profile = db.profiles.find(p => p.id === body.profileId);
    if (!profile) return send(res, 404, { error: 'no_profile' });
    const key = profile.id + '|' + clientKey(req);
    const wait = lockedFor(key);
    if (wait) return send(res, 429, { error: 'locked', retryAfterSec: Math.ceil(wait / 1000) });
    if (!validPin(body.pin) || !checkPin(profile, body.pin)) {
      const left = failed(key);
      const w = lockedFor(key);
      return send(res, w ? 429 : 401, w ? { error: 'locked', retryAfterSec: Math.ceil(w / 1000) } : { error: 'wrong_pin', attemptsLeft: left });
    }
    attempts.delete(key);
    pruneSessions();
    const token = newSession(profile.id);
    save();
    return send(res, 200, { token, profile: publicProfile(profile) });
  }

  // Everything below needs a session.
  const s = sessionFrom(req);
  if (!s) return send(res, 401, { error: 'unauthorized' });
  const me = s.profile;

  if (route === 'POST /api/logout') { delete db.sessions[s.token]; save(); return send(res, 200, { ok: true }); }

  if (route === 'GET /api/me') return send(res, 200, { profile: publicProfile(me) });

  if (route === 'GET /api/data') {
    const d = db.users[me.id] || { items: [], profile: {} };
    return send(res, 200, { items: d.items || [], profile: d.profile || {}, updatedAt: d.updatedAt || 0 });
  }

  if (route === 'PUT /api/data') {
    const body = await readBody(req);
    if (!Array.isArray(body.items) || body.items.length > 10000 || typeof body.profile !== 'object' || !body.profile) return send(res, 400, { error: 'bad_data' });
    db.users[me.id] = { items: body.items, profile: body.profile, updatedAt: Date.now() };
    save();
    return send(res, 200, { ok: true, updatedAt: db.users[me.id].updatedAt });
  }

  if (route === 'PATCH /api/me') {
    const body = await readBody(req);
    const name = cleanName(body.name);
    if (!name) return send(res, 400, { error: 'bad_name' });
    me.name = name; save();
    return send(res, 200, { profile: publicProfile(me) });
  }

  if (route === 'POST /api/me/pin') {
    const body = await readBody(req);
    if (!validPin(body.current) || !checkPin(me, body.current)) return send(res, 403, { error: 'wrong_pin' });
    if (!validPin(body.next)) return send(res, 400, { error: 'bad_pin' });
    me.salt = crypto.randomBytes(16).toString('hex');
    me.pinHash = hashPin(body.next, me.salt);
    me.pinLen = body.next.length;
    // Sign out other devices of this profile.
    for (const [t, x] of Object.entries(db.sessions)) if (x.pid === me.id && t !== s.token) delete db.sessions[t];
    save();
    return send(res, 200, { profile: publicProfile(me) });
  }

  if (route === 'POST /api/profiles') {
    if (db.profiles.length >= MAX_PROFILES) return send(res, 409, { error: 'too_many' });
    const body = await readBody(req);
    const name = cleanName(body.name);
    if (!name || !validPin(body.pin)) return send(res, 400, { error: 'bad_profile' });
    const p = makeProfile(name, body.pin);
    db.profiles.push(p); save();
    return send(res, 201, { profile: publicProfile(p) });
  }

  return send(res, 404, { error: 'not_found' });
}

// ---------- static files ----------
function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) file = path.join(PUBLIC_DIR, 'index.html');
    fs.readFile(file, (e, buf) => {
      if (e) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : buf);
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else serveStatic(req, res, url);
  } catch (e) {
    if (!res.headersSent) send(res, e.status || 500, { error: e.status ? e.message : 'server_error' });
    if (!e.status) console.error(e);
  }
});
server.listen(PORT, () => console.log(`Rancang Belanja listening on :${PORT}, data in ${DB_FILE}`));
