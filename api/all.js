// GET /api/all — returns all stored URLs

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const apiKey = process.env.JSONBIN_API_KEY;
  const binId  = process.env.JSONBIN_BIN_ID;
  if (!apiKey || !binId) return res.status(500).json({ error: 'Server not configured.' });

  const r = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Master-Key': apiKey }
  });
  const j = await r.json();
  const data = j.record || {};

  const all = Object.entries(data).map(([code, entry]) => ({
    shortCode: code,
    ...entry
  }));

  return res.status(200).json(all);
}
