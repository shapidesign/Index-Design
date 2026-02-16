/**
 * Shared tag color utilities.
 * Uses a deterministic hash so the same tag always gets the same color
 * across filters, cards, and modals.
 */

const TAG_PALETTE = [
  'bg-tetris-purple',
  'bg-tetris-orange',
  'bg-tetris-green',
  'bg-tetris-pink',
  'bg-tetris-yellow',
  'bg-tetris-blue',
  'bg-tetris-cyan',
];

function hashTag(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Get a deterministic background color class for a tag name */
export const getTagColor = (tag) => TAG_PALETTE[hashTag(tag) % TAG_PALETTE.length];

/** Get the appropriate text color class for a given tag background */
export const getTagTextClass = (bg) =>
  bg === 'bg-tetris-purple' ? 'text-off-white' : 'text-off-black';
