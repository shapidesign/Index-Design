/** Personal Crate state, sanitization, HIT faculty data, and URL share/import self-check. Run: node scripts/validate-personal-crate.mjs */
import assert from 'node:assert';
import fs from 'node:fs';
import {
  MAX_FOLDER_NAME_LENGTH,
  TETRIS_COLORS,
  TETRIS_SHAPES,
  makeSavedKey,
  sanitizeCrate,
  sanitizeProfilePatch,
  encodeSharedFolder,
  decodeSharedFolder,
} from '../src/hooks/useSavedItems.js';
import { legacyHashToPath, sectionIdFromPathname } from '../src/lib/section-route.js';
import { currentAppUrl, hasAuthCallback } from '../src/lib/auth-redirect.js';
import {
  HIT_DESIGN_PROFESSORS,
  HIT_COURSES,
  HIT_STUDY_YEARS,
} from '../src/data/hitFaculty.js';
import { normalizeItems } from '../src/data/whatsNew.js';
import { displayNameFromUser, sanitizePlaceTags } from '../api/map-reviews.js';

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

const renamed = sanitizeProfilePatch({ name: '  נועה   לוי  ', studyYear: 'שנה ג׳' });
assert.equal(renamed.ok, true);
assert.equal(renamed.name, 'נועה לוי');
assert.equal(renamed.studyYear, 'שנה ג׳');
assert.equal(sanitizeProfilePatch({ name: ' ', studyYear: 'שנה א׳' }).ok, false);
assert.equal(sanitizeProfilePatch({ name: 'דנה', studyYear: '1990' }).ok, false);

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
assert(!fs.readFileSync(new URL('../src/data/hitFaculty.js', import.meta.url), 'utf8').includes('SEED_STUDENT_WORKS'), 'sample student works must stay deleted');
assert.deepEqual(normalizeItems(['  שלום  ', { text: 'עוד', imageUrl: 'https://example.com/a.png' }, { text: '', imageUrl: 'javascript:alert(1)' }]), [
  { text: 'שלום', imageUrl: '' },
  { text: 'עוד', imageUrl: 'https://example.com/a.png' },
]);
assert.deepEqual(sanitizePlaceTags(['  דפוס  ', 'דפוס', '', 'א'.repeat(50), 'עוד']), ['דפוס', 'א'.repeat(40), 'עוד']);
assert.equal(displayNameFromUser({ user_metadata: { full_name: 'דנה כהן' }, email: 'a@b.com' }), 'דנה כהן');

// 5. Guard: HIT Viscom logo and moving Eye remain hidden until explicitly requested
const headerSrc = fs.readFileSync(new URL('../src/components/layout/Header.jsx', import.meta.url), 'utf8');
const footerSrc = fs.readFileSync(new URL('../src/components/layout/Footer.jsx', import.meta.url), 'utf8');
const appSrc = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert.equal(legacyHashToPath('#/toolbox'), '/toolbox');
assert.equal(legacyHashToPath('#/saved?import=abc'), '/saved?import=abc');
assert.equal(legacyHashToPath('#access_token=xyz'), null);
assert.equal(sectionIdFromPathname('/saved', ['saved', 'toolbox']), 'saved');
assert.equal(sectionIdFromPathname('/', ['saved']), null);

assert.equal(
  currentAppUrl({ origin: 'https://www.designindex.io', pathname: '/saved', search: '?import=abc' }),
  'https://www.designindex.io/saved?import=abc'
);
assert.equal(hasAuthCallback({ search: '?code=abc', hash: '' }), true);
assert.equal(hasAuthCallback({ search: '', hash: '#access_token=xyz' }), true);
assert.equal(hasAuthCallback({ search: '', hash: '' }), false);

const personalSrc = fs.readFileSync(new URL('../src/components/sections/PersonalSection.jsx', import.meta.url), 'utf8');
const personalSettingsReady = () =>
  personalSrc.includes('עריכת פרופיל') &&
  personalSrc.includes('updateUserProfile') &&
  personalSrc.includes('שמור פרופיל') &&
  personalSrc.includes('id="profile-email"') &&
  personalSrc.includes('readOnly');
assert(personalSettingsReady(), 'profile editor must be wired into the drawer');
const museumSrc = fs.readFileSync(new URL('../src/components/sections/MuseumSection.jsx', import.meta.url), 'utf8');
const buttonSrc = fs.readFileSync(new URL('../src/components/ui/GoogleSignInButton.jsx', import.meta.url), 'utf8');
assert(personalSrc.includes('<GoogleSignInButton />'), 'saved drawer must start Google sign-in directly');
assert(!personalSrc.includes('התחברות באימייל'), 'saved drawer must not offer email-code sign-in');
assert(!personalSrc.includes('signInWithOtp'), 'saved drawer must not send email codes');
assert(museumSrc.includes('התחבר עם Google והעלה עבודה'), 'museum upload must start Google sign-in directly');
assert(!museumSrc.includes('SEED_STUDENT_WORKS'), 'museum must not show seeded sample works');
assert(museumSrc.includes('createPortal'), 'museum upload must open in a modal');
assert(museumSrc.includes('המוזיאון עדיין ריק'), 'empty museum must explain that only uploaded works appear');
const mapModalSrc = fs.readFileSync(new URL('../src/components/ui/MapReviewModal.jsx', import.meta.url), 'utf8');
assert(mapModalSrc.includes('GoogleSignInButton'), 'map comments must offer Google sign-in');
assert(mapModalSrc.includes('Authorization'), 'map comments must send the Google session');
assert(fs.readFileSync(new URL('../api/map-reviews.js', import.meta.url), 'utf8').includes('requireUser'), 'map review API must require a user');
assert(fs.readFileSync(new URL('../src/components/ui/WhatsNewModal.jsx', import.meta.url), 'utf8').includes('שקופית הבאה'), 'whats new must be a carousel');
assert(!museumSrc.includes('התחברות באימייל'), 'museum must not offer email-code sign-in');
assert(buttonSrc.includes('signInWithGoogle'), 'sign-in button must call Google OAuth');
assert.equal(fs.existsSync(new URL('../src/components/ui/GoogleEmailAuthPanel.jsx', import.meta.url)), false);

assert(headerSrc.includes('const SHOW_HIT_LOGO = false;'), 'Header must keep SHOW_HIT_LOGO = false');
assert(headerSrc.includes('<ThemeToggle />'), 'Header must include the light/dark toggle');
assert(fs.existsSync(new URL('../src/components/ui/ThemeToggle.jsx', import.meta.url)));
assert(footerSrc.includes('const SHOW_HIT_LOGO = false;'), 'Footer must keep SHOW_HIT_LOGO = false');
assert(appSrc.includes('const SHOW_EYE = false;'), 'App must keep SHOW_EYE = false');

console.log('personal-crate & HIT museum self-check: all assertions passed');
