export const WHATS_NEW_SEEN_PREFIX = 'index-whats-new-seen-';

export const FALLBACK_WHATS_NEW = {
  version: 'v6',
  title: 'מה חדש אצלנו?',
  enabled: true,
  items: [
    'הוספנו מקלדת: קיצורי מקלדת לתוכנות עיצוב, הדגשה חיה של המקשים, תרגול וחידון.',
    'הוספנו 8 כלים חדשים: 2 בטיפוגרפיה, 2 ב-UX, ועוד כלים לצילום, לצבע, לעיבוד תמונה ולקיצורי מקלדת.',
    'הוספנו ממשק לספרייה של HIT בצורה נוחה למשתמש.',
    'נוספו פונטים חדשים למילון, בהם עזר דיאלוג, אקסיומה, רקיע, שפגאט ומשפחת ריזינגר.',
    'נוספו פונטים מבית Nomad: קלדנית, ספרא, מידל איסט, יפה נפש, דולומיט, Kilo Text, Kilo Display, Dear AI, The Bizarre, Werd, Romanisch Spitz ו־Sugar.',
  ],
};

export function bumpVersion(version) {
  const n = Number(String(version || '').match(/\d+/)?.[0] || 0);
  return `v${n + 1}`;
}

export function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => String(item || '').replace(/\s+/g, ' ').trim().slice(0, 400))
    .filter(Boolean)
    .slice(0, 30);
}
