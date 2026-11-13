import assert from 'node:assert/strict';
import { readConsent, writeConsent } from '../src/lib/clarityConsent.js';

const mem = {
  store: new Map(),
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  },
  setItem(key, value) {
    this.store.set(key, String(value));
  },
};

assert.equal(readConsent(mem), null);
assert.deepEqual(writeConsent('granted', mem, 1000), { choice: 'granted', at: 1000 });
assert.deepEqual(readConsent(mem), { choice: 'granted', at: 1000 });
writeConsent('denied', mem, 2000);
assert.equal(readConsent(mem).choice, 'denied');
mem.setItem('index-clarity-consent', 'nope');
assert.equal(readConsent(mem), null);
mem.setItem('index-clarity-consent', JSON.stringify({ choice: 'maybe' }));
assert.equal(readConsent(mem), null);
assert.throws(() => writeConsent('maybe', mem));
console.log('clarity consent ok');
