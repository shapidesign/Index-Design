import { useMemo } from 'react';

/**
 * useSearch - חיפוש פריטים בעברית ובאנגלית
 * Filters items based on search query across multiple fields
 * 
 * @param {Array} items - Array of items to search
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered items
 */
const useSearch = (items, searchQuery) => {
  return useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();

    return items.filter((item) => {
      // Search across all string fields
      const searchableText = [
        item.name,
        item.title,
        item.description,
        item.tip,
        item.category,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [items, searchQuery]);
};

export default useSearch;
