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
 * Transform a Notion page into a clean museum object.
 */
function transformPage(page) {
    const p = page.properties || {};
    const rawName = p['שם']?.title?.[0]?.plain_text || '';
    
    // Extract image from "תמונה" (Files & media)
    let imageUrl = null;
    const imageProp = p['תמונה'];
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
        description: p['תיאור']?.rich_text?.[0]?.plain_text || '',
        country: p['מדינה/אזור']?.select?.name || '',
        type: p['סוג']?.multi_select?.map((s) => s.name) || [],
        link: p['קישור']?.url || '',
        imageUrl, // Notion image URL
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
        // Try databases.query first since this is a new DB ID
        try {
            console.log(`Trying notion.databases.query for ${MUSEUM_DB_ID}...`);
            return await notion.databases.query({
                database_id: MUSEUM_DB_ID,
                page_size: 100,
                start_cursor: cursor,
            });
        } catch (dbError) {
            console.warn(`notion.databases.query failed for ${MUSEUM_DB_ID}:`, dbError.message);
            
            // Fallback to dataSources.query just in case
            try {
                console.log(`Falling back to notion.dataSources.query for ${MUSEUM_DB_ID}...`);
                return await notion.dataSources.query({
                    data_source_id: MUSEUM_DB_ID,
                    page_size: 100,
                    start_cursor: cursor,
                });
            } catch (dsError) {
                console.error(`notion.dataSources.query also failed for ${MUSEUM_DB_ID}:`, dsError.message);
                throw new Error(`Failed to query Notion for ${MUSEUM_DB_ID}. Databases error: ${dbError.message}. DataSources error: ${dsError.message}`);
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
