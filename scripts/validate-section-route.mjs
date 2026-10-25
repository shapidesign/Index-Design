import assert from 'node:assert/strict';
import { sectionStaysMounted } from '../src/lib/section-route.js';

assert.equal(sectionStaysMounted('toolbox', 'toolbox', {}), true);
assert.equal(sectionStaysMounted('toolbox', 'saved', { toolbox: true }), true);
assert.equal(sectionStaysMounted('toolbox', 'saved', {}), false);
assert.equal(sectionStaysMounted('keyboard', 'saved', { keyboard: true }), false);
assert.equal(sectionStaysMounted('keyboard', 'keyboard', {}), true);
assert.equal(sectionStaysMounted('saved', 'toolbox', { saved: true }), true);

console.log('section-route ok');
