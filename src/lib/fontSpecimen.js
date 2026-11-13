/**
 * Specimen words + the few faces the browser can actually draw.
 *
 * ponytail: live text only for Miriam Libre (Google Fonts) and Ezer Type House
 * files that send Access-Control-Allow-Origin: *. Other foundries block
 * cross-origin fonts, so those cards keep the preview image.
 * Ceiling: a renamed Ezer file or a moved Miriam Libre URL falls back to the image.
 * Upgrade: add a foundry here once its webfont URL is stable and CORS-open.
 */

const SAMPLE_WORDS = [
  'אור', 'בית', 'גשר', 'דגל', 'זית', 'חלב', 'כפר', 'ליל', 'מלך',
  'נפש', 'ספר', 'עיר', 'פרי', 'צבע', 'קול', 'רוח', 'תמר', 'אבן',
];

const MIRIAM_LIBRE = {
  family: 'Miriam Libre',
  src: 'https://fonts.gstatic.com/s/miriamlibre/v19/DdT0798HsHwubBAqfkcBTL_1a7sPlXcE8PJjH9P3k9s.ttf',
};

/** URL slug -> [folder, weight] on the foundry's public specimen CDN. */
const EZER_FACES = {
  'neve-zedeq': ['Nevezedeq', 'Regular'],
  ezeraugust: ['Ezeraugust', 'Regular'],
  ezereuro: ['EzerEuro', 'Regular'],
  ezeralchemist: ['Ezeralchemist', 'Regular'],
  ezeranemia: ['EzerAnemia', 'Regular'],
  ezeractual: ['Ezeractual', 'Regular'],
  ezerexperimenta: ['Ezerexperimenta', 'Regular'],
  ezerbasic: ['EzerBasic', 'Regular'],
  ezerblock: ['Ezerblock', 'Regular'],
  ezerdoo: ['Ezerdoo', 'Regular'],
  ezerdialogue: ['EzerDialogue', 'Regular'],
  ezerhillel: ['Ezerhillel', 'Regular'],
  ezertortellini: ['Ezertortellini', 'Regular'],
  ezerloft: ['Ezerloft', 'Regular'],
  ezermeodedsans: ['Ezermeodedsans', 'Regular'],
  ezermeodedserif: ['Ezermeodedserif', 'Regular'],
  ezermeodedpashut: ['Ezermeodedpashut', 'Regular'],
  ezermeodedpashutcondenced: ['Ezermeodedpashutcondenced', 'Regular'],
  ezerna: ['Ezerna', 'Regular'],
  ezersolid: ['EzerSolid', 'Regular'],
  ezersusita: ['Ezersusita', 'Regular'],
  ezerstandard: ['EzerStandard', 'Regular'],
  ezerfranzisca: ['Ezerfranzisca', 'Regular'],
  ezerfrankruhlya: ['Ezerfrankruhlya', 'Regular'],
  ezerkadim: ['Ezerkadim', 'ClassicNormal'],
  ezerkashiach: ['Ezerkashiach', 'Regular'],
  ezerrutz: ['Ezerrutz', 'Regular'],
  ezershalvata: ['Ezershalvata', 'Regular'],
  ezershemesh: ['Ezershemesh', 'Regular'],
  ezertaagid: ['Ezertaagid', 'Regular'],
  palastina: ['Palestina', 'Regular'],
};

export function sampleWord(key) {
  const s = String(key || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return SAMPLE_WORDS[(h >>> 0) % SAMPLE_WORDS.length];
}

export function specimenFace(font) {
  if (font?.lat === 'Miriam Libre') return MIRIAM_LIBRE;
  if (font?.fo !== 'ezer') return null;
  const slug = String(font.url || '').split('/').filter(Boolean).pop();
  const hit = EZER_FACES[slug];
  if (!hit) return null;
  const [folder, weight] = hit;
  return {
    family: `idx-${slug}`,
    src: `https://ezertypehouse.netlify.app/fonts/${folder}/${folder}-${weight}.woff2`,
  };
}
