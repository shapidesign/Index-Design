import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_SUGGESTIONS_DB =
  process.env.NOTION_SUGGESTIONS_DB ||
  process.env.NOTION_SUGGESTIONS_DATABASE_ID ||
  '3081fb04f583808aa223f31fd2b98669';

const notion = new Client({ auth: NOTION_API_KEY });

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_CATEGORIES = ['טיפ', 'מעצב', 'סטודיו', 'אתר', 'ספר', 'מפה'];

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

const normalizeUrl = (value) => {
  if (!value) return '';
  return value.startsWith('http') ? value : `https://${value}`;
};

const findPropertyByType = (properties, types, excludedKeys = []) => {
  const excluded = new Set(excludedKeys.filter(Boolean));
  for (const [key, meta] of Object.entries(properties || {})) {
    if (excluded.has(key)) continue;
    if (types.includes(meta?.type)) return [key, meta];
  }
  return [null, null];
};

const findProperty = (properties, candidates) => {
  for (const candidate of candidates) {
    if (properties[candidate]) return [candidate, properties[candidate]];
  }
  return [null, null];
};

const buildTextValue = (propertyMeta, value) => {
  if (!propertyMeta || !value) return null;
  const content = String(value);

  if (propertyMeta.type === 'title') {
    return { title: [{ text: { content } }] };
  }
  if (propertyMeta.type === 'rich_text') {
    return { rich_text: [{ text: { content } }] };
  }
  if (propertyMeta.type === 'email') {
    return { email: content };
  }
  if (propertyMeta.type === 'url') {
    return { url: content };
  }
  return null;
};

const buildParagraphBlock = (title, value) => {
  if (!value) return null;
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: `${title}: ${value}` }
        }
      ]
    }
  };
};

const resolveStatusName = (propertyMeta) => {
  const pendingMatcher = /pending|ממתין|חדש|new/i;

  if (propertyMeta.type === 'status') {
    const options = propertyMeta.status?.options || [];
    const preferred = options.find((opt) => pendingMatcher.test(opt.name));
    return preferred?.name || options[0]?.name || null;
  }

  if (propertyMeta.type === 'select') {
    const options = propertyMeta.select?.options || [];
    const preferred = options.find((opt) => pendingMatcher.test(opt.name));
    return preferred?.name || options[0]?.name || null;
  }

  return null;
};

