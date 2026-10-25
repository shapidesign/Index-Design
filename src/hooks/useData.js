import { useState, useEffect, useCallback } from 'react';

// ponytail: one in-memory cache for the session. A reload still refetches.
const dataCache = new Map();

/** Share a response the search index already fetched, so a section can open without the loader. */
export function rememberData(endpoint, data) {
  if (!endpoint || data == null) return;
  dataCache.set(endpoint, data);
}

/**
 * useData - הוק לטעינת נתונים
 * Generic data fetching hook with loading/error states
 * 
 * @param {string} endpoint - API endpoint to fetch
 * @param {Object} options - Fetch options
 * @returns {Object} { data, loading, error, refetch }
 */
const useData = (endpoint, options = {}) => {
  const cached = dataCache.get(endpoint) ?? null;
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const warm = dataCache.get(endpoint);
    try {
      if (!warm) {
        setLoading(true);
        setError(null);
      }

      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        let errorMessage = `שגיאה בטעינת הנתונים: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('API Error Details:', errorData);
          if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          }
        } catch (e) {
          // Could not parse JSON error response
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      rememberData(endpoint, result);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (!dataCache.get(endpoint)) setError(err.message || 'שגיאה לא צפויה');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (endpoint) {
      fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useData;
