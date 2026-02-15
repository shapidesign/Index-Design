/**
 * Museum utility functions
 * Shared logic for flag mapping and random thumbnail generation
 */

const COUNTRY_CODE_BY_NAME = {
    // Israel / US / UK
    'ישראל': 'il',
    'israel': 'il',
    'ארה"ב': 'us',
    'ארהב': 'us',
    'ארצות הברית': 'us',
    'usa': 'us',
    'united states': 'us',
    'u.s.a': 'us',
    'בריטניה': 'uk',
    'אנגליה': 'uk',
    'הממלכה המאוחדת': 'uk',
    'uk': 'uk',
    'u.k': 'uk',
    'united kingdom': 'uk',
    'great britain': 'uk',
    'england': 'uk',

    // Europe
    'צרפת': 'fr', 'france': 'fr',
    'גרמניה': 'de', 'germany': 'de',
    'איטליה': 'it', 'italy': 'it',
    'הולנד': 'nl', 'netherlands': 'nl',
    'שוויץ': 'ch', 'switzerland': 'ch',
    'ספרד': 'es', 'spain': 'es',
    'רוסיה': 'ru', 'russia': 'ru',
    'שוודיה': 'se', 'sweden': 'se',
    'נורווגיה': 'no', 'norway': 'no',
    'דנמרק': 'dk', 'denmark': 'dk',
    'פינלנד': 'fi', 'finland': 'fi',
    'פולין': 'pl', 'poland': 'pl',
    'אוסטריה': 'at', 'austria': 'at',
    'בלגיה': 'be', 'belgium': 'be',
    'פורטוגל': 'pt', 'portugal': 'pt',
    'יוון': 'gr', 'greece': 'gr',
    'טורקיה': 'tr', 'turkey': 'tr',
    'צכיה': 'cz', 'צ׳כיה': 'cz', 'czech republic': 'cz', 'czechia': 'cz',
    'הונגריה': 'hu', 'hungary': 'hu',
    'רומניה': 'ro', 'romania': 'ro',
    'אוקראינה': 'ua', 'ukraine': 'ua',

    // Americas
    'קנדה': 'ca', 'canada': 'ca',
    'ברזיל': 'br', 'brazil': 'br',
    'ארגנטינה': 'ar', 'argentina': 'ar',
    'מקסיקו': 'mx', 'mexico': 'mx',
    'צילה': 'cl', 'צ׳ילה': 'cl', 'chile': 'cl',
    'קולומביה': 'co', 'colombia': 'co',
    'פרו': 'pe', 'peru': 'pe',

    // Asia/Pacific
    'יפן': 'jp', 'japan': 'jp',
    'סין': 'cn', 'china': 'cn',
    'אוסטרליה': 'au', 'australia': 'au',
    'הודו': 'in', 'india': 'in',
    'דרום קוריאה': 'kr', 'south korea': 'kr', 'korea': 'kr',
    'טייוואן': 'tw', 'taiwan': 'tw',
    'תאילנד': 'th', 'thailand': 'th',
    'וייטנאם': 'vn', 'vietnam': 'vn',
    'סינגפור': 'sg', 'singapore': 'sg',
    'ניו זילנד': 'nz', 'new zealand': 'nz',

    // Middle East / Africa / supra-national
    'מצרים': 'eg', 'egypt': 'eg',
    'דרום אפריקה': 'za', 'south africa': 'za',
    'איחוד האמירויות': 'ae', 'united arab emirates': 'ae', 'uae': 'ae',
    'ערב הסעודית': 'sa', 'saudi arabia': 'sa',
    'אירופה': 'eu', 'europe': 'eu',
    'אסטוניה': 'ee', 'estonia': 'ee'
};

const AVAILABLE_FLAG_CODES = new Set([
    'il', 'us', 'gb', 'fr', 'de', 'jp', 'it', 'nl', 'ch', 'es', 'cn', 'eu',
    'ru', 'hu', 'at', 'dk', 'th', 'br', 'pl', 'ee', 'uk'
]);

const PNG_FLAG_CODES = new Set([
    'ru', 'hu', 'at', 'dk', 'th', 'br', 'pl', 'ee', 'uk'
]);

const normalizeCountryName = (countryName) =>
    String(countryName || '')
        .trim()
        .toLowerCase()
        .replace(/["״׳']/g, '')
        .replace(/\s+/g, ' ');

const splitCountryCandidates = (countryName) =>
    String(countryName || '')
        .split(/[\/|,;]+|(?:\s+ו\s+)|(?:\s*&\s*)|(?:\s+and\s+)/i)
        .map((part) => normalizeCountryName(part))
        .filter(Boolean);

// Helper to get flag image path by ISO-2 code
export const getFlagPath = (countryName) => {
    if (!countryName) return '/flags/unknown.svg';

    const normalized = normalizeCountryName(countryName);
    let code = COUNTRY_CODE_BY_NAME[normalized];

    // Support combined values like "ישראל/ארה\"ב" by picking first known country.
    if (!code) {
        const candidates = splitCountryCandidates(countryName);
        code = candidates
            .map((candidate) => COUNTRY_CODE_BY_NAME[candidate])
            .find(Boolean);
    }

    if (!code || !AVAILABLE_FLAG_CODES.has(code)) return '/flags/unknown.svg';

    const extension = PNG_FLAG_CODES.has(code) ? 'png' : 'svg';
    return `/flags/${code}.${extension}`;
};

// Deterministic random shape and color based on string
export const getRandomThumbnail = (id) => {
    const shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const colors = ['purple', 'green', 'orange', 'pink', 'yellow', 'blue', 'cyan'];

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    const shapeIndex = Math.abs(hash) % shapes.length;
    const colorIndex = Math.abs(hash >> 3) % colors.length;

    return {
        type: shapes[shapeIndex],
        color: colors[colorIndex]
    };
};