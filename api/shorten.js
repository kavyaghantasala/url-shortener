// SUBTASK 1 + 4 + 5 — URL Shortening with Expiration + Rate Limiting

const RATE_LIMIT = 10;        // max requests
const WINDOW_MS  = 60 * 1000; // per 60 seconds

async function checkRateLimit(ip, apiKey, binId) {
  // Fetch current rate limit data from JSONBin
  let data = {};
  try {
    const r = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Master-Key': apiKey }
    });
    const j = await r.json();
    data = j.record || {};
  } catch { data = {}; }

  const now     = Date.now();
  const key     = `rl_${ip.replace(/[.:]/g, '_')}`;
  const record  = data[key] || { count: 0, windowStart: now };

  // Reset window if expired
  if (now - record.windowStart > WINDOW_MS) {
    record.count       = 0;
    record.windowStart = now;
  }

  record.count++;
  data[key] = record;

  // Save updated rate limit back
  await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey },
    body: JSON.stringify(data)
  });

  return {
    allowed:   record.count <= RATE_LIMIT,
    count:     record.count,
    limit:     RATE_LIMIT,
    remaining: Math.max(0, RATE_LIMIT - record.count),
    resetIn:   Math.ceil((record.windowStart + WINDOW_MS - now) / 1000)
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const apiKey = process.env.JSONBIN_API_KEY;
  const binId  = process.env.JSONBIN_BIN_ID;
  if (!apiKey || !binId) return res.status(500).json({ error: 'Server not configured.' });

  // Get client IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

  // Subtask 5 — Check rate limit
  const rate = await checkRateLimit(ip, apiKey, binId);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit',     rate.limit);
  res.setHeader('X-RateLimit-Remaining', rate.remaining);
  res.setHeader('X-RateLimit-Reset',     rate.resetIn);

  // Constraint 1 — Return 429 if limit exceeded
  if (!rate.allowed) {
    return res.status(429).json({
      error: `Too many requests. Limit is ${RATE_LIMIT} per minute.`,
      retryAfter: `${rate.resetIn} seconds`
    });
  }

  const { url, expiresIn } = req.body || {};
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing "url" field.' });

  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw 0;
  } catch { return res.status(422).json({ error: 'Invalid URL. Must start with http:// or https://' }); }

  // Fetch current URL data
  let data = {};
  try {
    const r = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Master-Key': apiKey }
    });
    const j = await r.json();
    data = j.record || {};
  } catch { data = {}; }

  // Generate unique code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code;
  do {
    code = Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (data[code]);

  const now       = new Date();
  const expiresAt = expiresIn
    ? new Date(now.getTime() + parseInt(expiresIn) * 60 * 1000).toISOString()
    : null;

  data[code] = { originalUrl: trimmed, createdAt: now.toISOString(), expiresAt, clicks: 0 };

  await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey },
    body: JSON.stringify(data)
  });

  const host     = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';

  return res.status(201).json({
    shortCode:  code,
    shortUrl:   `${protocol}://${host}/${code}`,
    originalUrl: trimmed,
    createdAt:  data[code].createdAt,
    expiresAt:  expiresAt || 'Never',
    rateLimit: {
      remaining: rate.remaining,
      resetIn:   `${rate.resetIn} seconds`
    }
  });
}
