/**
 * Vercel Serverless Function - /api/resources
 * Fetches all resources from Notion "אתרי עיצוב" data source
 * Uses Notion API v2025-09-03 with data sources
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATASOURCE_ID = process.env.NOTION_DATASOURCE_ID;
const NOTION_VERSION = '2025-09-03';
const NOTION_BASE = 'https://api.notion.com/v1';

/**
 * Transform a Notion page into a clean resource object
 */
function transformResource(page) {
  const props = page.properties || {};

  // שם (Name) - title
  const name =
    props['שם']?.title?.[0]?.plain_text || '';

  // תיאור (Description) - rich_text
  const description =
    props['תיאור']?.rich_text?.[0]?.plain_text || '';

  // סוג (Type) - multi_select
  const types =
    props['סוג']?.multi_select?.map((s) => s.name) || [];

  // תגיות (Tags) - multi_select
  const tags =
    props['תגיות']?.multi_select?.map((t) => t.name) || [];

  // קישור (Link) - url type
  const link = props['קישור']?.url || '';

  // חינם/תשלום (Free/Paid) - select
  const pricing =
    props['חינם/תשלום']?.select?.name || '';

  // תמונה (Image) - files & media
  const image =
    props['תמונה']?.files?.[0]?.file?.url ||
    props['תמונה']?.files?.[0]?.external?.url ||
    '';

  return {
    id: page.id,
    name,
    description,
    types,
    tags,
    link,
    pricing,
    image,
  };
}

/**
 * Fetch all pages from the data source (handles pagination)
 */
async function fetchAllPages() {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const body = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;

    const response = await fetch(
      `${NOTION_BASE}/data_sources/${DATASOURCE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Notion API error: ${error.message || response.status}`);
    }

    const data = await response.json();
    allPages.push(...data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  return allPages;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!NOTION_API_KEY || !DATASOURCE_ID) {
      throw new Error('Missing Notion configuration (NOTION_API_KEY or NOTION_DATASOURCE_ID)');
    }

    const pages = await fetchAllPages();
    const resources = pages
      .map(transformResource)
      .filter((r) => r.name); // Filter out empty entries

    // Optional: filter by category/tag via query params
    const { category, tag, q } = req.query || {};
    let filtered = resources;

    if (category) {
      filtered = filtered.filter((r) =>
        r.types.some((t) => t.includes(category))
      );
    }

    if (tag) {
      filtered = filtered.filter((r) =>
        r.tags.some((t) => t.includes(tag))
      );
    }

    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    return res.status(200).json({
      results: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return res.status(500).json({
      error: 'שגיאה בטעינת המשאבים',
      message: error.message,
    });
  }
}
