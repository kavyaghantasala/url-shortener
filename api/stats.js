export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // req.url will be like /api/stats/ABC1234
  // Extract last segment as the code
  const segments = req.url.split('/').filter(Boolean);
  const code = segments[segments.length - 1];

  if (!code || code === 'stats') {
    return res.status(400).json({ error: 'No short code provided.' });
  }

  const apiKey = process.env.JSONBIN_API_KEY;
  const binId  = process.env.JSONBIN_BIN_ID;
  if (!apiKey || !binId) return res.status(500).json({ error: 'Server not configured.' });

  const r = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Master-Key': apiKey }
  });
  const j = await r.json();
  const entry = (j.record || {})[code];

  if (!entry) return res.status(404).json({ error: `Short code "${code}" not found.` });

  return res.status(200).json({
    shortCode: code,
    originalUrl: entry.originalUrl,
    createdAt: entry.createdAt,
    clicks: entry.clicks || 0
  });
}
