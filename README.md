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

---

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
