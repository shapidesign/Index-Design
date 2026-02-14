/**
 * Vercel Serverless Function - /api/hall-of-fame
 * Fetches famous designers from Notion "היכל התהילה" database
 * Queries both data sources and merges results (deduplicates by page ID)
 */

import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DS1 = process.env.NOTION_HALL_OF_FAME_DS1;
const DS2 = process.env.NOTION_HALL_OF_FAME_DS2;

const notion = new Client({
  auth: NOTION_API_KEY,
});

/**
 * Parse a name like "Hebrew (English)" or "Hebrew" into separate parts.
 */
function parseName(raw) {
    const match = raw.match(/^(.+?)\s*\((.+?)\)\s*$/);
    if (match) {
        return { nameHe: match[1].trim(), nameEn: match[2].trim() };
    }
    return { nameHe: raw.trim(), nameEn: '' };
}

/**
 * Extract start and end decades from a Hebrew era string.
 * Examples:
 *   "שנות ה-50 עד ה-90"  → { decadeStart: 1950, decadeEnd: 1990 }
 *   "שנות ה-2010 עד היום" → { decadeStart: 2010, decadeEnd: 2020 }
 *   "1950-1990"           → { decadeStart: 1950, decadeEnd: 1990 }
 */
function parseDecades(eraStrings) {
    if (!eraStrings || eraStrings.length === 0) return { decadeStart: null, decadeEnd: null };
    const raw = eraStrings[0];

    // Try "1950-1990" format
    const fullMatch = raw.match(/(\d{4})\s*[-–]\s*(\d{4})/);
    if (fullMatch) {
        return { decadeStart: Math.floor(+fullMatch[1] / 10) * 10, decadeEnd: Math.floor(+fullMatch[2] / 10) * 10 };
    }

    // Hebrew format: extract all numbers
    const nums = raw.match(/\d+/g);
    if (!nums) return { decadeStart: null, decadeEnd: null };

    const parsed = nums.map(Number);
    let start = parsed[0];
    let end = parsed.length > 1 ? parsed[1] : null;

    // Normalize 2-digit decades: 50 → 1950, 10 could be 1910 or 2010 (check context)
    const normalize = (n) => {
        if (n >= 1000) return Math.floor(n / 10) * 10;
        if (n >= 100) return 1000 + n; // e.g., 890 → 1890
        return 1900 + n; // e.g., 50 → 1950
    };

    start = normalize(start);
    if (raw.includes('היום')) {
        end = 2020;
    } else if (end !== null) {
        end = normalize(end);
        // Fix cases like "שנות ה-20 עד ה-40" where 20→1920 but it could also be 2020
        // If start >= 2000, keep end as-is
        if (start >= 2000 && end < 2000 && end > start) { /* already fine */ }
    } else {
        end = start; // single decade
    }

    return { decadeStart: start, decadeEnd: end };
}

/**
 * Transform a Notion page into a clean designer object.
 * Handles both DS1 and DS2 field names.
 */
function transformPage(page, dsIndex) {
    const p = page.properties || {};
    const rawName = p['שם']?.title?.[0]?.plain_text || '';
    const { nameHe, nameEn } = parseName(rawName);

    const eraRaw = dsIndex === 0
        ? (p['תקופה']?.multi_select?.map((s) => s.name) || [])
        : (p['שנות פעילות']?.multi_select?.map((s) => s.name) || []);

    const { decadeStart, decadeEnd } = parseDecades(eraRaw);

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
        nameHe,
        nameEn,
        description: p['תיאור']?.rich_text?.[0]?.plain_text || '',
        fields: (dsIndex === 0 ? p['תחום'] : p['תגיות'])?.multi_select?.map((s) => s.name) || [],
        styles: p['סגנון']?.multi_select?.map((s) => s.name) || [],
        era: eraRaw,
        decadeStart,
        decadeEnd,
        link: (dsIndex === 0 ? p['אתר אינטרנט'] : p['קישור'])?.url || '',
        imageUrl, // Notion image URL
    };
}

/**
 * Fetch all pages from a single database (handles pagination)
 */
async function fetchAllPages(databaseId) {
    const allPages = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        try {
            const response = await notion.dataSources.query({
                data_source_id: databaseId,
                page_size: 100,
                start_cursor: startCursor,
            });

            allPages.push(...response.results);
            hasMore = response.has_more;
            startCursor = response.next_cursor;
        } catch (error) {
            console.error(`Error querying Notion database ${databaseId}:`, error.body || error);
            throw new Error(`Notion API error: ${error.message}`);
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
        if (!NOTION_API_KEY || !DS1) {
            throw new Error('Missing Notion configuration (NOTION_API_KEY or NOTION_HALL_OF_FAME_DS1)');
        }

        // Fetch from both data sources in parallel, merge & deduplicate
        const dataSources = [DS1];
        if (DS2) dataSources.push(DS2);

        const allResults = await Promise.all(
            dataSources.map((ds, i) =>
                fetchAllPages(ds).then((pages) =>
                    pages.map((p) => transformPage(p, i))
                )
            )
        );

        // Merge and deduplicate by page ID
        const seen = new Set();
        const designers = [];
        for (const batch of allResults) {
            for (const designer of batch) {
                if (!seen.has(designer.id) && designer.name) {
                    seen.add(designer.id);
                    designers.push(designer);
                }
            }
        }

        // Cache for 5 minutes
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

        return res.status(200).json({
            results: designers,
            total: designers.length,
        });
    } catch (error) {
        console.error('Error fetching hall of fame:', error);
        return res.status(500).json({
            error: 'שגיאה בטעינת היכל התהילה',
            message: error.message,
            details: error.body || undefined
        });
    }
}
