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
