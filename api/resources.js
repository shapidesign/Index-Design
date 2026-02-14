/**
 * Vercel Serverless Function - /api/resources
 * Fetches all resources from Notion "אתרי עיצוב" data source
 * Uses official Notion API client
 */

import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
// Support multiple variable names for the main resources database
const DATABASE_ID = process.env.NOTION_DATASOURCE_ID || process.env.NOTION_RESOURCES_DB || process.env.NOTION_DATABASE_ID;

const notion = new Client({
  auth: NOTION_API_KEY,
});

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
 * Fetch all pages from the database (handles pagination)
 */
async function fetchAllPages() {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  // Helper to query with fallback
  const queryNotion = async (cursor) => {
    // Try databases.query first (standard integration)
    try {
      console.log('Trying notion.databases.query...');
      return await notion.databases.query({
        database_id: DATABASE_ID,
        page_size: 100,
        start_cursor: cursor,
      });
    } catch (dbError) {
      console.warn('notion.databases.query failed:', dbError.message);
      
      // If that fails, try dataSources.query (for Data Source IDs)
      try {
        console.log('Falling back to notion.dataSources.query...');
        return await notion.dataSources.query({
          data_source_id: DATABASE_ID,
          page_size: 100,
          start_cursor: cursor,
        });
      } catch (dsError) {
        console.error('notion.dataSources.query also failed:', dsError.message);
        // Throw the original error or a combined one
        throw new Error(`Failed to query Notion. Databases error: ${dbError.message}. DataSources error: ${dsError.message}`);
      }
    }
  };

  while (hasMore) {
    try {
      const response = await queryNotion(startCursor);

      allPages.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    } catch (error) {
      console.error('Error querying Notion:', error);
      throw error;
    }
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
    // Debug logging for environment variables
    console.log('Env Check - NOTION_API_KEY exists:', !!NOTION_API_KEY);
    console.log('Env Check - DATABASE_ID exists:', !!DATABASE_ID);
    console.log('Env Check - NOTION_DATASOURCE_ID exists:', !!process.env.NOTION_DATASOURCE_ID);
    console.log('Env Check - NOTION_RESOURCES_DB exists:', !!process.env.NOTION_RESOURCES_DB);
    console.log('Env Check - NOTION_DATABASE_ID exists:', !!process.env.NOTION_DATABASE_ID);

    if (!NOTION_API_KEY) {
      throw new Error('Configuration Error: NOTION_API_KEY is missing from environment variables.');
    }

    if (!DATABASE_ID) {
      throw new Error('Configuration Error: No database ID found. Please set NOTION_DATASOURCE_ID, NOTION_RESOURCES_DB, or NOTION_DATABASE_ID.');
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
      details: error.body || undefined
    });
  }
}
