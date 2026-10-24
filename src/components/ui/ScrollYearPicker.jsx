import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DEGREE_START_YEARS } from '@/data/hitFaculty';
import { ChevronDown, Check } from 'lucide-react';

/**
 * ScrollYearPicker - בורר שנת התחלת התואר (מ-1990 עד השנה הנוכחית)
 * Renders a 44px brutalist trigger button and a scrollable list of years from current year down to 1990.
 */
const ScrollYearPicker = ({
  value,
  onChange,
  years = DEGREE_START_YEARS,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest' });
    }
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const currentVal = String(value || years[0] || new Date().getFullYear());

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'form-control-uniform w-full px-3',
          'bg-light-gray border-2 border-off-black',
          'flex items-center justify-between gap-2',
          'font-jersey text-base text-off-black cursor-pointer',
          'focus:bg-off-white transition-colors'
        )}
      >
        <span className="tabular-nums">{currentVal}</span>
        <ChevronDown
          size={15}
          className={cn('text-off-black transition-transform shrink-0', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="שנת התחלת התואר (1990 עד היום)"
          className={cn(
            'absolute top-full left-0 right-0 z-50 mt-1',
            'bg-off-white border-2 border-off-black shadow-brutalist',
            'max-h-52 overflow-y-auto py-1',
            'animate-tetris-stack'
          )}
        >
          {years.map((year) => {
            const isSelected = String(year) === currentVal;
            return (
              <button
                key={year}
                ref={isSelected ? selectedRef : null}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(String(year));
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-2 flex items-center justify-between',
                  'font-jersey text-sm tabular-nums cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-tetris-yellow font-bold text-off-black'
                    : 'text-off-black hover:bg-light-gray'
                )}
              >
                <span>{year}</span>
                {isSelected && <Check size={14} className="text-off-black shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScrollYearPicker;
