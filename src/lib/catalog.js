/**
 * HIT Primo catalog search helpers.
 * The discovery UI reads JSON from primaws; we map that payload down to a card.
 */

const PRIMO_HOST = 'https://hit.primo.exlibrisgroup.com';
const VID = '972HIT_INST:HIT';
const INST = '972HIT_INST';
const TAB = 'HIT_BOOKS';
const SCOPE = 'HIT_BOOKS';
const PAGE_SIZE = 10;
const MAX_OFFSET = 990;

const TYPE_LABELS = {
  book: 'ספר',
  books: 'ספר',
  journal: 'כתב עת',
  journals: 'כתב עת',
  article: 'מאמר',
  articles: 'מאמר',
  video: 'וידאו',
  videos: 'וידאו',
  audio: 'שמע',
  image: 'תמונה',
  images: 'תמונה',
  map: 'מפה',
  maps: 'מפה',
  thesis: 'תזה',
  manuscript: 'כתב יד',
  score: 'תווים',
  newspaper: 'עיתון',
  newspapers: 'עיתון',
  website: 'אתר',
  kit: 'ערכה',
  kits: 'ערכה',
  other: 'אחר',
};

const ROLE_RE = /(?:^|\s)(מחבר(?:ת)?(?:\s+נוסף)?|עורך|עורכת|צלם|מתרגם(?:ת)?|author|editor)\s*$/i;
const BIDI_RE = /[\u200e\u200f\u202a-\u202e]/g;

function first(value) {
  if (Array.isArray(value)) return value.find((entry) => String(entry || '').trim()) || '';
  return value || '';
}

export function sanitizeCatalogQuery(value) {
  return String(value || '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

export function parseCatalogQuery(input = {}) {
  const q = sanitizeCatalogQuery(input.q);
  if (q.length < 2) {
    return { error: 'הקלידו לפחות שתי אותיות' };
  }

  let offset = Number.parseInt(input.offset, 10);
  if (!Number.isFinite(offset) || offset < 0) offset = 0;
  if (offset > MAX_OFFSET) offset = MAX_OFFSET;

  return { q, offset, limit: PAGE_SIZE };
}

export function buildPrimoApiUrl({ q, offset, limit }) {
  const params = new URLSearchParams({
    vid: VID,
    inst: INST,
    tab: TAB,
    scope: SCOPE,
    lang: 'he',
    offset: String(offset),
    limit: String(limit),
    sort: 'rank',
    q: `any,contains,${q}`,
    pcAvailability: 'false',
    skipDelivery: 'N',
  });
  return `${PRIMO_HOST}/primaws/rest/pub/pnxs?${params}`;
}

export function buildCatalogSearchUrl(q, offset = 0) {
  const clean = sanitizeCatalogQuery(q);
  const params = new URLSearchParams({
    vid: VID,
    lang: 'he',
    tab: TAB,
    search_scope: SCOPE,
  });
  if (clean) {
    params.set('query', `any,contains,${clean}`);
    params.set('offset', String(Math.max(0, offset || 0)));
  }
  return `${PRIMO_HOST}/discovery/search?${params}`;
}

function cleanName(value) {
  let name = String(value || '').split('$$')[0].replace(BIDI_RE, '').replace(/\s+/g, ' ').trim();
  let previous = '';
  while (name && name !== previous) {
    previous = name;
    name = name.replace(ROLE_RE, '').trim();
  }
  return name;
}

function pickAuthor(pnx) {
  const display = pnx?.display || {};
  const creators = (Array.isArray(display.creator) ? display.creator : [])
    .map(cleanName)
    .filter(Boolean);
  const fallback = creators.length > 0
    ? creators
    : [
        ...(Array.isArray(display.contributor) ? display.contributor : []),
        ...(Array.isArray(pnx?.addata?.au) ? pnx.addata.au : []),
      ].map(cleanName).filter(Boolean);
  return [...new Set(fallback)].slice(0, 2).join(' · ');
}

function pickYear(pnx) {
  const source = first(pnx?.sort?.creationdate) || first(pnx?.display?.creationdate);
  const match = String(source).match(/\b(?:18|19|20)\d{2}\b/);
  return match ? match[0] : '';
}

function pickIsbn(pnx) {
  const chunks = [
    ...(pnx?.addata?.isbn || []),
    ...(pnx?.display?.identifier || []),
  ];
  for (const chunk of chunks) {
    const text = String(chunk);
    const labeled = text.match(/ISBN[^0-9]*([0-9][0-9Xx\-\s]{8,24})/i);
    const digits = (labeled ? labeled[1] : text).replace(/[^0-9Xx]/g, '');
    if (/^(?:\d{9}[\dXx]|\d{13})$/.test(digits)) return digits;
  }
  return '';
}

function pickCallNumber(doc) {
  const fromDelivery = doc?.delivery?.bestlocation?.callNumber;
  const fromDisplay = first(doc?.pnx?.display?.lds02);
  return String(fromDelivery || fromDisplay || '').replace(BIDI_RE, '').trim();
}

function availabilityStatus(doc) {
  const flags = doc?.delivery?.availability || [];
  const location = doc?.delivery?.bestlocation || {};
  const status = location.availabilityStatus;
  const process = location.singleUnavailableItemProcessType;
  if (flags.includes('available_in_library') || status === 'available') return 'available';
  if (
    flags.includes('unavailable')
    || flags.includes('unavailable_in_library')
    || status === 'unavailable'
    || process === 'LOAN'
  ) return 'taken';
  return 'unknown';
}

function typeLabel(pnx) {
  const raw = String(first(pnx?.display?.type) || '').trim().toLowerCase();
  if (!raw) return '';
  return TYPE_LABELS[raw] || first(pnx?.display?.type);
}

function recordLink(recordId) {
  const params = new URLSearchParams({
    docid: recordId,
    context: 'L',
    vid: VID,
    lang: 'he',
    search_scope: SCOPE,
    adaptor: 'Local Search Engine',
    tab: TAB,
  });
  return `${PRIMO_HOST}/discovery/fulldisplay?${params}`;
}

export function mapPrimoDoc(doc) {
  const pnx = doc?.pnx || {};
  const display = pnx.display || {};
  const id = String(first(pnx.control?.recordid) || first(display.mms) || '').trim();
  const isbn = pickIsbn(pnx);
  const title = String(first(display.title) || '').replace(BIDI_RE, '').replace(/\s+/g, ' ').trim();

  return {
    id,
    title,
    author: pickAuthor(pnx),
    year: pickYear(pnx),
    type: typeLabel(pnx),
    publisher: String(first(display.publisher) || first(pnx.addata?.pub) || '').replace(/\s+/g, ' ').trim(),
    callNumber: pickCallNumber(doc),
    availability: availabilityStatus(doc),
    link: id ? recordLink(id) : '',
    coverUrl: isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : '',
  };
}

export function mapPrimoResponse(payload) {
  const docs = Array.isArray(payload?.docs) ? payload.docs : [];
  const total = Number(payload?.info?.total);
  return {
    results: docs.map(mapPrimoDoc).filter((item) => item.title),
    total: Number.isFinite(total) && total > 0 ? total : 0,
  };
}
