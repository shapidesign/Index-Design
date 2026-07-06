/** Minimal self-check for the search typo-tolerance helper. Run: node scripts/test-fuzzy.mjs */
import assert from 'node:assert';
import { withinOneEdit } from '../src/lib/utils.js';

assert(withinOneEdit('אלמוני', 'אלמוני'), 'identical');
assert(withinOneEdit('אלמומי', 'אלמוני'), 'substitution');
assert(withinOneEdit('אלמוני', 'אלמונים'), 'insertion');
assert(withinOneEdit('למוני', 'אלמוני'), 'deletion');
assert(!withinOneEdit('אלמימי', 'אלמוני'), 'two substitutions rejected');
assert(!withinOneEdit('פונט', 'צבעים'), 'unrelated rejected');
assert(!withinOneEdit('אב', 'אבגד'), 'length gap > 1 rejected');

console.log('fuzzy self-check: all assertions passed');
