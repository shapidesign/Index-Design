/**
 * Batch Update Notion URLs
 * Resolves real URLs from site names and updates the Notion database.
 * Run: node scripts/batch-update-urls.js
 */

import 'dotenv/config';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATASOURCE_ID = process.env.NOTION_DATASOURCE_ID;
const NOTION_VERSION = '2025-09-03';
const NOTION_BASE = 'https://api.notion.com/v1';

/**
 * Manual URL mapping built from the Google Sheet + known domains.
 * Key = the current URL field value (or the resource name), Value = real URL.
 */
const URL_MAP = {
  // From Google Sheet column C → real URL
  'WebGL Fluid Simulation': 'https://paveldogreat.github.io/WebGL-Fluid-Simulation/',
  'Viewport UI': 'https://www.viewport-ui.com/',
  'Velvetyne': 'https://velvetyne.fr/',
  'Unsplash': 'https://unsplash.com/',
  'Unicorn Studio': 'https://www.unicorn.studio/',
  'UNCUT.wtf': 'https://uncut.wtf/',
  'Tailwind CSS Color Generator': 'https://uicolors.app/',
  'UI Ball': 'https://uiball.com/',
  'Typeverything': 'https://typeverything.com/',
  'Typeface Animator': 'https://www.typefaceanimator.com/',
  'Type Dither': 'https://www.typedither.com/',
  'Tooooools.app': 'https://tooooools.app/',
  'Thiings': 'https://www.thiings.co/',
  'The Noun Project': 'https://thenounproject.com/',
  'The HTML Review': 'https://thehtml.review/',
  'Branding Style Guides': 'https://brandingstyleguides.com/',
  'Texture Labs': 'https://texturelabs.org/',
  'Swissted': 'https://www.swissted.com/',
  'SVG Repo': 'https://www.svgrepo.com/',
  'Spline': 'https://spline.design/',
  'Spiral Betty': 'https://spiralbetty.com/',
  'Silk': 'https://weavesilk.com/',
  'Shapelax | Figma': 'https://www.figma.com/community/plugin/shapelax',
  'Tools': 'https://tools.schultzschultz.com/',
  'Savee': 'https://savee.it/',
  'Same Energy': 'https://same.energy/',
  'Rive': 'https://rive.app/',
  'Recraft | AI': 'https://www.recraft.ai/',
  'Ransom Note Generator': 'https://www.ransomizer.com/',
  'Procedural Crowds - Superhive (formerly Blender Market)': 'https://extensions.blender.org/add-ons/procedural-crowds/',
  'Poline — Esoteric Color Palette Generation Library': 'https://meodai.github.io/poline/',
  'PNG Maker AI': 'https://pngmaker.ai/',
  'Pigment': 'https://pigment.shapefactory.co/',
  'Pexels': 'https://www.pexels.com/',
  'Pacdora': 'https://www.pacdora.com/',
  'Mosh-Pro': 'https://moshpro.app/',
  'Mooodboard': 'https://www.mooodboard.com/',
  'Modyfi': 'https://www.modyfi.com/',
  'Mockups Design': 'https://mockups-design.com/',
  'Mockup.Maison': 'https://mockup.maison/',
  'Minimal Mockups': 'https://www.minimalmockups.com/',
  'Minimal Gallery': 'https://minimalgallery.com/',
  'Metalabel': 'https://www.metalabel.com/',
  'Metaflop': 'https://www.metaflop.com/',
  'Meshy AI': 'https://www.meshy.ai/',
  'Maneken.app': 'https://maneken.app/',
  'Icons – Lucide': 'https://lucide.dev/',
  'Logo Rank - Check your logo design with deep learning': 'https://brandmark.io/logo-rank/',
  'LogoLounge': 'https://www.logolounge.com/',
  'Logo Concept Design Awards': 'https://www.logoed.co.uk/',
  'Logobook': 'https://www.logobook.com/',
  'Logoroom - Creative Branding Studio': 'https://www.logoroom.co/',
  'Logggos': 'https://www.logggos.club/',
  'Life of Pix': 'https://www.lifeofpix.com/',
  'Khroma - The AI color tool for designers': 'https://www.khroma.co/',
  'Kern Type': 'https://type.method.ac/',
  'Jitter': 'https://jitter.video/',
  "It's Nice That": 'https://www.itsnicethat.com/',
  'Infography': 'https://infography.in/',
  'Bitmap sorter by larixk': 'https://larixk.nl/experiments/sort/',
  'Hugeicons': 'https://hugeicons.com/',
  'Heroicons': 'https://heroicons.com/',
  'GSAP': 'https://gsap.com/',
  'Google Earth Studio': 'https://earth.google.com/studio/',
  'Godly': 'https://godly.website/',
  'Geometrize': 'https://www.geometrize.co.uk/',
  'Fuse.kiwi': 'https://fuse.kiwi/',
  'Free Faces': 'https://www.freefaces.gallery/',
  'Fountn': 'https://fountn.io/',
  'Fontshare': 'https://www.fontshare.com/',
  'Font Brief': 'https://www.fontbrief.com/',
  'FLORA': 'https://flora.fauna.ai/',
  'Anything World': 'https://www.everything.universe/',
  'Enfont Terrible': 'https://enfontterrible.com/',
  'DESIGNERCIZE': 'https://designercize.com/',
  'Design Spells': 'https://www.designspells.com/',
  'Death to Stock': 'https://deathtothestockphoto.com/',
  'Dark Mode Design': 'https://www.darkmodedesign.com/',
  'Curation of Curations': 'https://curationofcurations.com/',
  'Cosmos': 'https://www.cosmos.so/',
  'Coolors': 'https://coolors.co/',
  'Constraint Systems': 'https://constraint.systems/',
  'Color Space': 'https://mycolor.space/',
  'Color Hunt': 'https://colorhunt.co/',
  'Color Disruptions': 'https://colordisruptions.com/',
  'Draw all roads in a city at once': 'https://anvaka.github.io/city-roads/',
  'British Library | Flickr': 'https://www.flickr.com/photos/britishlibrary/',
  'Brands In Motion': 'https://www.brandsinmotion.net/',
  'Internet Archive Book Images | Flickr': 'https://www.flickr.com/photos/internetarchivebookimages/',
  'Anime.js': 'https://animejs.com/',
  'Cargo': 'https://cargo.site/',

  // Name-based fallbacks (for entries where current url = name)
  'Enfont Terrible_name': 'https://enfontterrible.com/',
  'City Roads_name': 'https://anvaka.github.io/city-roads/',
  'Google Earth Studio_name': 'https://earth.google.com/studio/',
  'Fountn_name': 'https://fountn.io/',
  'Pexels_name': 'https://www.pexels.com/',
  'Mockup Maison_name': 'https://mockup.maison/',
  'The branding style guide_name': 'https://brandingstyleguides.com/',
  'Mockups Design_name': 'https://mockups-design.com/',
  'UI Colors_name': 'https://uicolors.app/',
  'Design Spells_name': 'https://www.designspells.com/',
  'Logggos_name': 'https://www.logggos.club/',
  'Rive_name': 'https://rive.app/',
};

