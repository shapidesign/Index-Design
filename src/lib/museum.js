/**
 * Museum utility functions
 * Shared logic for flag mapping and random thumbnail generation
 */

// Helper to get flag image path
export const getFlagPath = (countryName) => {
    if (!countryName) return null;

    // Map Hebrew/English country names to flag codes
    const countryMap = {
        'ישראל': 'il',
        'Israel': 'il',
        'ארה"ב': 'us',
        'USA': 'us',
        'United States': 'us',
        'בריטניה': 'uk',
        'UK': 'uk',
        'United Kingdom': 'uk',
        'צרפת': 'fr',
        'France': 'fr',
        'גרמניה': 'de',
        'Germany': 'de',
        'יפן': 'jp',
        'Japan': 'jp',
        'איטליה': 'it',
        'Italy': 'it',
        'הולנד': 'nl',
        'Netherlands': 'nl',
        'שוויץ': 'ch',
        'Switzerland': 'ch',
        'ספרד': 'es',
        'Spain': 'es',
        'סין': 'cn',
        'China': 'cn',
        'אירופה': 'eu',
        'Europe': 'eu',

        // Europe
        'רוסיה': 'ru', 'Russia': 'ru',
        'שוודיה': 'se', 'Sweden': 'se',
        'נורווגיה': 'no', 'Norway': 'no',
        'דנמרק': 'dk', 'Denmark': 'dk',
        'פינלנד': 'fi', 'Finland': 'fi',
        'פולין': 'pl', 'Poland': 'pl',
        'אוסטריה': 'at', 'Austria': 'at',
        'בלגיה': 'be', 'Belgium': 'be',
        'פורטוגל': 'pt', 'Portugal': 'pt',
        'יוון': 'gr', 'Greece': 'gr',
        'טורקיה': 'tr', 'Turkey': 'tr',
        'צ׳כיה': 'cz', 'Czech Republic': 'cz',
        'הונגריה': 'hu', 'Hungary': 'hu',
        'רומניה': 'ro', 'Romania': 'ro',
        'אוקראינה': 'ua', 'Ukraine': 'ua',

        // Americas
        'קנדה': 'ca', 'Canada': 'ca',
        'ברזיל': 'br', 'Brazil': 'br',
        'ארגנטינה': 'ar', 'Argentina': 'ar',
        'מקסיקו': 'mx', 'Mexico': 'mx',
        'צ׳ילה': 'cl', 'Chile': 'cl',
        'קולומביה': 'co', 'Colombia': 'co',
        'פרו': 'pe', 'Peru': 'pe',

        // Asia/Pacific
        'אוסטרליה': 'au', 'Australia': 'au',
        'הודו': 'in', 'India': 'in',
        'דרום קוריאה': 'kr', 'South Korea': 'kr',
        'טייוואן': 'tw', 'Taiwan': 'tw',
        'תאילנד': 'th', 'Thailand': 'th',
        'וייטנאם': 'vn', 'Vietnam': 'vn',
        'סינגפור': 'sg', 'Singapore': 'sg',
        'ניו זילנד': 'nz', 'New Zealand': 'nz',

        // Middle East/Africa
        'מצרים': 'eg', 'Egypt': 'eg',
        'דרום אפריקה': 'za', 'South Africa': 'za',
        'איחוד האמירויות': 'ae', 'UAE': 'ae', 'United Arab Emirates': 'ae',
        'ערב הסעודית': 'sa', 'Saudi Arabia': 'sa',
    };

    const code = countryMap[countryName];
    if (!code) return null;

    // Use the specific paths provided
    return `/flags/${code}.png`;
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