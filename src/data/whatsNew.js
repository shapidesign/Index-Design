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

const MAX_SLIDE_TEXT = 400;
const MAX_IMAGE_CHARS = 280000;

export function normalizeSlide(item) {
  const source = typeof item === 'string' ? { text: item, imageUrl: '' } : item;
  if (!source || typeof source !== 'object') return null;
  const text = String(source.text || '').replace(/\s+/g, ' ').trim().slice(0, MAX_SLIDE_TEXT);
  let imageUrl = String(source.imageUrl || source.image || '').trim();
  const allowed = /^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('data:image/');
  if (!allowed || imageUrl.length > MAX_IMAGE_CHARS) imageUrl = '';
  if (!text && !imageUrl) return null;
  return { text, imageUrl };
}

export function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeSlide).filter(Boolean).slice(0, 12);
}

/** Shrink a local image so a What's New slide stays small enough to store. */
export function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxEdge = 960;
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height, 1));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.82;
      let data = canvas.toDataURL('image/jpeg', quality);
      while (data.length > 200000 && quality > 0.45) {
        quality -= 0.08;
        data = canvas.toDataURL('image/jpeg', quality);
      }
      URL.revokeObjectURL(url);
      resolve(data.length > MAX_IMAGE_CHARS ? '' : data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image'));
    };
    image.src = url;
  });
}
