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
    'בריטניה': 'gb',
    'אנגליה': 'gb',
    'uk': 'gb',
    'u.k': 'gb',
    'united kingdom': 'gb',
    'great britain': 'gb',
    'england': 'gb',

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
    'אירופה': 'eu', 'europe': 'eu'
};

const AVAILABLE_FLAG_CODES = new Set([
    'il', 'us', 'gb', 'fr', 'de', 'jp', 'it', 'nl', 'ch', 'es', 'cn', 'eu'
]);

const normalizeCountryName = (countryName) =>
    String(countryName || '')
        .trim()
        .toLowerCase()
        .replace(/["״׳']/g, '')
        .replace(/\s+/g, ' ');

// Helper to get flag image path by ISO-2 code
export const getFlagPath = (countryName) => {
    if (!countryName) return '/flags/unknown.svg';

    const normalized = normalizeCountryName(countryName);
    const code = COUNTRY_CODE_BY_NAME[normalized];

    if (!code || !AVAILABLE_FLAG_CODES.has(code)) return '/flags/unknown.svg';

    return `/flags/${code}.svg`;
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