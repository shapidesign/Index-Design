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

const WIKI_LANGS = ['en', 'he'];
const WIKI_IMAGE_CACHE = new Map();

function normalizeQuery(value) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim();
}

function splitFamousWork(value) {
    if (!value) return [];
    return String(value)
        .split(/[;,|/]|(?:\s+(?:and|ו)\s+)/gi)
        .map((part) => normalizeQuery(part))
        .filter((part) => part.length >= 2)
        .slice(0, 3);
}

function buildSearchQueries(item) {
    const famousWorks = splitFamousWork(item.famousWork);
    const candidates = [];

    famousWorks.forEach((work) => {
        candidates.push({ query: work, intent: 'work' });
        if (item.nameEn) candidates.push({ query: `${work} ${item.nameEn}`, intent: 'work' });
    });

    if (item.nameEn) candidates.push({ query: item.nameEn, intent: 'person' });
    if (item.nameHe) candidates.push({ query: item.nameHe, intent: 'person' });
    if (item.name) candidates.push({ query: item.name, intent: 'person' });

    const deduped = [];
    const seen = new Set();
    candidates.forEach((candidate) => {
        const normalized = normalizeQuery(candidate.query);
        const key = normalized.toLowerCase();
        if (!normalized || seen.has(key)) return;
        seen.add(key);
        deduped.push({ query: normalized, intent: candidate.intent });
    });

    return deduped;
}

function getPageImage(page) {
    return page?.original?.source || page?.thumbnail?.source || null;
}

function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function includesNormalized(haystack, needle) {
    const h = normalizeText(haystack);
    const n = normalizeText(needle);
    if (!h || !n) return false;
    return h.includes(n);
}

function scorePageCandidate(page, query, intent, designerAliases = []) {
    const title = String(page?.title || '').toLowerCase();
    const normalizedQuery = normalizeQuery(query).toLowerCase();
    const extract = String(page?.extract || '').toLowerCase();
    const categories = (page?.categories || []).map((c) => String(c?.title || '').toLowerCase());
    const categoryText = categories.join(' ');
    const isDisambiguation = Boolean(page?.pageprops?.disambiguation) || includesNormalized(extract, 'may refer to');

    let score = 0;

    if (isDisambiguation) score -= 100;
    if (title === normalizedQuery) score += 5;
    if (title.includes(normalizedQuery)) score += 3;
    if (getPageImage(page)) score += 4;

    const biographySignals = [
        'births',
        'deaths',
        'living people',
        'people',
        'biography',
        'ביוגרפיה',
        'ילידי',
        'נפטרים'
    ];

    const artworkSignals = [
        'paintings',
        'artworks',
        'posters',
        'logos',
        'typefaces',
        'albums',
        'book covers',
        'works',
        'graphic design',
        'יצירות',
        'ציורים',
        'כרזות',
        'לוגואים',
        'פונטים'
    ];

    if (intent === 'work') {
        const designerMentioned = designerAliases.some((alias) => includesNormalized(extract, alias));
        if (designerMentioned) score += 10;
        if (artworkSignals.some((signal) => categoryText.includes(signal))) score += 4;
        if (biographySignals.some((signal) => categoryText.includes(signal))) score -= 6;

        // Work pages often mention creator relation in text.
        if (
            includesNormalized(extract, 'designed by') ||
            includesNormalized(extract, 'created by') ||
            includesNormalized(extract, 'by ')
        ) {
            score += 2;
        }
    } else {
        if (biographySignals.some((signal) => categoryText.includes(signal))) score += 1;
    }

    return score;
}

function extractBestWikipediaImage(data, query, intent, designerAliases = []) {
    const pages = data?.query?.pages;
    if (!pages) return null;

    const ranked = Object.values(pages)
        .map((page) => ({ page, score: scorePageCandidate(page, query, intent, designerAliases) }))
        .sort((a, b) => b.score - a.score);

    for (const candidate of ranked) {
        if (candidate.score < 0) continue;
        const image = getPageImage(candidate.page);
        if (image) return image;
    }

    return null;
}

