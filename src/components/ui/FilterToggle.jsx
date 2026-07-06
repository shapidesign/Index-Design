import React from 'react';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';

/**
 * FilterToggle - כפתור פתיחה/סגירה של פאנל הסינון
 * A funnel-icon button that shows/hides a section's filter panel.
 * Displays an active-count badge so applied filters stay visible while collapsed.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the filter panel is currently open
 * @param {Function} props.onToggle - Toggle callback
 * @param {number} [props.activeCount] - Number of active filters (badge)
 * @param {string} [props.label] - Button label (defaults to "סינון")
 * @param {string} [props.className]
 */
const FilterToggle = ({ isOpen, onToggle, activeCount = 0, label = 'סינון', className }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={isOpen}
    className={cn(
      'inline-flex items-center gap-2 px-3 py-2',
      'font-headline text-sm font-bold',
      'border-2 border-off-black',
      'transition-all duration-200',
      isOpen
        ? 'bg-tetris-purple text-off-white shadow-none translate-x-[2px] translate-y-[2px]'
        : 'bg-off-white text-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
      className
    )}
  >
    <Filter size={16} />
    <span>{label}</span>
    {activeCount > 0 && (
      <span
        className={cn(
          'inline-flex items-center justify-center min-w-[20px] h-5 px-1',
          'bg-tetris-pink border-2 border-off-black',
          'text-[11px] font-bold text-off-black'
        )}
      >
        {activeCount}
      </span>
    )}
  </button>
);

export default FilterToggle;
