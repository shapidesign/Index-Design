/**
 * Vercel Serverless Function – /api/map-reviews
 *
 * GET  → Fetch approved reviews, optionally filtered by ?place=<name>
 * POST → Submit a new review (name, place, recommendation, optional rating 1-5)
 *
 * Uses the Notion "Location Suggestions" data-source backed database.
 */

import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_MAP_REVIEWS_DB =
    process.env.NOTION_MAP_REVIEWS_DB || '31b1fb04f58380b286aee8ce771678a1';

const notion = new Client({ auth: NOTION_API_KEY });

/* ── Rate limiting ── */
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RATE_LIMIT_MAX_REQUESTS = 10;

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
    return fresh.length > RATE_LIMIT_MAX_REQUESTS;
};

/* ── Schema resolution (supports data-source model) ── */
const resolveParentAndProperties = async (notionId) => {
    try {
        const db = await notion.databases.retrieve({ database_id: notionId });
        const dbProps = db.properties || {};

        if (
            Object.keys(dbProps).length === 0 &&
            Array.isArray(db.data_sources) &&
            db.data_sources.length > 0
        ) {
            const dsId = db.data_sources[0]?.id;
            if (dsId) {
                const ds = await notion.dataSources.retrieve({ data_source_id: dsId });
                return {
                    parent: { data_source_id: dsId },
                    properties: ds.properties || {},
                };
            }
        }

        return {
            parent: { database_id: notionId },
            properties: dbProps,
        };
    } catch (databaseError) {
        try {
            const ds = await notion.dataSources.retrieve({ data_source_id: notionId });
            return {
                parent: { data_source_id: notionId },
                properties: ds.properties || {},
            };
        } catch (dataSourceError) {
            dataSourceError.database_error = databaseError;
            throw dataSourceError;
        }
    }
};

/* ── Property helpers ── */
const findProperty = (properties, candidates) => {
    for (const candidate of candidates) {
        if (properties[candidate]) return [candidate, properties[candidate]];
    }
    return [null, null];
};

const findPropertyByType = (properties, types, excludedKeys = []) => {
    const excluded = new Set(excludedKeys.filter(Boolean));
    for (const [key, meta] of Object.entries(properties || {})) {
        if (excluded.has(key)) continue;
        if (types.includes(meta?.type)) return [key, meta];
    }
    return [null, null];
};

const buildTextValue = (propertyMeta, value) => {
    if (!propertyMeta || !value) return null;
    const content = String(value);
    if (propertyMeta.type === 'title') return { title: [{ text: { content } }] };
    if (propertyMeta.type === 'rich_text') return { rich_text: [{ text: { content } }] };
    if (propertyMeta.type === 'email') return { email: content };
    if (propertyMeta.type === 'url') return { url: content };
    return null;
};

const getPlainText = (prop) => {
    if (!prop) return '';
    if (prop.type === 'title') return prop.title?.[0]?.plain_text || '';
    if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || '';
    return '';
};