async function fetchWikipediaImageForQuery(query, intent = 'work', designerAliases = []) {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return null;

    const aliasKey = designerAliases.map((alias) => normalizeText(alias)).filter(Boolean).sort().join('|');
    const cacheKey = `${intent}:${normalizedQuery.toLowerCase()}:${aliasKey}`;
    if (WIKI_IMAGE_CACHE.has(cacheKey)) {
        return WIKI_IMAGE_CACHE.get(cacheKey);
    }

    for (const lang of WIKI_LANGS) {
        try {
            const searchUrl = new URL(`https://${lang}.wikipedia.org/w/api.php`);
            searchUrl.searchParams.set('action', 'query');
            searchUrl.searchParams.set('format', 'json');
            searchUrl.searchParams.set('list', 'search');
            searchUrl.searchParams.set('srsearch', normalizedQuery);
            searchUrl.searchParams.set('srlimit', '5');

            const searchRes = await fetch(searchUrl);
            if (!searchRes.ok) continue;

            const searchJson = await searchRes.json();
            const bestMatches = searchJson?.query?.search || [];
            if (bestMatches.length === 0) continue;

            const imageUrl = new URL(`https://${lang}.wikipedia.org/w/api.php`);
            imageUrl.searchParams.set('action', 'query');
            imageUrl.searchParams.set('format', 'json');
            imageUrl.searchParams.set('prop', 'pageimages|categories|extracts|pageprops');
            imageUrl.searchParams.set('piprop', 'original|thumbnail');
            imageUrl.searchParams.set('pithumbsize', '1200');
            imageUrl.searchParams.set('cllimit', '30');
            imageUrl.searchParams.set('exintro', '1');
            imageUrl.searchParams.set('explaintext', '1');
            imageUrl.searchParams.set('exchars', '700');
            imageUrl.searchParams.set('pageids', bestMatches.map((m) => String(m.pageid)).join('|'));

            const imageRes = await fetch(imageUrl);
            if (!imageRes.ok) continue;

            const imageJson = await imageRes.json();
            const image = extractBestWikipediaImage(imageJson, normalizedQuery, intent, designerAliases);
            if (image) {
                WIKI_IMAGE_CACHE.set(cacheKey, image);
                return image;
            }
        } catch (error) {
            console.warn(`Wikipedia image lookup failed for "${normalizedQuery}" in ${lang}:`, error.message);
        }
    }

    WIKI_IMAGE_CACHE.set(cacheKey, null);
    return null;
}

async function resolveRepresentativeImage(item) {
    if (item.imageUrl) return item.imageUrl;
    const queries = buildSearchQueries(item);
    const designerAliases = [item.nameEn, item.nameHe, item.name]
        .map((alias) => normalizeQuery(alias))
        .filter(Boolean);

    for (const queryObj of queries) {
        const image = await fetchWikipediaImageForQuery(queryObj.query, queryObj.intent, designerAliases);
        if (image) return image;
    }

    return null;
}

async function enrichItemsWithWikiImages(items, concurrency = 4) {
    const safeConcurrency = Math.max(1, Math.min(concurrency, 8));
    const enriched = new Array(items.length);
    let index = 0;

    const worker = async () => {
        while (index < items.length) {
            const current = index;
            index += 1;
            const item = items[current];
            const imageUrl = await resolveRepresentativeImage(item);
            enriched[current] = { ...item, imageUrl };
        }
    };

    await Promise.all(Array.from({ length: safeConcurrency }, () => worker()));
    return enriched;
}

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

        const enrichedItems = await enrichItemsWithWikiImages(items);

        // Cache for 5 minutes
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

        return res.status(200).json({
            results: enrichedItems,
            total: enrichedItems.length,
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
