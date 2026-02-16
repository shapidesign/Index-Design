import React from 'react';
import { cn } from '@/lib/utils';
import { getTagColor } from '@/lib/tagColors';

/**
 * ToolboxFilter - פילטרים לארגז הכלים
 * Filter bar with pricing, type, and tag toggles.
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter state { pricing: string[], types: string[], tags: string[] }
 * @param {Function} props.onFilterChange - Callback: (filterKey, value) => void
 * @param {Function} props.onClearFilters - Callback to clear all filters
 * @param {string[]} props.availableTypes - All unique type values from data
 * @param {string[]} props.availableTags - Top tags from data (sorted by frequency)
 */

/** Pricing options with their colors */
const pricingOptions = [
  { value: 'חינם', label: 'חינם', bg: 'bg-tetris-green', activeBorder: 'border-tetris-green' },
  { value: 'חצי חינם (freemium)', label: 'חצי חינם', bg: 'bg-tetris-orange', activeBorder: 'border-tetris-orange' },
  { value: 'תשלום/מנוי', label: 'תשלום/מנוי', bg: 'bg-tetris-purple', activeBorder: 'border-tetris-purple' },
];

/** Type → primary accent color mapping */
const typeColorMap = {
  'אתר': 'bg-tetris-purple',
  'כלי': 'bg-tetris-orange',
  'ספרייה/מאגר': 'bg-tetris-green',
  'השראה': 'bg-tetris-yellow',
  'פלאגין': 'bg-tetris-pink',
  'Assets': 'bg-tetris-blue',
  'מדריך': 'bg-tetris-cyan',
};

/**
 * Generic filter chip button
 */
/** Check if a string is primarily Latin/English */
const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test(text);

const usesWhiteText = (bgClass) =>
  bgClass === 'bg-tetris-purple';

const FilterChip = ({ label, isActive, activeBg, onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'px-3 py-1.5',
      'text-xs font-bold',
      isEnglish(label) ? 'font-jersey' : 'font-shimshon',
      'border-2 border-off-black',
      'whitespace-nowrap',
      'transition-all duration-200',
      isActive
        ? [
            activeBg,
            usesWhiteText(activeBg) ? 'text-off-white' : 'text-off-black',
            'shadow-none translate-x-[2px] translate-y-[2px]'
          ]
        : ['bg-light-gray', 'text-off-black', 'shadow-brutalist-xs', 'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'],
      className
    )}
    aria-pressed={isActive}
  >
    {label}
  </button>
);

const ToolboxFilter = ({
  filters,
  onFilterChange,
  onClearFilters,
  availableTypes = [],
  availableTags = [],
}) => {
  const hasActiveFilters =
    filters.pricing.length > 0 ||
    filters.types.length > 0 ||
    filters.tags.length > 0;

  return (
    <div
      dir="rtl"
      className={cn(
        'mb-8 p-4',
        'bg-off-white',
        'border-3 border-off-black',
        'shadow-brutalist-sm'
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-shimshon font-bold text-base text-off-black">
          סינון
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className={cn(
              'px-3 py-1',
              'font-shimshon text-xs font-bold',
              'text-off-black bg-tetris-pink',
              'border-2 border-off-black',
              'shadow-brutalist-xs',
              'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
              'transition-all duration-200'
            )}
          >
            נקה פילטרים
          </button>
        )}
      </div>

      {/* Pricing filter */}
      <div className="mb-3">
        <p className="font-shimshon text-xs text-dark-gray mb-2">מחיר</p>
        <div className="flex flex-wrap gap-2">
          {pricingOptions.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              isActive={filters.pricing.includes(opt.value)}
              activeBg={opt.bg}
              onClick={() => onFilterChange('pricing', opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Type filter */}
      {availableTypes.length > 0 && (
        <div className="mb-3">
          <p className="font-shimshon text-xs text-dark-gray mb-2">סוג</p>
          <div className="flex flex-wrap gap-2 pb-1 pe-1 overflow-visible">
            {availableTypes.map((type) => (
              <FilterChip
                key={type}
                label={type}
                isActive={filters.types.includes(type)}
                activeBg={typeColorMap[type] || 'bg-tetris-purple'}
                onClick={() => onFilterChange('types', type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tag filter */}
      {availableTags.length > 0 && (
        <div>
          <p className="font-shimshon text-xs text-dark-gray mb-2">תגיות</p>
          <div className="flex flex-wrap gap-2 pb-1 pe-1 overflow-visible">
            {availableTags.map((tag) => (
              <FilterChip
                key={tag}
                label={tag}
                isActive={filters.tags.includes(tag)}
                activeBg={getTagColor(tag)}
                onClick={() => onFilterChange('tags', tag)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolboxFilter;
