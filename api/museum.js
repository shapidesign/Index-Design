/**
 * Vercel Serverless Function - /api/museum
 * Fetches museum/locations from Notion database
 */

import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const MUSEUM_DB_ID = process.env.NOTION_MUSEUM_DB;

const notion = new Client({
  auth: NOTION_API_KEY,
});

/**
 * Parse a name like "Hebrew (English)" or "Hebrew" into separate parts.
 */
function parseName(raw) {
    if (!raw) return { nameHe: '', nameEn: '' };
    const match = raw.match(/^(.+?)\s*\((.+?)\)\s*$/);
    if (match) {
        return { nameHe: match[1].trim(), nameEn: match[2].trim() };
    }
    return { nameHe: raw.trim(), nameEn: '' };
}

/**
 * Transform a Notion page into a clean museum object.
 */
function transformPage(page) {
    const p = page.properties || {};
    
    // Debug: Log properties for the first item to help diagnose schema issues
    if (global.debugFirstItem !== true) {
        console.log('--- DEBUG: First Item Properties ---');
        console.log('ID:', page.id);
        console.log('Keys:', Object.keys(p));
        global.debugFirstItem = true;
    }

    // Name: Try 'Name', 'Title', 'name', 'title', 'שם'
    const rawName = 
        p['Name']?.title?.[0]?.plain_text || 
        p['Title']?.title?.[0]?.plain_text || 
        p['name']?.title?.[0]?.plain_text || 
        p['title']?.title?.[0]?.plain_text || 
        p['שם']?.title?.[0]?.plain_text || 
        '';
    
    const { nameHe, nameEn } = parseName(rawName);
    
    // Description: 'הערות', 'תיאור', 'Description'
    const description = 
        p['הערות']?.rich_text?.[0]?.plain_text || 
        p['תיאור']?.rich_text?.[0]?.plain_text || 
        p['Description']?.rich_text?.[0]?.plain_text || 
        '';
    
    // Country: 'מדינה', 'מדינה/אזור', 'Country'
    const country = 
        p['מדינה']?.select?.name || 
        p['מדינה/אזור']?.select?.name || 
        p['Country']?.select?.name || 
        '';
    
    // Type: 'תחום', 'סוג', 'Type'
    const type = 
        p['תחום']?.multi_select?.map(s => s.name) || 
        p['סוג']?.multi_select?.map(s => s.name) || 
        p['Type']?.multi_select?.map(s => s.name) || 
        [];

    // Tags: 'תגיות', 'Tags'
    const tags = 
        p['תגיות']?.multi_select?.map(s => s.name) || 
        p['Tags']?.multi_select?.map(s => s.name) || 
        [];

    // Era: 'תקופה', 'Era', 'Period'
    const era = 
        p['תקופה']?.multi_select?.map(s => s.name) || 
        p['Era']?.multi_select?.map(s => s.name) || 
        p['Period']?.multi_select?.map(s => s.name) || 
        [];

    // Famous Work: 'עבודות בולטות', 'Famous Work'
    const famousWork = 
        p['עבודות בולטות']?.rich_text?.[0]?.plain_text || 
        p['Famous Work']?.rich_text?.[0]?.plain_text || 
        '';

    // Quote: 'ציטוטים', 'Quote'
    const quote = 
        p['ציטוטים']?.rich_text?.[0]?.plain_text || 
        p['Quote']?.rich_text?.[0]?.plain_text || 
        '';
                 
    // Link: 'מקורות', 'קישור', 'Link', 'URL'
    const link = 
        p['מקורות']?.url || 
        p['קישור']?.url || 
        p['Link']?.url || 
        p['URL']?.url || 
        '';
    
    // Image: 'תמונה', 'Image'
    let imageUrl = null;
    const imageProp = p['תמונה'] || p['Image'];
    if (imageProp && imageProp.type === 'files' && imageProp.files.length > 0) {
        const fileObj = imageProp.files[0];
        if (fileObj.type === 'file') {
            imageUrl = fileObj.file.url;
        } else if (fileObj.type === 'external') {
            imageUrl = fileObj.external.url;
        }
    }

    return {
        id: page.id,
        name: rawName,
        nameHe,
        nameEn,
        description,
        country,
        type,
        tags,
        era,
        famousWork,
        quote,
        link,
        imageUrl,
    };
}

/**
 * Fetch all pages from a single database (handles pagination)
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
                console.log(`Trying notion.databases.query for ${MUSEUM_DB_ID}...`);
                return await notion.databases.query({
                    database_id: MUSEUM_DB_ID,
                    page_size: 100,
                    start_cursor: cursor,
                });
            } catch (dbError) {
                console.warn(`notion.databases.query failed for ${MUSEUM_DB_ID}:`, dbError.message);
            }
        }

        // 2. Fallback to notion.dataSources.query
        try {
            let dataSourceId = null;

            // Try to resolve Data Source ID from database metadata
            try {
                console.log(`Resolving Data Source ID for database ${MUSEUM_DB_ID}...`);
                const db = await notion.databases.retrieve({ database_id: MUSEUM_DB_ID });
                
                if (db.data_sources && db.data_sources.length > 0) {
                    dataSourceId = db.data_sources[0].id;
                    console.log(`Resolved Data Source ID: ${dataSourceId}`);
                }
            } catch (retrieveError) {
                console.warn(`notion.databases.retrieve failed for ${MUSEUM_DB_ID}. Assuming ID is already a Data Source ID. Error: ${retrieveError.message}`);
            }

            // If retrieval failed or no data source found, use the original ID
            if (!dataSourceId) {
                console.warn(`Using original ID ${MUSEUM_DB_ID} as Data Source ID...`);
                dataSourceId = MUSEUM_DB_ID;
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
            console.error(`Error querying Notion database ${MUSEUM_DB_ID}:`, error);
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

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // Debug logging for environment variables
        console.log('Env Check - NOTION_API_KEY exists:', !!NOTION_API_KEY);
        console.log('Env Check - MUSEUM_DB_ID exists:', !!MUSEUM_DB_ID);

        if (!NOTION_API_KEY) {
            throw new Error('Configuration Error: NOTION_API_KEY is missing from environment variables.');
        }

        if (!MUSEUM_DB_ID) {
            throw new Error('Configuration Error: NOTION_MUSEUM_DB is missing from environment variables.');
        }

        const pages = await fetchAllPages();
        const items = pages
            .map(transformPage)
            .filter(item => item.name); // Filter out empty entries

        // Cache for 5 minutes
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

        return res.status(200).json({
            results: items,
            total: items.length,
        });
    } catch (error) {
        console.error('Error fetching museum data:', error);
        return res.status(500).json({
            error: 'שגיאה בטעינת המוזיאונים',
            message: error.message,
            details: error.body || undefined
        });
    }
}
