import { useState, useEffect, useCallback } from 'react';

/**
 * useData - הוק לטעינת נתונים
 * Generic data fetching hook with loading/error states
 * 
 * @param {string} endpoint - API endpoint to fetch
 * @param {Object} options - Fetch options
 * @returns {Object} { data, loading, error, refetch }
 */
const useData = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        throw new Error(`שגיאה בטעינת הנתונים: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'שגיאה לא צפויה');
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
