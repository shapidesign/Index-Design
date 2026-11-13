// ponytail: the yes/no stays in localStorage on this browser. A server log is the upgrade if you ever need to prove one visitor's choice.

export const CLARITY_ID = 'zcyck3c0nh';
const KEY = 'index-clarity-consent';

let scriptOn = false;
let opener = () => {};

function safeStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function readConsent(storage) {
  const box = storage === undefined ? safeStorage() : storage;
  if (!box) return null;
  try {
    const data = JSON.parse(box.getItem(KEY) || 'null');
    if (data?.choice === 'granted' || data?.choice === 'denied') return data;
  } catch {
    /* corrupt or blocked */
  }
  return null;
}

export function writeConsent(choice, storage, now = Date.now()) {
  if (choice !== 'granted' && choice !== 'denied') {
    throw new Error('bad consent choice');
  }
  const record = { choice, at: now };
  const box = storage === undefined ? safeStorage() : storage;
  try {
    box?.setItem(KEY, JSON.stringify(record));
  } catch {
    /* private mode */
  }
  return record;
}

export function setCookieSettingsOpener(fn) {
  opener = typeof fn === 'function' ? fn : () => {};
  return () => {
    opener = () => {};
  };
}

export function openCookieSettings() {
  opener();
}

function signal(analytics) {
  window.clarity = window.clarity || function clarityQueue() {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  window.clarity('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: analytics,
  });
}

function ensureScript() {
  if (scriptOn || document.getElementById('clarity-tag')) {
    scriptOn = true;
    return;
  }
  const script = document.createElement('script');
  script.id = 'clarity-tag';
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
  const first = document.getElementsByTagName('script')[0];
  if (first?.parentNode) first.parentNode.insertBefore(script, first);
  else document.head.appendChild(script);
  scriptOn = true;
}

/**
 * Load Clarity only after a yes. Ads stay off.
 * @returns {boolean} true when a tag is already running and the page must reload to stop it
 */
export function applyClarityChoice(choice) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (choice === 'granted') {
    signal('granted');
    ensureScript();
    return false;
  }
  if (scriptOn || document.getElementById('clarity-tag')) {
    signal('denied');
    return true;
  }
  return false;
}
