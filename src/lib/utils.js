import { clsx } from 'clsx';

/**
 * cn - Utility function for conditional classnames
 * Merges class names using clsx
 * 
 * @param  {...any} inputs - Class names, objects, or arrays
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return clsx(inputs);
}
