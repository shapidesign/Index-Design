import assert from 'node:assert/strict';
import { isAdminRoute } from '../src/lib/admin-route.js';
import { binHeat, buildAnalyticsEvent, pagePercent } from '../src/lib/analytics-event.js';
import { bumpVersion, normalizeItems } from '../src/data/whatsNew.js';

const click = buildAnalyticsEvent({
  kind: 'click',
  section: '  map ',
  label: '  hello   world  ',
  path: '/#/map',
  x: 150,
  y: -4,
});
assert.equal(click.kind, 'click');
assert.equal(click.section, 'map');
assert.equal(click.label, 'hello world');
assert.equal(click.x, 100);
assert.equal(click.y, 0);

assert.equal(buildAnalyticsEvent({ kind: 'nope' }), null);

const share = buildAnalyticsEvent({ kind: 'share', label: 'native' });
assert.equal(share.x, undefined);
assert.equal(share.section, 'home');
assert.equal(share.path, '/');

const point = pagePercent(25, 50, 100, 200);
assert.deepEqual(point, { x: 25, y: 25 });

const cells = binHeat([{ x: 0, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 0 }], 10, 16);
assert.equal(cells[0], 2);
assert.equal(cells[10 * 16 - 1], 1);
assert.equal(cells.reduce((sum, n) => sum + n, 0), 3);

assert.equal(isAdminRoute({ pathname: '/admin', hash: '' }), true);
assert.equal(isAdminRoute({ pathname: '/admin/', hash: '' }), true);
assert.equal(isAdminRoute({ pathname: '/', hash: '#/admin' }), true);
assert.equal(isAdminRoute({ pathname: '/', hash: '#/toolbox' }), false);
assert.equal(isAdminRoute({ pathname: '/administrator', hash: '' }), false);

assert.equal(bumpVersion('v6'), 'v7');
assert.equal(bumpVersion(''), 'v1');
assert.deepEqual(normalizeItems(['  a  ', '', '   ', 'b'.repeat(500)]), ['a', 'b'.repeat(400)]);

console.log('ok');
