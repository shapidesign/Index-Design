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
    text: 'text-off-black',
    label: 'חינם',
  },
  'חצי חינם (freemium)': {
    bg: 'bg-tetris-orange',
    text: 'text-off-black',
    label: 'חצי חינם',
  },
  'תשלום/מנוי': {
    bg: 'bg-[#8867FF]',
    text: 'text-off-white',
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
        'border-2 border-off-black',
        'shadow-brutalist-xs',
        'font-shimshon text-xs font-bold',
        'whitespace-nowrap',
        config.bg,
        config.text,
        className
      )}
      title={pricing}
    >
      {config.label}
    </span>
  );
};

export default PricingBadge;
