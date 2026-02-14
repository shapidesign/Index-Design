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
    props['שם']?.title?.[0]?.plain_text || 
    props['Title']?.title?.[0]?.plain_text || 
    '';

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
    // 1. Try databases.query first (standard integration)
    if (typeof notion.databases.query === 'function') {
      try {
        console.log(`Trying notion.databases.query for ${DATABASE_ID}...`);
        return await notion.databases.query({
          database_id: DATABASE_ID,
          page_size: 100,
          start_cursor: cursor,
        });
      } catch (dbError) {
        console.warn(`notion.databases.query failed:`, dbError.message);
      }
    }

    // 2. Fallback to notion.dataSources.query
    try {
      let dataSourceId = null;

      // Try to resolve Data Source ID from database metadata
      try {
        console.log(`Resolving Data Source ID for database ${DATABASE_ID}...`);
        const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
        
        if (db.data_sources && db.data_sources.length > 0) {
          dataSourceId = db.data_sources[0].id;
          console.log(`Resolved Data Source ID: ${dataSourceId}`);
        }
      } catch (retrieveError) {
        console.warn(`notion.databases.retrieve failed for ${DATABASE_ID}. Assuming ID is already a Data Source ID. Error: ${retrieveError.message}`);
      }

      // If retrieval failed or no data source found, use the original ID
      if (!dataSourceId) {
        console.warn(`Using original ID ${DATABASE_ID} as Data Source ID...`);
        dataSourceId = DATABASE_ID;
      }

      console.log(`Querying notion.dataSources.query with ID ${dataSourceId}...`);
      return await notion.dataSources.query({
        data_source_id: dataSourceId,
        page_size: 100,
        start_cursor: cursor,
      });
    } catch (dsError) {
      console.error(`notion.dataSources.query failed:`, dsError.message);
      throw new Error(`Failed to query Notion. Error: ${dsError.message}`);
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