const resolveParentAndProperties = async (notionId) => {
  try {
    const db = await notion.databases.retrieve({ database_id: notionId });
    return {
      parent: { database_id: notionId },
      properties: db.properties || {}
    };
  } catch (databaseError) {
    try {
      const ds = await notion.dataSources.retrieve({ data_source_id: notionId });
      return {
        parent: { data_source_id: notionId },
        properties: ds.properties || {}
      };
    } catch (dataSourceError) {
      dataSourceError.database_error = databaseError;
      throw dataSourceError;
    }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!NOTION_API_KEY) {
      throw new Error('Configuration Error: NOTION_API_KEY is missing.');
    }
    if (!NOTION_SUGGESTIONS_DB) {
      throw new Error('Configuration Error: NOTION_SUGGESTIONS_DB is missing.');
    }

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.' });
    }

    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const category = String(req.body?.category || '').trim();
    const message = String(req.body?.message || '').trim();
    const url = normalizeUrl(String(req.body?.url || '').trim());

    if (!name) return res.status(400).json({ error: 'יש להזין שם מלא.' });
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'יש להזין אימייל תקין.' });
    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'יש לבחור קטגוריה תקינה.' });
    }
    if (!message || message.length < 5) return res.status(400).json({ error: 'ההודעה קצרה מדי (מינימום 5 תווים).' });
    if (url) {
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'הקישור שהוזן אינו תקין.' });
      }
    }

    const { parent, properties: props } = await resolveParentAndProperties(NOTION_SUGGESTIONS_DB);
    const parentType = parent?.database_id ? 'database_id' : parent?.data_source_id ? 'data_source_id' : 'unknown';

    let [nameKey, nameMeta] = findProperty(props, ['שם', 'Name']);
    if (!nameKey) [nameKey, nameMeta] = findPropertyByType(props, ['title']);

    const [emailKey, emailMeta] = findProperty(props, ['אימייל', 'Email']);
    let [messageKey, messageMeta] = findProperty(props, ['הודעה', 'Message', 'Suggestion', 'הצעה']);
    if (!messageKey) [messageKey, messageMeta] = findPropertyByType(props, ['rich_text'], [nameKey]);

    const [urlKey, urlMeta] = findProperty(props, ['קישור', 'URL', 'Link']);
    let [statusKey, statusMeta] = findProperty(props, ['סטטוס', 'Status']);
    if (!statusKey) [statusKey, statusMeta] = findPropertyByType(props, ['status', 'select']);
    let [categoryKey, categoryMeta] = findProperty(props, ['קטגוריה', 'Category', 'סוג']);
    if (!categoryKey) [categoryKey, categoryMeta] = findPropertyByType(props, ['select', 'multi_select'], [statusKey]);

    if (!nameKey) {
      return res.status(500).json({
        error: 'מבנה מסד הנתונים ב-Notion לא תואם לשדות החובה.',
        debug: {
          parentType,
          nameKey,
          messageKey,
          categoryKey,
          availablePropertyKeys: Object.keys(props || {})
        }
      });
    }

    const notionProperties = {};

    const namePayload = buildTextValue(nameMeta, name);
    if (namePayload) notionProperties[nameKey] = namePayload;

    const messagePayload = buildTextValue(messageMeta, message);
    if (messagePayload && messageKey) notionProperties[messageKey] = messagePayload;

    if (categoryKey && categoryMeta) {
      if (categoryMeta.type === 'select') {
        notionProperties[categoryKey] = { select: { name: category } };
      } else if (categoryMeta.type === 'multi_select') {
        notionProperties[categoryKey] = { multi_select: [{ name: category }] };
      } else {
        const categoryTextPayload = buildTextValue(categoryMeta, category);
        if (categoryTextPayload) notionProperties[categoryKey] = categoryTextPayload;
      }
    }

    if (emailKey && emailMeta) {
      const emailPayload =
        emailMeta.type === 'email'
          ? { email }
          : buildTextValue(emailMeta, email);
      if (emailPayload) notionProperties[emailKey] = emailPayload;
    }

    if (url && urlKey && urlMeta) {
      const urlPayload =
        urlMeta.type === 'url'
          ? { url }
          : buildTextValue(urlMeta, url);
      if (urlPayload) notionProperties[urlKey] = urlPayload;
    }

    if (statusKey && statusMeta) {
      const statusName = resolveStatusName(statusMeta);
      if (statusName) {
        if (statusMeta.type === 'status') {
          notionProperties[statusKey] = { status: { name: statusName } };
        } else if (statusMeta.type === 'select') {
          notionProperties[statusKey] = { select: { name: statusName } };
        }
      }
    }

    const fallbackChildren = [
      !categoryKey ? buildParagraphBlock('קטגוריה', category) : null,
      !messageKey || !messagePayload ? buildParagraphBlock('הודעה', message) : null,
      !emailKey ? buildParagraphBlock('אימייל', email) : null,
      url && !urlKey ? buildParagraphBlock('קישור', url) : null
    ].filter(Boolean);

    await notion.pages.create({
      parent,
      properties: notionProperties,
      children: fallbackChildren
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error creating suggestion:', error);

    const notionErrorCode = error?.code || error?.body?.code || '';
    if (notionErrorCode === 'object_not_found') {
      return res.status(500).json({
        error: 'הגישה למסד ההצעות ב-Notion נכשלה. ודאו שהאינטגרציה מחוברת למסד הנתונים.',
        message: error.message
      });
    }

    if (notionErrorCode === 'validation_error') {
      return res.status(500).json({
        error: 'שדות מסד הנתונים ב-Notion אינם תואמים לטופס ההצעה.',
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'אירעה שגיאה בשליחת ההצעה. נסו שוב בעוד מספר דקות.',
      message: error.message
    });
  }
}
