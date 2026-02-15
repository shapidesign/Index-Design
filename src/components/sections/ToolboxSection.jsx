import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import useData from '@/hooks/useData';
import ToolboxCard from '@/components/cards/ToolboxCard';
import ToolboxFilter from '@/components/ui/ToolboxFilter';
import TetrisLoader from '@/components/tetris/TetrisLoader';
import TetrisShape from '@/components/tetris/TetrisShape';

/**
 * ToolboxSection - ארגז הכלים
 * Container for the toolbox: fetches resources from Notion,
 * provides filtering, and renders a responsive card grid.
 */

/** Initial empty filter state */
const emptyFilters = {
  pricing: [],
  types: [],
  tags: [],
};

const ToolboxSection = () => {
  const { data, loading, error, refetch } = useData('/api/resources');
  const [filters, setFilters] = useState(emptyFilters);

  // The API returns { results: [...], total: number }
  const resources = data?.results || [];

  /** Toggle a filter value on/off */
  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters((prev) => {
      const current = prev[filterKey];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [filterKey]: next };
    });
  }, []);

  /** Clear all filters */
  const handleClearFilters = useCallback(() => {
    setFilters(emptyFilters);
  }, []);

  /** Extract unique types from all resources */
  const availableTypes = useMemo(() => {
    const typeSet = new Set();
    resources.forEach((r) => r.types?.forEach((t) => typeSet.add(t)));
    return Array.from(typeSet).sort();
  }, [resources]);

  /** Extract top tags sorted by frequency */
  const availableTags = useMemo(() => {
    const tagCount = {};
    resources.forEach((r) =>
      r.tags?.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      })
    );
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag]) => tag);
  }, [resources]);

  /** Apply filters to resources */
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      // Pricing filter
      if (
        filters.pricing.length > 0 &&
        !filters.pricing.includes(r.pricing)
      ) {
        return false;
      }
      // Type filter (resource must have at least one matching type)
      if (
        filters.types.length > 0 &&
        !r.types?.some((t) => filters.types.includes(t))
      ) {
        return false;
      }
      // Tag filter (resource must have at least one matching tag)
      if (
        filters.tags.length > 0 &&
        !r.tags?.some((t) => filters.tags.includes(t))
      ) {
        return false;
      }
      return true;
    });
  }, [resources, filters]);

  const hasActiveFilters =
    filters.pricing.length > 0 ||
    filters.types.length > 0 ||
    filters.tags.length > 0;

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <TetrisLoader className="min-h-[400px]" />
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div
        dir="rtl"
        className={cn(
          'min-h-[400px] flex flex-col items-center justify-center',
          'p-8 text-center'
        )}
      >
        <TetrisShape type="O" color="yellow" size={40} className="mb-6" />
        <h2 className="text-2xl font-bold text-off-black mb-4 font-shimshon">
          אופס! משהו השתבש
        </h2>
        <p className="text-dark-gray font-ibm mb-6">{error}</p>
        <button
          onClick={refetch}
          className={cn(
            'px-6 py-3',
            'bg-tetris-green',
            'font-shimshon font-bold',
            'border-3 border-off-black',
            'shadow-brutalist',
            'hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]',
            'transition-all duration-200'
          )}
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <section dir="rtl" className="animate-tetris-stack">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-off-black font-shimshon">
          ארגז הכלים
        </h2>
        <span className="font-shimshon text-sm text-dark-gray">
          {filteredResources.length} משאבים
          {hasActiveFilters && ` (מסוננים מתוך ${resources.length})`}
        </span>
      </div>

      {/* Filters */}
      <ToolboxFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        availableTypes={availableTypes}
        availableTags={availableTags}
      />

      {/* Card grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResources.map((resource) => (
            <ToolboxCard
              key={resource.id}
              itemId={resource.id}
              name={resource.name}
              description={resource.description}
              types={resource.types}
              tags={resource.tags}
              link={resource.link}
              image={resource.image}
              pricing={resource.pricing}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div
          className={cn(
            'flex flex-col items-center justify-center',
            'py-16 text-center'
          )}
        >
          <TetrisShape type="T" color="purple" size={32} className="mb-4 opacity-40" />
          <p className="text-lg font-bold text-dark-gray font-shimshon mb-2">
            לא נמצאו תוצאות
          </p>
          <p className="text-sm text-mid-gray font-ibm mb-4">
            נסו לשנות את הפילטרים או לנקות אותם
          </p>
          <button
            onClick={handleClearFilters}
            className={cn(
              'px-4 py-2',
              'bg-tetris-pink',
              'font-shimshon text-sm font-bold',
              'border-2 border-off-black',
              'shadow-brutalist-xs',
              'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
              'transition-all duration-200'
            )}
          >
            נקה פילטרים
          </button>
        </div>
      )}
    </section>
  );
};

export default ToolboxSection;
