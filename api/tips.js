/**
 * Vercel Serverless Function – /api/tips
 * 
 * Fetches approved tips from the Notion Database.
 */

import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
// The Notion ID for the Tips DB provided by the user
const NOTION_TIPS_DB = process.env.NOTION_TIPS_DB || '3081fb04f58380bea0aac8b2eb4cf4d3';

const notion = new Client({ auth: NOTION_API_KEY });

// Minimal in-memory cache to prevent Notion API rate limits during high traffic
let cache = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL_MS = 60 * 1000; // Cache for 1 minute

/* ── Schema resolution (supports data-source model) ── */
const resolveParentAndProperties = async (notionId) => {
  try {
    const db = await notion.databases.retrieve({ database_id: notionId });
    const dbProps = db.properties || {};

    // If regular properties are empty but data_sources exists (new Notion model)
    if (
      Object.keys(dbProps).length === 0 &&
      Array.isArray(db.data_sources) &&
      db.data_sources.length > 0
    ) {
      const dsId = db.data_sources[0]?.id;
      if (dsId) {
        const ds = await notion.dataSources.retrieve({ data_source_id: dsId });
        return {
          parentId: dsId,
          parentIdType: 'data_source_id',
          properties: ds.properties || {},
        };
      }
    }

    return {
      parentId: notionId,
      parentIdType: 'database_id',
      properties: dbProps,
    };
  } catch (databaseError) {
    try {
      const ds = await notion.dataSources.retrieve({ data_source_id: notionId });
      return {
        parentId: notionId,
        parentIdType: 'data_source_id',
        properties: ds.properties || {},
      };
    } catch (dataSourceError) {
      dataSourceError.database_error = databaseError;
      throw dataSourceError;
    }
  }
};

/* ── Property helpers ── */
const findPropertyByType = (properties, types, excludedKeys = []) => {
  const excluded = new Set(excludedKeys.filter(Boolean));
  for (const [key, meta] of Object.entries(properties || {})) {
    if (excluded.has(key)) continue;
    if (types.includes(meta?.type)) return [key, meta];
  }
  return [null, null];
};

const getPlainText = (prop) => {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title?.map(t => t.plain_text).join('') || '';
  if (prop.type === 'rich_text') return prop.rich_text?.map(t => t.plain_text).join('') || '';
  return '';
};

const getSelectName = (prop) => {
  if (!prop) return '';
  if (prop.type === 'select') return prop.select?.name || '';
  return '';
};

const getMultiSelectNames = (prop) => {
  if (!prop) return [];
  if (prop.type === 'multi_select' && Array.isArray(prop.multi_select)) {
    return prop.multi_select.map(s => s.name);
  }
  return [];
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!NOTION_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: missing API key.' });
  }

  // Check cache
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json({ tips: cache.data });
  }

  try {
    const parentResponse = await resolveParentAndProperties(NOTION_TIPS_DB);
    const props = parentResponse.properties;

    // Identify columns automatically based on known schema
    let [titleKey] = findPropertyByType(props, ['title']);
    let [typeKey] = findPropertyByType(props, ['select']);
    let [tagsKey] = findPropertyByType(props, ['multi_select']);
    
    // Specifically find "תיאור מפורט" and "מי הכניס" which are both rich_text
    let contentKey = Object.keys(props).find(k => k.includes('תיאור')) || null;
    let authorKey = Object.keys(props).find(k => k.includes('מי הכניס') || k.includes('מאת')) || null;

    if (!contentKey) [contentKey] = findPropertyByType(props, ['rich_text']);
    if (!authorKey) [authorKey] = findPropertyByType(props, ['rich_text'], [contentKey]);

    const queryArgs = {};
    if (titleKey) {
      queryArgs.filter = {
        property: titleKey,
        title: { is_not_empty: true }
      };
    }

    let response;
    // Call the correct query function based on whether it's a dataSource or database
    if (parentResponse.parentIdType === 'data_source_id') {
      queryArgs.data_source_id = parentResponse.parentId;
      response = await notion.dataSources.query(queryArgs);
    } else {
      queryArgs.database_id = parentResponse.parentId;
      response = await notion.databases.query(queryArgs);
    }

    const tips = (response.results || []).map((page) => {
      const p = page.properties || {};
      return {
        id: page.id,
        title: titleKey ? getPlainText(p[titleKey]) : '',
        type: typeKey ? getSelectName(p[typeKey]) : '',
        tags: tagsKey ? getMultiSelectNames(p[tagsKey]) : [],
        content: contentKey ? getPlainText(p[contentKey]) : '',
        author: authorKey ? getPlainText(p[authorKey]) : '',
        createdAt: page.created_time,
      };
    });

    cache.data = tips;
    cache.timestamp = Date.now();

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json({ tips });
    
  } catch (error) {
    console.error('Error fetching tips:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch tips', 
      message: error.message 
    });
  }
}
