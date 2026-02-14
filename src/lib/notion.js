/**
 * Notion API Client - ממשק לנוטיון
 * Frontend fetch functions that call backend API routes
 * API keys are NEVER exposed in the frontend
 */

const API_BASE = '/api';

/**
 * Generic fetch helper with error handling
 */
async function apiFetch(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);

  if (!response.ok) {
    throw new Error(`שגיאה בטעינת הנתונים: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch all toolbox resources from Notion
 * @param {Object} options - Query options
 * @param {string} [options.category] - Filter by type/category (סוג)
 * @param {string} [options.tag] - Filter by tag (תגיות)
 * @param {string} [options.q] - Search query
 * @returns {Promise<{results: Array, total: number}>}
 */
export async function fetchResources({ category, tag, q } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (tag) params.set('tag', tag);
  if (q) params.set('q', q);

  const queryString = params.toString();
  const endpoint = `/resources${queryString ? `?${queryString}` : ''}`;

  return apiFetch(endpoint);
}

/**
 * Search across all resources
 * @param {string} query - Search query
 * @returns {Promise<{results: Array, total: number}>}
 */
export async function searchResources(query) {
  return fetchResources({ q: query });
}

/**
 * Resource shape returned from the API:
 * {
 *   id: string,          // Notion page ID
 *   name: string,        // שם - Resource name
 *   description: string, // תיאור - Description in Hebrew
 *   types: string[],     // סוג - e.g. ["אתר", "כלי"]
 *   tags: string[],      // תגיות - e.g. ["טיפוגרפיה", "השראה"]
 *   link: string,        // קישור - URL or link text
 *   pricing: string,     // חינם/תשלום - "חינם" | "חצי חינם (freemium)" | "תשלום/מנוי"
 * }
 */