/* ── Handler ── */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (!NOTION_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: missing API key.' });
    }

    /* ───────── GET — fetch approved reviews ───────── */
    if (req.method === 'GET') {
        try {
            const placeFilter = String(req.query?.place || '').trim();
            const { parent, properties: props } = await resolveParentAndProperties(NOTION_MAP_REVIEWS_DB);
            const parentId = parent?.database_id || parent?.data_source_id;

            // Discover property keys
            let [nameKey] = findProperty(props, ['Name', 'שם']);
            if (!nameKey) [nameKey] = findPropertyByType(props, ['title']);

            let [placeKey] = findProperty(props, ['מקום', 'Place', 'Location']);
            if (!placeKey) [placeKey] = findPropertyByType(props, ['rich_text'], [nameKey]);

            let [recKey] = findProperty(props, ['המלצה', 'Recommendation', 'Review', 'הודעה']);
            if (!recKey) [recKey] = findPropertyByType(props, ['rich_text'], [nameKey, placeKey].filter(Boolean));

            let [ratingKey] = findProperty(props, ['דירוג', 'Rating', 'Stars']);
            if (!ratingKey) [ratingKey] = findPropertyByType(props, ['number']);

            let [statusKey] = findProperty(props, ['סטטוס', 'Status']);
            if (!statusKey) [statusKey] = findPropertyByType(props, ['status', 'select']);

            // Build filter: only approved reviews
            const filter = { and: [] };
            if (statusKey) {
                const statusMeta = props[statusKey];
                if (statusMeta?.type === 'status') {
                    filter.and.push({ property: statusKey, status: { equals: 'מאושר' } });
                } else if (statusMeta?.type === 'select') {
                    filter.and.push({ property: statusKey, select: { equals: 'מאושר' } });
                }
            }

            // Optionally filter by place name
            if (placeFilter && placeKey) {
                filter.and.push({
                    property: placeKey,
                    rich_text: { equals: placeFilter },
                });
            }

            const queryArgs = { database_id: parentId };
            if (filter.and.length > 0) {
                queryArgs.filter = filter.and.length === 1 ? filter.and[0] : filter;
            }

            const response = await notion.databases.query(queryArgs);

            const reviews = (response.results || []).map((page) => {
                const p = page.properties || {};
                return {
                    id: page.id,
                    name: nameKey ? getPlainText(p[nameKey]) : '',
                    place: placeKey ? getPlainText(p[placeKey]) : '',
                    recommendation: recKey ? getPlainText(p[recKey]) : '',
                    rating: ratingKey && p[ratingKey]?.number != null ? p[ratingKey].number : null,
                    createdAt: page.created_time,
                };
            });

            return res.status(200).json({ reviews });
        } catch (error) {
            console.error('Error fetching map reviews:', error);
            return res.status(500).json({ error: 'שגיאה בטעינת ההמלצות.', message: error.message });
        }
    }

    /* ───────── POST — submit new review ───────── */
    if (req.method === 'POST') {
        try {
            const ip = getClientIp(req);
            if (isRateLimited(ip)) {
                return res.status(429).json({ error: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.' });
            }

            const name = String(req.body?.name || '').trim();
            const place = String(req.body?.place || '').trim();
            const recommendation = String(req.body?.recommendation || '').trim();
            const rating = req.body?.rating != null ? Number(req.body.rating) : null;

            // Validation
            if (!name) return res.status(400).json({ error: 'יש להזין שם.' });
            if (!place) return res.status(400).json({ error: 'שם המקום חסר.' });
            if (!recommendation || recommendation.length < 3) {
                return res.status(400).json({ error: 'יש להזין המלצה (לפחות 3 תווים).' });
            }
            if (rating !== null && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
                return res.status(400).json({ error: 'דירוג חייב להיות בין 1 ל-5.' });
            }

            const { parent, properties: props } = await resolveParentAndProperties(NOTION_MAP_REVIEWS_DB);

            // Discover property keys
            let [nameKey, nameMeta] = findProperty(props, ['Name', 'שם']);
            if (!nameKey) [nameKey, nameMeta] = findPropertyByType(props, ['title']);

            let [placeKey, placeMeta] = findProperty(props, ['מקום', 'Place', 'Location']);
            if (!placeKey) [placeKey, placeMeta] = findPropertyByType(props, ['rich_text'], [nameKey]);

            let [recKey, recMeta] = findProperty(props, ['המלצה', 'Recommendation', 'Review', 'הודעה']);
            if (!recKey) [recKey, recMeta] = findPropertyByType(props, ['rich_text'], [nameKey, placeKey].filter(Boolean));

            let [ratingKey, ratingMeta] = findProperty(props, ['דירוג', 'Rating', 'Stars']);
            if (!ratingKey) [ratingKey, ratingMeta] = findPropertyByType(props, ['number']);

            let [statusKey, statusMeta] = findProperty(props, ['סטטוס', 'Status']);
            if (!statusKey) [statusKey, statusMeta] = findPropertyByType(props, ['status', 'select']);

            if (!nameKey) {
                return res.status(500).json({
                    error: 'מבנה מסד הנתונים אינו תואם.',
                    debug: { availablePropertyKeys: Object.keys(props || {}) },
                });
            }

            const notionProperties = {};

            // Name (title)
            const namePayload = buildTextValue(nameMeta, name);
            if (namePayload) notionProperties[nameKey] = namePayload;

            // Place (rich_text)
            if (placeKey && placeMeta) {
                const placePayload = buildTextValue(placeMeta, place);
                if (placePayload) notionProperties[placeKey] = placePayload;
            }

            // Recommendation (rich_text)
            if (recKey && recMeta) {
                const recPayload = buildTextValue(recMeta, recommendation);
                if (recPayload) notionProperties[recKey] = recPayload;
            }

            // Rating (number)
            if (rating !== null && ratingKey && ratingMeta?.type === 'number') {
                notionProperties[ratingKey] = { number: rating };
            }

            // Status → default to pending
            if (statusKey && statusMeta) {
                if (statusMeta.type === 'status') {
                    const options = statusMeta.status?.options || [];
                    const pending = options.find((o) => /pending|ממתין|חדש|new/i.test(o.name));
                    const statusName = pending?.name || options[0]?.name;
                    if (statusName) notionProperties[statusKey] = { status: { name: statusName } };
                } else if (statusMeta.type === 'select') {
                    const options = statusMeta.select?.options || [];
                    const pending = options.find((o) => /pending|ממתין|חדש|new/i.test(o.name));
                    const statusName = pending?.name || options[0]?.name;
                    if (statusName) notionProperties[statusKey] = { select: { name: statusName } };
                }
            }

            // Fallback: put missing fields in page body
            const fallbackChildren = [];
            if (!placeKey) {
                fallbackChildren.push({
                    object: 'block', type: 'paragraph',
                    paragraph: { rich_text: [{ text: { content: `מקום: ${place}` } }] },
                });
            }
            if (!recKey) {
                fallbackChildren.push({
                    object: 'block', type: 'paragraph',
                    paragraph: { rich_text: [{ text: { content: `המלצה: ${recommendation}` } }] },
                });
            }
            if (rating !== null && !ratingKey) {
                fallbackChildren.push({
                    object: 'block', type: 'paragraph',
                    paragraph: { rich_text: [{ text: { content: `דירוג: ${rating}/5` } }] },
                });
            }

            await notion.pages.create({
                parent,
                properties: notionProperties,
                children: fallbackChildren,
            });

            return res.status(200).json({ ok: true });
        } catch (error) {
            console.error('Error creating map review:', error);
            return res.status(500).json({
                error: 'אירעה שגיאה בשליחת ההמלצה. נסו שוב בעוד מספר דקות.',
                message: error.message,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
