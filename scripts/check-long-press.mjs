import assert from 'node:assert/strict';
import { canLongPress, movedPastSlop } from '../src/lib/longPress.js';

assert.equal(canLongPress({ isMobile: true, interactiveChild: false, button: 0 }), true);
assert.equal(canLongPress({ isMobile: false, interactiveChild: false }), false);
assert.equal(canLongPress({ isMobile: true, interactiveChild: true }), false);
assert.equal(canLongPress({ isMobile: true, interactiveChild: false, button: 2 }), false);
assert.equal(movedPastSlop(0, 0), false);
assert.equal(movedPastSlop(10, 0), false);
assert.equal(movedPastSlop(11, 0), true);
assert.equal(movedPastSlop(8, 8), true);

console.log('long-press checks ok');
