/** Shared hold gesture for mobile cards. */

export const LONG_PRESS_MS = 450;
// ponytail: one slop for every card. A surface that scrolls inside itself would need its own.
export const LONG_PRESS_SLOP = 10;

export function canLongPress({ isMobile, interactiveChild, button = 0 }) {
  return Boolean(isMobile) && !interactiveChild && button === 0;
}

export function movedPastSlop(dx, dy, slop = LONG_PRESS_SLOP) {
  return dx * dx + dy * dy > slop * slop;
}
