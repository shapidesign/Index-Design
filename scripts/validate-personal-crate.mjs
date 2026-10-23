/** Personal Crate state, sanitization, HIT faculty data, and URL share/import self-check. Run: node scripts/validate-personal-crate.mjs */
import assert from 'node:assert';
import {
  MAX_FOLDER_NAME_LENGTH,
  TETRIS_COLORS,
  TETRIS_SHAPES,
  makeSavedKey,
  sanitizeCrate,
  encodeSharedFolder,
  decodeSharedFolder,
} from '../src/hooks/useSavedItems.js';
import {
  HIT_DESIGN_PROFESSORS,
  HIT_COURSES,
  HIT_STUDY_YEARS,
  SEED_STUDENT_WORKS,
} from '../src/data/hitFaculty.js';

// 1. Key formatting
assert.equal(makeSavedKey('toolbox', 'abc-123'), 'toolbox:abc-123');
assert.equal(makeSavedKey('dictionary', 'Frank Ruhl'), 'dictionary:Frank Ruhl');

// 2. Sanitization of corrupted / malformed crate state
const dirty = sanitizeCrate({
  folders: [
    { id: 'f-1', name: '  טיפוגרפיה ושלטים ארוכים מאוד מעבר למגבלה  ', color: 'invalidColor', shape: 'invalidShape' },
    { id: '', name: 'ShouldBeFiltered' },
  ],
  items: {
    'toolbox:item1': {
      sectionId: 'toolbox',
      itemId: 'item1',
      folderIds: ['f-1', 'non-existent-folder'],
      note: 'הערה לבדיקה',
      snapshot: {
        titleHe: 'Fontjoy',
        tags: ['פונטים', 'AI'],
      },
    },
    brokenItem: { sectionId: '', itemId: null },
  },
  userProfile: {
    name: '  נועה לוי  ',
    email: 'noa@gmail.com',
    studyYear: 'שנה ב׳',
  },
});

assert.equal(dirty.folders.length, 1);
assert(dirty.folders[0].name.length <= MAX_FOLDER_NAME_LENGTH, 'folder name must respect max length constraint');
assert(TETRIS_COLORS.includes(dirty.folders[0].color), 'invalid folder color must fall back to valid Tetris color');
assert(TETRIS_SHAPES.includes(dirty.folders[0].shape), 'invalid folder shape must fall back to valid Tetris shape');
assert.deepEqual(dirty.items['toolbox:item1'].folderIds, ['f-1'], 'dangling folder references must be stripped');
assert.equal(dirty.items.brokenItem, undefined, 'broken items must be stripped');
assert.equal(dirty.userProfile.name, 'נועה לוי');

// Verify empty folders array stays empty (so deleting all folders persists)
const emptyDeleted = sanitizeCrate({ folders: [], items: {} });
assert.equal(emptyDeleted.folders.length, 0, 'empty folders array must remain empty after deletion');

// 3. Round-trip Hebrew + English folder URL encoding & decoding
const sampleFolder = { id: 'f-typo', name: 'טיפוגרפיה א׳', color: 'purple', shape: 'T' };
const sampleItems = [
  {
    sectionId: 'dictionary',
    itemId: 'Frank Ruhl',
    note: 'להשתמש בכותרות להגשה',
    snapshot: {
      titleHe: 'פרנק ריהל',
      titleEn: 'Frank Ruhl',
      description: 'פונט סריפי קלאסי',
      link: 'https://alefalefalef.co.il',
      image: '',
      tags: ['סריף', 'קלאסי'],
      badge: 'אאא',
    },
  },
];

const encoded = encodeSharedFolder(sampleFolder, sampleItems);
assert(encoded.length > 10, 'encoded string should not be empty');
assert(!encoded.includes('+') && !encoded.includes('/'), 'encoded string must be URL-safe');

const decoded = decodeSharedFolder(encoded);
assert(decoded, 'decoded payload must not be null');
assert.equal(decoded.name, 'טיפוגרפיה א׳');
assert.equal(decoded.color, 'purple');
assert.equal(decoded.shape, 'T');
assert.equal(decoded.items.length, 1);
assert.equal(decoded.items[0].sectionId, 'dictionary');
assert.equal(decoded.items[0].itemId, 'Frank Ruhl');
assert.equal(decoded.items[0].note, 'להשתמש בכותרות להגשה');
assert.equal(decoded.items[0].snapshot.titleHe, 'פרנק ריהל');

assert.equal(decodeSharedFolder('not-valid-base64-$$$'), null);

// 4. HIT Design Faculty & Museum Data
assert(HIT_DESIGN_PROFESSORS.length >= 25, 'should include HIT design professors from phonebook');
assert(HIT_DESIGN_PROFESSORS.some((p) => p.includes('ארז בכר')), 'should include head of Visual Communication Ereznf Bachar');
assert(HIT_DESIGN_PROFESSORS.some((p) => p.includes('עודד עזר')), 'should include Prof. Oded Ezer');
assert(HIT_COURSES.length >= 10, 'should include HIT Visual Communication courses');
assert.equal(HIT_STUDY_YEARS.length, 5);
assert(SEED_STUDENT_WORKS.length >= 5, 'should include seeded student works');

console.log('personal-crate & HIT museum self-check: all assertions passed');
