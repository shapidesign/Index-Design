import { isAdminRoute } from '@/lib/admin-route';
import { buildAnalyticsEvent, pagePercent } from '@/lib/analytics-event';
import { supabase } from '@/lib/supabase';

// Live property already installed in index.html. Override with VITE_GA_MEASUREMENT_ID if it changes.
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-43GN2SH9KR';
const GA_ID_OK = /^G-[A-Z0-9]+$/i.test(GA_ID);

let queue = [];
let timer = 0;
// ponytail: one hover per label per page view, capped at 80. A refresh counts again.
const hovers = new Set();

function sectionNow() {
  const fromPath = window.location.pathname.match(/^\/([a-z]+)\/?$/)?.[1];
  const fromHash = window.location.hash.match(/^#\/([a-z]+)/)?.[1];
  const id = fromPath || fromHash || '';
  if (!id || id === 'admin' || id === 'privacy' || id === 'terms') return 'home';
  return id;
}

function textOf(el) {
  if (!el) return 'רקע';
  if (el.matches('input, textarea, select')) {
    return el.getAttribute('aria-label') || el.getAttribute('placeholder') || 'שדה';
  }
  return el.getAttribute('aria-label') || el.textContent || el.tagName;
}

function pointOf(event) {
  return pagePercent(
    event.pageX,
    event.pageY,
    document.documentElement.scrollWidth,
    document.documentElement.scrollHeight,
  );
}

function sendToGa(row) {
  if (typeof window.gtag !== 'function') return;
  if (row.kind === 'view') {
    window.gtag('event', 'page_view', { page_path: row.path });
    return;
  }
  if (row.kind === 'share' || row.kind === 'forward') {
    window.gtag('event', 'share', {
      method: row.label || row.kind,
      content_type: 'page',
      item_id: row.path,
    });
    return;
  }
  window.gtag('event', row.kind === 'click' ? 'site_click' : 'site_hover', {
    section: row.section,
    event_label: row.label || '',
    percent_x: row.x,
    percent_y: row.y,
    page_path: row.path,
  });
}

async function flush() {
  if (timer) {
    window.clearTimeout(timer);
    timer = 0;
  }
  if (!queue.length) return;
  const batch = queue.splice(0, 20);
  for (const row of batch) sendToGa(row);
  const { error } = await supabase.from('analytics_events').insert(batch);
  if (error && import.meta.env.DEV) console.info('analytics insert skipped', error.message);
}

function enqueue(row) {
  if (!row || isAdminRoute()) return;
  queue.push(row);
  if (queue.length > 50) queue = queue.slice(-50);
  if (queue.length >= 10) flush();
  else if (!timer) timer = window.setTimeout(flush, 1500);
}

function loadGa() {
  if (!GA_ID_OK || window.gtag) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackShare(method) {
  const kind = method === 'whatsapp' ? 'forward' : 'share';
  enqueue(buildAnalyticsEvent({
    kind,
    section: sectionNow(),
    label: method,
    path: `${window.location.pathname}${window.location.hash}`,
  }));
  flush();
}

let lastView = '';

function trackView() {
  const path = `${window.location.pathname}${window.location.hash}`;
  if (path === lastView) return;
  lastView = path;
  enqueue(buildAnalyticsEvent({
    kind: 'view',
    section: sectionNow(),
    path,
  }));
  flush();
}

export function initTracking() {
  loadGa();
  const path = () => `${window.location.pathname}${window.location.hash}`;

  const onClick = (event) => {
    if (event.target.closest?.('[data-track]')) return;
    const el = event.target.closest?.('a, button, [role="button"], input, textarea, select');
    const point = pointOf(event);
    enqueue(buildAnalyticsEvent({
      kind: 'click',
      section: sectionNow(),
      label: textOf(el),
      path: path(),
      ...point,
    }));
  };

  const onHover = (event) => {
    const el = event.target.closest?.('a, button');
    if (!el) return;
    const label = textOf(el);
    const key = `${sectionNow()}|${label}`;
    if (hovers.has(key) || hovers.size >= 80) return;
    hovers.add(key);
    const point = pointOf(event);
    enqueue(buildAnalyticsEvent({
      kind: 'hover',
      section: sectionNow(),
      label,
      path: path(),
      ...point,
    }));
  };

  const pushState = window.history.pushState.bind(window.history);
  const replaceState = window.history.replaceState.bind(window.history);
  window.history.pushState = (...args) => {
    const result = pushState(...args);
    trackView();
    return result;
  };
  window.history.replaceState = (...args) => {
    const result = replaceState(...args);
    trackView();
    return result;
  };

  document.addEventListener('click', onClick, true);
  document.addEventListener('mouseover', onHover, true);
  window.addEventListener('hashchange', trackView);
  window.addEventListener('popstate', trackView);
  trackView();

  return () => {
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('mouseover', onHover, true);
    window.removeEventListener('hashchange', trackView);
    window.removeEventListener('popstate', trackView);
    window.history.pushState = pushState;
    window.history.replaceState = replaceState;
    flush();
  };
}
