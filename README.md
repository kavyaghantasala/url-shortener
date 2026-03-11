# 🔗 SNIP — URL Shortener

> Week 1 · Backend Engineering · Real World Problem

**Live Demo:** https://url-shortener-xi-eight.vercel.app

**GitHub:** https://github.com/kavyaghantasala/url-shortener

---

## 📌 Problem Statement

Build a URL shortening service that accepts long URLs, generates unique short codes, redirects users, and tracks click analytics.

---

## ✅ Subtasks Completed

### Subtask 1 — URL Shortening
- `POST /api/shorten` accepts a long URL and returns a unique 7-character short code
- Validates that the URL is a valid `http://` or `https://` URL
- Stores the mapping in JSONBin (free cloud storage)

### Subtask 2 — URL Redirection
- `GET /:code` redirects the user to the original URL using **HTTP 301**
- Returns **HTTP 404** if the short code does not exist

### Subtask 3 — Click Analytics
- Click count increments on every successful redirect
- `GET /api/stats/:code` returns total click count for any short code
- Live click counter displayed on the website with auto-refresh every 5 seconds

### Subtask 4 — URL Expiration

Users can set an optional expiration time when creating a short URL
Expiry options: 5 minutes, 30 minutes, 1 hour, 1 day, 1 week, or Never
Expiration timestamp is stored alongside each URL entry
If a URL has expired, returns HTTP 410 Gone instead of redirecting
Expiry time is displayed on the website for each shortened link
---
### Subtask 5 — Rate Limiting

Limits each IP to 10 requests per minute on POST /api/shorten
Tracks request count and time window per IP stored in JSONBin
Returns HTTP 429 Too Many Requests when limit is exceeded with a retryAfter message
Rate limit headers returned on every request:

X-RateLimit-Limit — max allowed requests
X-RateLimit-Remaining — requests left in current window
X-RateLimit-Reset — seconds until window resets


Website shows remaining requests after each shorten
Displays ⛔ Rate limit reached! error when limit is hit
## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shorten` | Shorten a long URL |
| GET | `/:code` | Redirect to original URL (301) |
| GET | `/api/stats/:code` | Get click analytics |
| GET | `/api/all` | List all shortened URLs |

---

## 🧪 Test the API

**Shorten a URL:**
```powershell
Invoke-WebRequest -Uri "https://url-shortener-xi-eight.vercel.app/api/shorten" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body '{"url":"https://google.com"}' `
  -UseBasicParsing
```

**Check click stats:**
```
https://url-shortener-xi-eight.vercel.app/api/stats/YOURCODE
```

**Test 404:**
```
https://url-shortener-xi-eight.vercel.app/fakecode123
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js Serverless Functions |
| Hosting | Vercel |
| Database | JSONBin.io (free) |

---

## 📁 Project Structure

```
├── index.html          # Frontend UI
├── vercel.json         # Route configuration
├── package.json
└── api/
    ├── shorten.js      # POST /api/shorten
    ├── redirect.js     # GET /:code
    ├── stats.js        # GET /api/stats/:code
    └── all.js          # GET /api/all
```
