/**
 * Shared API guard for all /api endpoints.
 *
 * Goal: make casual scraping of the Notion-backed data annoying.
 * NOTE: none of this is bulletproof — Origin/Referer/User-Agent are all
 * spoofable. It's a deterrent that blocks direct API hits, cross-site
 * fetches, common scraping tools and bulk request floods.
 *
 * Files prefixed with "_" in /api are not turned into routes by Vercel,
 * so this is import-only.
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100; // per IP per window (generous for real users)
const rateLimitStore = new Map();

// Tools / libraries that have no business reading this API directly.
const BLOCKED_UA = [
  /curl/i, /wget/i, /libwww/i, /lwp::/i,
  /python-requests/i, /python-urllib/i, /aiohttp/i, /httpx/i, /scrapy/i,
  /go-http-client/i, /okhttp/i, /java\//i, /apache-httpclient/i,
  /node-fetch/i, /axios/i, /got\s*\(/i, /undici/i,
  /postman/i, /insomnia/i, /restsharp/i,
  /headlesschrome/i, /phantomjs/i, /puppeteer/i, /playwright/i, /selenium/i,
  /\bbot\b/i, /spider/i, /crawler/i, /scraper/i, /harvest/i, /scan/i,
];

// Legit crawlers we keep allowing (SEO + link previews).
const ALLOWED_UA = [
  /googlebot/i, /google-inspectiontool/i, /bingbot/i, /slurp/i,
  /duckduckbot/i, /baiduspider/i, /yandex/i, /applebot/i,
  /facebookexternalhit/i, /facebot/i, /twitterbot/i, /linkedinbot/i,
  /whatsapp/i, /telegrambot/i, /discordbot/i, /pinterest/i,
];

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

const isRateLimited = (ip) => {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || [];
  const fresh = record.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  fresh.push(now);
  rateLimitStore.set(ip, fresh);
  // Opportunistic cleanup so the map doesn't grow forever.
  if (rateLimitStore.size > 5000) {
    for (const [key, timestamps] of rateLimitStore) {
      if (!timestamps.some((ts) => now - ts < RATE_LIMIT_WINDOW_MS)) {
        rateLimitStore.delete(key);
      }
    }
  }
  return fresh.length > RATE_LIMIT_MAX_REQUESTS;
};

const hostOf = (value) => {
  if (!value) return null;
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
};

const deny = (res, status, message) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.status(status).json({ error: message });
  return true;
};

/**
 * Apply the guard. Returns true if the request was already answered
 * (blocked or preflight) and the caller should stop.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {{ methods?: string }} [options]
 * @returns {boolean} handled
 */
export function applyGuard(req, res, options = {}) {
  const methods = options.methods || 'GET, POST, OPTIONS';
  const host = (req.headers.host || '').toLowerCase();
  const origin = req.headers.origin;
  const originHost = hostOf(origin);

  // Dynamic, same-origin CORS (no more wildcard *).
  if (origin && originHost === host) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', `https://${host}`);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  const ua = req.headers['user-agent'] || '';

  // Known-good crawlers pass straight through.
  const isAllowedBot = ALLOWED_UA.some((re) => re.test(ua));
  if (!isAllowedBot) {
    // Empty or tool-like User-Agent → blocked.
    if (!ua || BLOCKED_UA.some((re) => re.test(ua))) {
      return deny(res, 403, 'nice try, moron');
    }

    // Must come from our own site: a matching Origin or Referer.
    const refererHost = hostOf(req.headers.referer);
    const fromOrigin = originHost && originHost === host;
    const fromReferer = refererHost && refererHost === host;
    if (!fromOrigin && !fromReferer) {
      // Direct API access (address bar / scripts) or cross-site fetch.
      return deny(res, 403, 'nice try, moron');
    }
  }

  // Flood protection.
  if (isRateLimited(getClientIp(req))) {
    res.setHeader('Retry-After', '60');
    return deny(res, 429, 'nice try, moron');
  }

  return false;
}

export default applyGuard;