/**
 * Try to resolve a URL from the current value and name.
 */
function resolveUrl(currentUrl, name) {
  // Already a proper URL
  if (currentUrl && currentUrl.startsWith('http')) return null; // no update needed

  // Try the current URL value as a key first (this matches the Google Sheet link text)
  if (currentUrl && URL_MAP[currentUrl]) return URL_MAP[currentUrl];

  // Try the name as a key
  if (URL_MAP[name]) return URL_MAP[name];

  // Try name-based fallback
  if (URL_MAP[`${name}_name`]) return URL_MAP[`${name}_name`];

  // Can't resolve
  return undefined;
}

/**
 * Fetch all pages from Notion
 */
async function fetchAllPages() {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const body = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;

    const response = await fetch(`${NOTION_BASE}/data_sources/${DATASOURCE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Fetch error:', data);
      break;
    }

    allPages.push(...data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  return allPages;
}

/**
 * Update a single page's URL property
 */
async function updatePageUrl(pageId, url) {
  const response = await fetch(`${NOTION_BASE}/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        'קישור': {
          url: url,
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Update failed for ${pageId}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Fetching all entries from Notion...');
  const pages = await fetchAllPages();
  console.log(`   Found ${pages.length} entries\n`);

  // Analyze and prepare updates
  const updates = [];
  const alreadyGood = [];
  const unresolved = [];

  for (const page of pages) {
    const props = page.properties || {};
    const name = props['שם']?.title?.[0]?.plain_text || '(unnamed)';
    const currentUrl = props['קישור']?.url || '';

    if (currentUrl.startsWith('http')) {
      alreadyGood.push({ name, url: currentUrl });
      continue;
    }

    const resolvedUrl = resolveUrl(currentUrl, name);
    if (resolvedUrl) {
      updates.push({ id: page.id, name, oldUrl: currentUrl, newUrl: resolvedUrl });
    } else if (currentUrl || name) {
      unresolved.push({ name, currentUrl });
    }
  }

  console.log(`✅ Already have proper URLs: ${alreadyGood.length}`);
  console.log(`🔄 Will update: ${updates.length}`);
  console.log(`❓ Unresolved: ${unresolved.length}\n`);

  if (unresolved.length > 0) {
    console.log('Unresolved entries:');
    for (const entry of unresolved) {
      console.log(`   "${entry.name}" (current: "${entry.currentUrl}")`);
    }
    console.log('');
  }

  // Execute updates with rate limiting (3 requests per second for Notion API)
  if (updates.length === 0) {
    console.log('No updates needed!');
    return;
  }

  console.log('📝 Starting batch update...\n');
  let success = 0;
  let failed = 0;

  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    try {
      await updatePageUrl(update.id, update.newUrl);
      success++;
      console.log(`  [${i + 1}/${updates.length}] ✅ ${update.name}: ${update.newUrl}`);
    } catch (error) {
      failed++;
      console.error(`  [${i + 1}/${updates.length}] ❌ ${update.name}: ${error.message}`);
    }

    // Rate limit: Notion allows ~3 req/s, wait 350ms between requests
    if (i < updates.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  console.log(`\n🎮 Done! Updated: ${success}, Failed: ${failed}, Skipped (already good): ${alreadyGood.length}`);
}

main().catch(console.error);
