/** Catalog, quiz, and progress self-check. Run: node scripts/validate-shortcuts.mjs */
import assert from 'node:assert';
import {
  APPS,
  ARROW_KEYS,
  KEYBOARD,
  KEYS,
  SHORTCUTS,
  applyAnswer,
  dayStreak,
  earnedBadges,
  emptyProgress,
  quizChoices,
  recordQuiz,
  sanitizeProgress,
} from '../src/data/shortcuts.js';

const HEBREW = /[\u0590-\u05FF]/;
const layoutOf = (platform) =>
  new Set([...KEYBOARD[platform].flat(), ...ARROW_KEYS].filter((key) => key !== 'gap'));

assert.equal(KEYS.k.he, 'ל');
assert.equal(KEYS.a.he, 'ש');
assert.equal(KEYS.q.he, '/');
assert.equal(KEYS.comma.he, 'ת');
assert.equal(KEYS.period.he, 'ץ');
assert.notEqual(KEYS.k.he, 'קיי');
assert.equal(APPS.length, 8);
APPS.forEach((app) => {
  assert(HEBREW.test(app.he), `${app.id} needs a Hebrew name`);
  const items = SHORTCUTS.filter((item) => item.app === app.id);
  assert(items.length >= 8, `${app.id} needs a useful shortcut set`);
});

['mac', 'win'].forEach((platform) => {
  const layout = layoutOf(platform);
  SHORTCUTS.forEach((item) => {
    assert(HEBREW.test(item.label), `${item.id} needs a Hebrew action`);
    assert(item.category && item.mac.length > 0 && item.win.length > 0, item.id);
    item[platform].forEach((key) => {
      assert(KEYS[key], `${item.id} uses unknown key ${key}`);
      assert(layout.has(key), `${item.id} ${platform} key ${key} is not on the keyboard`);
    });
  });
  const seen = new Map();
  SHORTCUTS.forEach((item) => {
    const combo = item[platform].join('+');
    const bucket = `${item.app}:${combo}`;
    assert(!seen.has(bucket), `duplicate ${platform} combo ${bucket}`);
    seen.set(bucket, item.id);
  });
});

assert(
  SHORTCUTS.some((item) => item.mac.join('+') !== item.win.join('+')),
  'at least one shortcut must differ between platforms'
);

let seed = 0;
const random = () => {
  seed = (seed + 3) % 10;
  return seed / 10;
};
const sample = SHORTCUTS.find((item) => item.id === 'pp-group');
const choices = quizChoices(sample, 'win', SHORTCUTS, random);
assert.equal(choices.length, 4);
assert.equal(choices.filter((choice) => choice.correct).length, 1);
assert.equal(new Set(choices.map((choice) => choice.keys.join('+'))).size, 4);
assert(choices.some((choice) => choice.correct && choice.keys.join('+') === 'ctrl+g'));

let progress = emptyProgress();
progress = applyAnswer(progress, {
  shortcutId: 'ps-undo',
  correct: true,
  platform: 'mac',
  date: new Date(2026, 9, 11),
});
progress = applyAnswer(progress, {
  shortcutId: 'ps-brush',
  correct: true,
  platform: 'win',
  date: new Date(2026, 9, 13),
});
progress = applyAnswer(progress, {
  shortcutId: 'ps-save',
  correct: false,
  platform: 'win',
  date: new Date(2026, 9, 13),
});
assert.equal(progress.correct, 2);
assert.equal(progress.attempts, 3);
assert.equal(progress.streak, 0);
assert.equal(progress.bestStreak, 2);
assert.equal(progress.mastered['ps-undo'], true);
assert.equal(progress.mastered['ps-save'], undefined);
assert.equal(dayStreak(progress.days, new Date(2026, 9, 13)), 1);
assert.equal(dayStreak(['2026-10-11', '2026-10-12', '2026-10-13'], new Date(2026, 9, 13)), 3);

progress = recordQuiz(progress, { answered: 5, correct: 5 });
assert.equal(progress.perfectQuizzes, 1);
assert.equal(recordQuiz(emptyProgress(), { answered: 4, correct: 4 }).perfectQuizzes, 0);

const badges = earnedBadges(progress, SHORTCUTS);
assert(badges.some((badge) => badge.id === 'first'));
assert(badges.some((badge) => badge.id === 'both'));
assert(badges.some((badge) => badge.id === 'perfect'));

const photoshop = SHORTCUTS.filter((item) => item.app === 'photoshop');
let mastered = emptyProgress();
photoshop.forEach((item) => {
  mastered = applyAnswer(mastered, { shortcutId: item.id, correct: true, platform: 'mac' });
});
assert(earnedBadges(mastered, SHORTCUTS).some((badge) => badge.id === 'app'));
assert(!earnedBadges(mastered, SHORTCUTS).some((badge) => badge.id === 'all'));

const dirty = sanitizeProgress({ attempts: -3, correct: 1.9, mastered: { 'ps-undo': true, bad: false }, days: ['2026-10-13', 4] });
assert.equal(dirty.attempts, 0);
assert.equal(dirty.correct, 1);
assert.deepEqual(dirty.mastered, { 'ps-undo': true });
assert.deepEqual(dirty.days, ['2026-10-13']);

console.log(`shortcut self-check: ${SHORTCUTS.length} shortcuts passed`);
