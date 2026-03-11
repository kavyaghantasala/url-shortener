// SUBTASK 2 + 4 — URL Redirection with Expiration Check

export default async function handler(req, res) {
  const code = req.url.replace(/^\//, '').split('?')[0];

  if (!code || code === 'favicon.ico') return res.status(400).json({ error: 'No short code provided.' });

  const apiKey = process.env.JSONBIN_API_KEY;
  const binId  = process.env.JSONBIN_BIN_ID;
  if (!apiKey || !binId) return res.status(500).json({ error: 'Server not configured.' });

  const r = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Master-Key': apiKey }
  });
  const j = await r.json();
  const data = j.record || {};
  const entry = data[code];

  // Subtask 2 — 404 if not found
  if (!entry) return res.status(404).json({ error: `Short code "${code}" not found.` });

  // Subtask 4 — Constraint 1 & 2: Check expiration timestamp
  if (entry.expiresAt && new Date() > new Date(entry.expiresAt)) {
    return res.status(410).json({
      error: 'This URL has expired and is no longer available.',
      expiredAt: entry.expiresAt
    });
  }

  // Subtask 3 — Increment click count
  entry.clicks = (entry.clicks || 0) + 1;
  data[code] = entry;
  await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey },
    body: JSON.stringify(data)
  });

  // Subtask 2 — 301 redirect
  return res.redirect(301, entry.originalUrl);
}
