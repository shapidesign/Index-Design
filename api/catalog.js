/**
 * Vercel Serverless Function - /api/catalog
 * Proxies a search against the HIT Primo books catalog.
 */

import { applyGuard } from './_guard.js';
import {
  parseCatalogQuery,
  buildPrimoApiUrl,
  buildCatalogSearchUrl,
  mapPrimoResponse,
} from '../src/lib/catalog.js';

export default async function handler(req, res) {
  if (applyGuard(req, res, { methods: 'GET, OPTIONS' })) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const parsed = parseCatalogQuery(req.query || {});
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const catalogUrl = buildCatalogSearchUrl(parsed.q, parsed.offset);

  try {
    const response = await fetch(buildPrimoApiUrl(parsed), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      throw new Error(`Primo responded ${response.status}`);
    }

    const payload = await response.json();
    const mapped = mapPrimoResponse(payload);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({
      ...mapped,
      offset: parsed.offset,
      limit: parsed.limit,
      query: parsed.q,
      catalogUrl,
    });
  } catch (error) {
    console.error('Catalog search failed:', error);
    return res.status(502).json({
      error: 'לא הצלחנו לחפש בקטלוג HIT',
      catalogUrl,
    });
  }
}
