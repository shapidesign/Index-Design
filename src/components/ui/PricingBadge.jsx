import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PricingBadge - תג מחיר בסגנון ניאו-ברוטליסטי
 * Displays pricing info with colored background and coin icons
 * Extracted from Figma Price.svg - 3 colored variants:
 *   חינם (Free) → Green
 *   חצי חינם (Freemium) → Orange
 *   תשלום/מנוי (Paid) → Purple
 *
 * @param {Object} props
 * @param {string} props.pricing - Pricing value from Notion
 * @param {string} [props.className] - Additional classes
 */
const pricingConfig = {
  'חינם': {
    bg: 'bg-tetris-green',
    label: 'חינם',
  },
  'חצי חינם (freemium)': {
    bg: 'bg-tetris-orange',
    label: 'חצי חינם',
  },
  'תשלום/מנוי': {
    bg: 'bg-[#8867FF]',
    label: 'תשלום/מנוי',
  },
};

const PricingBadge = ({ pricing, className }) => {
  const config = pricingConfig[pricing];

  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'px-2.5 py-1',
        'rounded-[5px]',
        'border-2 border-off-black',
        'shadow-[4px_4px_0px_#1F1F1F]',
        'font-shimshon text-xs font-bold text-off-black',
        'whitespace-nowrap',
        config.bg,
        className
      )}
      title={pricing}
    >
      {config.label}
    </span>
  );
};

export default PricingBadge;
