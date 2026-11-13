/** Self-check for font specimen word + face lookup. Run: node scripts/test-font-specimen.mjs */
import assert from 'node:assert';
import { sampleWord, specimenFace } from '../src/lib/fontSpecimen.js';

const word = sampleWord('ezer-block');
assert.strictEqual(word, sampleWord('ezer-block'), 'word stays put for a font');
assert.strictEqual([...word].length, 3, 'specimen word is three letters');
const seen = new Set(['aaa', 'ploni', 'ezer-block', 'miriam-libre', 'almoni', 'sec'].map(sampleWord));
assert.ok(seen.size > 1, 'fonts do not all share one word');

const block = specimenFace({
  fo: 'ezer',
  lat: 'Ezer Block',
  url: 'https://www.ezertypehouse.com/fonts/ezerblock',
});
assert.strictEqual(block.family, 'idx-ezerblock');
assert.match(block.src, /Ezerblock-Regular\.woff2$/);

const kadim = specimenFace({
  fo: 'ezer',
  lat: 'Ezer Kadim',
  url: 'https://www.ezertypehouse.com/fonts/ezerkadim',
});
assert.match(kadim.src, /Ezerkadim-ClassicNormal\.woff2$/);

assert.strictEqual(
  specimenFace({ fo: 'ezer', lat: 'Ezer Alchemist Italic', url: 'https://www.ezertypehouse.com/fonts/ezeralchemistitalic' }),
  null,
  'missing file stays on the preview image',
);

assert.strictEqual(specimenFace({ fo: 'aaa', lat: 'Ploni', url: 'https://alefalefalef.co.il/font/ploni/' }), null);

const miriam = specimenFace({ fo: 'hagilda', lat: 'Miriam Libre', url: 'https://hagilda.com/miriam-libre/' });
assert.strictEqual(miriam.family, 'Miriam Libre');
assert.match(miriam.src, /^https:\/\/fonts\.gstatic\.com\//);

console.log('font specimen self-check: all assertions passed');
