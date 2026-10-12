/**
 * One-time scraper: builds specimen preview images for the מילון font index.
 *
 * Strategies per foundry:
 *  - HTML image extraction (fontimonim, alefalefalef, ezertypehouse, hafontia, reisinger, nomad)
 *  - Playwright page screenshot fallback (hagilda, fontef - specimens are live webfont text)
 *
 * Output:
 *  - public/font-previews/{slug}.webp  (640px wide)
 *  - src/data/font-previews.json      (list of slugs that have an image)
 *  - scripts/font-previews-report.json (per-foundry success/failure summary)
 *
 * Usage: node scripts/scrape-font-previews.mjs
 * Requires devDeps: sharp, playwright (npx playwright install chromium)
 * Idempotent: skips fonts whose output file already exists.
 */

import { mkdir, writeFile, access, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { FONTS, fontSlug } from '../src/data/fonts.js';

const OUT_DIR = 'public/font-previews';
const MANIFEST = 'src/data/font-previews.json';
const REPORT = 'scripts/font-previews-report.json';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const exists = (p) => access(p).then(() => true, () => false);

const fetchHtml = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
};

const absolutize = (src, pageUrl) => new URL(src.replace(/&amp;/g, '&'), pageUrl).href;

/** Per-foundry HTML extraction heuristics (verified by manual spot-checks) */
const htmlExtractors = {
  fontimonim: (html) =>
    html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1],
  aaa: (html) => {
    // Specimen cover image carries itemprop="image"; lazy variant holds the real URL
    const tag = html.match(/<img[^>]*itemprop="image"[^>]*>/)?.[0];
    if (!tag) return null;
    return tag.match(/data-lazy-src="([^"]+)"/)?.[1] || tag.match(/src="(https?:[^"]+)"/)?.[1];
  },
  ezer: (html) => {
    // Webflow: per-font asset on the files CDN; skip UI chrome images
    const all = [...html.matchAll(/https:\/\/cdn\.prod\.website-files\.com\/[^"' )]+\.(?:jpg|jpeg|png|webp)/gi)]
      .map((m) => m[0]);
    return all.find((u) => !/icon|logo|fav|arrow|shop|search|menu/i.test(u));
  },
  hafontia: (html) => {
    const all = [...html.matchAll(/https:\/\/hafontia\.com\/wp-content\/uploads\/[^"' )]+\.(?:jpg|jpeg|png|webp)/gi)]
      .map((m) => m[0]);
    return all.find((u) => !/logo|icon|fav/i.test(u));
  },
  // specimen sheet first; in-use photo if the page has none. Paths sometimes contain spaces.
  nomad: (html) => {
    const imgs = [...html.matchAll(/photos\/[^"']+?\.(?:jpg|jpeg|png|webp)/gi)].map((m) => m[0]);
    return imgs.find((u) => /specimen/i.test(u)) || imgs.find((u) => /in[- ]use/i.test(u));
  },
};

// reisinger: first page image is a portrait photo, not a specimen - screenshot instead
const SCREENSHOT_FOUNDRIES = new Set(['hagilda', 'fontef', 'reisinger']);

const saveAsWebp = async (buffer, outPath) => {
  await sharp(buffer).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 72 }).toFile(outPath);
};

const downloadImage = async (imgUrl) => {
  const res = await fetch(imgUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  const failures = [];
  const htmlFailedFonts = [];
  const perFoundry = {};
  const bump = (fo, ok) => {
    perFoundry[fo] ??= { ok: 0, fail: 0, skipped: 0 };
    perFoundry[fo][ok] += 1;
  };

  // Phase 1: HTML extraction foundries, small concurrency
  const htmlFonts = FONTS.filter((f) => htmlExtractors[f.fo]);
  const htmlCache = new Map(); // url -> html (reisinger fonts share one URL)

  let queue = [...htmlFonts];
  const worker = async () => {
    while (queue.length) {
      const font = queue.shift();
      const slug = fontSlug(font);
      const outPath = path.join(OUT_DIR, `${slug}.webp`);
      if (await exists(outPath)) {
        bump(font.fo, 'skipped');
        continue;
      }
      try {
        let html = htmlCache.get(font.url);
        if (!html) {
          html = await fetchHtml(font.url);
          htmlCache.set(font.url, html);
        }
        const raw = htmlExtractors[font.fo](html);
        if (!raw) throw new Error('no image found in HTML');
        const imgUrl = absolutize(raw, font.url);
        await saveAsWebp(await downloadImage(imgUrl), outPath);
        bump(font.fo, 'ok');
        console.log(`ok   ${font.fo} ${slug} <- ${imgUrl}`);
      } catch (err) {
        // Don't count as failed yet - phase 2 will try a screenshot
        htmlFailedFonts.push(font);
        console.warn(`html-miss ${font.fo} ${slug}: ${err.message} (will screenshot)`);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));

  // Phase 2: screenshot foundries + HTML-extraction misses via Playwright
  const shotFonts = [...FONTS.filter((f) => SCREENSHOT_FOUNDRIES.has(f.fo)), ...htmlFailedFonts];
  if (shotFonts.length) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: UA,
      locale: 'he-IL',
    });
    const page = await context.newPage();

    for (const font of shotFonts) {
      const slug = fontSlug(font);
      const outPath = path.join(OUT_DIR, `${slug}.webp`);
      if (await exists(outPath)) {
        bump(font.fo, 'skipped');
        continue;
      }
      try {
        await page.goto(font.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(3500); // let webfonts + hero settle
        const buffer = await page.screenshot({ type: 'png' });
        await saveAsWebp(buffer, outPath);
        bump(font.fo, 'ok');
        console.log(`shot ${font.fo} ${slug}`);
      } catch (err) {
        bump(font.fo, 'fail');
        failures.push({ slug, fo: font.fo, url: font.url, error: String(err.message || err) });
        console.warn(`FAIL ${font.fo} ${slug}: ${err.message}`);
      }
    }
    await browser.close();
  }

  // Manifest: every slug that ended up with a file on disk
  const files = await readdir(OUT_DIR);
  const slugs = files.filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, '')).sort();
  await writeFile(MANIFEST, JSON.stringify(slugs, null, 2));
  await writeFile(REPORT, JSON.stringify({ generatedAt: new Date().toISOString(), perFoundry, failures }, null, 2));

  console.log('\nSummary:', JSON.stringify(perFoundry));
  console.log(`Manifest: ${slugs.length} previews -> ${MANIFEST}`);
  if (failures.length) console.log(`${failures.length} failures -> ${REPORT}`);

  // Self-check: the scrape is only "working" if most fonts got an image
  const okTotal = Object.values(perFoundry).reduce((sum, s) => sum + s.ok + s.skipped, 0);
  console.assert(okTotal / FONTS.length > 0.7, 'less than 70% of fonts have previews - inspect report');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
