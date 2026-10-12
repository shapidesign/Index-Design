/**
 * One check for the HIT catalog mapper.
 * Run: node scripts/check-catalog-map.mjs
 */

import assert from 'node:assert/strict';
import {
  mapPrimoDoc,
  parseCatalogQuery,
  buildCatalogSearchUrl,
  buildPrimoApiUrl,
} from '../src/lib/catalog.js';

const availableBook = {
  context: 'L',
  pnx: {
    display: {
      type: ['book'],
      title: ['צבי נרקיס : טיפוגרפיה ועיצוב '],
      creationdate: ['2025'],
      creator: ['חפשי, יהודה מחבר$$Qחפשי, יהודה'],
      contributor: ['זקין, איל, עורך$$Qזקין, איל'],
      publisher: ['ישראל : אסיה'],
      identifier: ['$$CISBN$$V9789657434611'],
      lds02: ['\u202a766(569.4) נרק (חופ)'],
      mms: ['99930783406866'],
    },
    control: { recordid: ['alma99930783406866'] },
    addata: { isbn: ['9789657434611'], date: ['2025'] },
    sort: { creationdate: ['2025'], author: ['חפשי, יהודה מחבר'] },
  },
  delivery: {
    bestlocation: {
      availabilityStatus: 'available',
      callNumber: '766(569.4) נרק (חופ)',
    },
    availability: ['available_in_library'],
  },
};

const noDelivery = {
  pnx: {
    display: {
      type: ['journal'],
      title: ['Design '],
      contributor: ['עזרא, נדב$$Qעזרא, נדב'],
      creationdate: ['2010?'],
      identifier: ['$$CISBN$$V1'],
    },
    control: { recordid: ['alma990000305360206866'] },
    sort: { creationdate: ['2010'] },
  },
};

const mapped = mapPrimoDoc(availableBook);
assert.equal(mapped.author, 'חפשי, יהודה');
assert.equal(mapped.year, '2025');
assert.equal(mapped.type, 'ספר');
assert.equal(mapped.callNumber, '766(569.4) נרק (חופ)');
assert.equal(mapped.availability, 'זמין בספרייה');
assert.equal(mapped.coverUrl, 'https://covers.openlibrary.org/b/isbn/9789657434611-M.jpg');
assert.equal(mapped.title, 'צבי נרקיס : טיפוגרפיה ועיצוב');
assert.match(mapped.link, /docid=alma99930783406866/);
assert.match(mapped.link, /search_scope=HIT_BOOKS/);
assert.match(mapped.link, /tab=HIT_BOOKS/);

const fallback = mapPrimoDoc(noDelivery);
assert.equal(fallback.author, 'עזרא, נדב');
assert.equal(fallback.availability, 'בדקו זמינות');
assert.equal(fallback.type, 'כתב עת');
assert.equal(fallback.coverUrl, '');
assert.equal(fallback.year, '2010');

const cleaned = parseCatalogQuery({ q: '  טיפ,וגרפיה  ', offset: '20' });
assert.equal(cleaned.q, 'טיפ וגרפיה');
assert.equal(cleaned.offset, 20);
assert.equal(cleaned.limit, 10);
assert.equal(parseCatalogQuery({ q: 'א' }).error, 'הקלידו לפחות שתי אותיות');
assert.equal(parseCatalogQuery({ q: 'design', offset: '99999' }).offset, 990);

const searchUrl = buildCatalogSearchUrl('טיפ,וגרפיה', 10);
assert.match(searchUrl, /search_scope=HIT_BOOKS/);
assert.match(searchUrl, /query=any%2Ccontains%2C/);
assert.doesNotMatch(searchUrl, /טיפ%2C/);

const apiUrl = buildPrimoApiUrl(cleaned);
assert.match(apiUrl, /\/primaws\/rest\/pub\/pnxs\?/);
assert.match(apiUrl, /scope=HIT_BOOKS/);
assert.match(apiUrl, /skipDelivery=N/);

console.log('catalog mapper ok');
