/**
 * Vercel Serverless Function - /api/books
 * Fetches books from Notion and enriches with cover thumbnails.
 */

import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const BOOKS_DB_ID = process.env.NOTION_BOOKS_DB;

const notion = new Client({
  auth: NOTION_API_KEY,
});

const COVER_LOOKUP_CACHE = new Map();

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toSearchKey(title, author) {
  return normalizeText(`${title || ''} ${author || ''}`).toLowerCase();
}

function extractPlainTextFromRichText(richTextArray) {
  if (!Array.isArray(richTextArray) || richTextArray.length === 0) return '';
  return richTextArray.map((part) => part?.plain_text || '').join('').trim();
}

function pickText(props, keys) {
  for (const key of keys) {
    const prop = props[key];
    if (!prop) continue;

    if (prop.type === 'title') {
      const value = extractPlainTextFromRichText(prop.title);
      if (value) return value;
    }

    if (prop.type === 'rich_text') {
      const value = extractPlainTextFromRichText(prop.rich_text);
      if (value) return value;
    }

    if (prop.type === 'select') {
      const value = normalizeText(prop.select?.name || '');
      if (value) return value;
    }

    if (prop.type === 'number') {
      if (typeof prop.number === 'number') return String(prop.number);
    }
  }

  return '';
}

function pickTags(props, keys) {
  for (const key of keys) {
    const prop = props[key];
    if (!prop) continue;

    if (prop.type === 'multi_select') {
      const tags = prop.multi_select.map((entry) => normalizeText(entry?.name)).filter(Boolean);
      if (tags.length > 0) return tags;
    }

    if (prop.type === 'rich_text') {
      const text = extractPlainTextFromRichText(prop.rich_text);
      if (!text) continue;
      const tags = text
        .split(/[;,|]/)
        .map((token) => normalizeText(token))
        .filter(Boolean);
      if (tags.length > 0) return tags;
    }
  }
  return [];
}

function pickUrl(props, keys) {
  for (const key of keys) {
    const prop = props[key];
    if (!prop) continue;

    if (prop.type === 'url') {
      const value = normalizeText(prop.url || '');
      if (value) return value;
    }
  }
  return '';
}

function pickImage(props, keys) {
  for (const key of keys) {
    const prop = props[key];
    if (!prop || prop.type !== 'files' || !Array.isArray(prop.files) || prop.files.length === 0) continue;
    const fileObj = prop.files[0];
    if (fileObj?.type === 'file') return fileObj.file?.url || '';
    if (fileObj?.type === 'external') return fileObj.external?.url || '';
  }
  return '';
}

function transformBook(page) {
  const props = page.properties || {};

  const title = pickText(props, [
    'שם הספר (ומקור/תרגום)',
    'שם הספר',
    'Book',
    'Book Name',
    'Title',
    'שם',
    'Name',
  ]);

  const author = pickText(props, [
    'כותב/ת',
    'מחבר',
    'Author',
    'Author Name',
  ]);

  const year = pickText(props, [
    'שנת הוצאה',
    'שנה',
    'Year',
    'Publication Year',
  ]);

  const description = pickText(props, [
    'נושא (בקצרה)',
    'למה לקרוא',
    'תיאור',
    'Description',
    'Summary',
    'Why',
  ]);

  const tags = pickTags(props, [
    'קטגוריות (תגיות)',
    'תגיות',
    'Tags',
    'Categories',
  ]);

  const link = pickUrl(props, [
    'קישור',
    'לינק',
    'Link',
    'URL',
  ]);

  const coverUrl = pickImage(props, [
    'תמונה',
    'כריכה',
    'Cover',
    'Image',
  ]);

  return {
    id: page.id,
    title,
    author,
    year,
    description,
    tags,
    link,
    coverUrl,
  };
}

async function fetchOpenLibraryCover(title, author) {
  if (!normalizeText(`${title} ${author}`)) return null;

  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title || '')}&author=${encodeURIComponent(author || '')}&limit=5`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) return null;

  const data = await response.json();
  const docs = Array.isArray(data?.docs) ? data.docs : [];
  if (docs.length === 0) return null;

  const docWithCover = docs.find((doc) => doc?.cover_i);
  if (docWithCover?.cover_i) {
    return `https://covers.openlibrary.org/b/id/${docWithCover.cover_i}-L.jpg`;
  }

  return null;
}

async function fetchGoogleBooksCover(title, author) {
  const queryParts = [];
  if (normalizeText(title)) queryParts.push(`intitle:${title}`);
  if (normalizeText(author)) queryParts.push(`inauthor:${author}`);
  if (queryParts.length === 0) return null;

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryParts.join(' '))}&maxResults=5&printType=books`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) return null;

  const data = await response.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  if (items.length === 0) return null;

  for (const item of items) {
    const imageLinks = item?.volumeInfo?.imageLinks;
    const candidate =
      imageLinks?.extraLarge ||
      imageLinks?.large ||
      imageLinks?.medium ||
      imageLinks?.thumbnail ||
      imageLinks?.smallThumbnail;
    if (candidate) {
      return String(candidate).replace(/^http:\/\//i, 'https://');
    }
  }

  return null;
}

async function resolveCoverUrl(book) {
  if (book.coverUrl) return book.coverUrl;

  const cacheKey = toSearchKey(book.title, book.author);
  if (!cacheKey) return null;
  if (COVER_LOOKUP_CACHE.has(cacheKey)) {
    return COVER_LOOKUP_CACHE.get(cacheKey);
  }

  let cover = null;
  try {
    cover = await fetchOpenLibraryCover(book.title, book.author);
    if (!cover) {
      cover = await fetchGoogleBooksCover(book.title, book.author);
    }
  } catch (error) {
    console.warn(`Book cover lookup failed for "${book.title}":`, error.message);
  }

  COVER_LOOKUP_CACHE.set(cacheKey, cover || null);
  return cover || null;
}

async function enrichBooksWithCovers(books, concurrency = 5) {
  const output = new Array(books.length);
  const safeConcurrency = Math.max(1, Math.min(8, concurrency));
  let index = 0;

  const worker = async () => {
    while (index < books.length) {
      const current = index;
      index += 1;
      const book = books[current];
      const resolvedCover = await resolveCoverUrl(book);
      output[current] = {
        ...book,
        coverUrl: book.coverUrl || resolvedCover || '',
      };
    }
  };

  await Promise.all(Array.from({ length: safeConcurrency }, () => worker()));
  return output;
}

async function fetchAllPages() {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  const queryNotion = async (cursor) => {
    if (typeof notion.databases.query === 'function') {
      try {
        return await notion.databases.query({
          database_id: BOOKS_DB_ID,
          page_size: 100,
          start_cursor: cursor,
        });
      } catch (_error) {
        // Fallback below
      }
    }

    let dataSourceId = null;
    try {
      const db = await notion.databases.retrieve({ database_id: BOOKS_DB_ID });
      if (Array.isArray(db?.data_sources) && db.data_sources.length > 0) {
        dataSourceId = db.data_sources[0].id;
      }
    } catch (_error) {
      // BOOKS_DB_ID may already be a data source id.
    }

    return notion.dataSources.query({
      data_source_id: dataSourceId || BOOKS_DB_ID,
      page_size: 100,
      start_cursor: cursor,
    });
  };

  while (hasMore) {
    const response = await queryNotion(startCursor);
    allPages.push(...(response?.results || []));
    hasMore = Boolean(response?.has_more);
    startCursor = response?.next_cursor || undefined;
  }

  return allPages;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!NOTION_API_KEY) {
      throw new Error('Configuration Error: NOTION_API_KEY is missing from environment variables.');
    }
    if (!BOOKS_DB_ID) {
      throw new Error('Configuration Error: NOTION_BOOKS_DB is missing from environment variables.');
    }

    const pages = await fetchAllPages();
    const books = pages.map(transformBook).filter((book) => book.title);
    const enrichedBooks = await enrichBooksWithCovers(books);

    const { q, tag } = req.query || {};
    let filtered = enrichedBooks;

    if (tag) {
      const normalizedTag = String(tag).toLowerCase();
      filtered = filtered.filter((book) =>
        (book.tags || []).some((entry) => entry.toLowerCase().includes(normalizedTag))
      );
    }

    if (q) {
      const normalizedQuery = String(q).toLowerCase();
      filtered = filtered.filter((book) => {
        const haystack = [
          book.title,
          book.author,
          book.year,
          book.description,
          ...(book.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      results: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({
      error: 'שגיאה בטעינת הספרייה',
      message: error.message,
      details: error.body || undefined,
    });
  }
}
