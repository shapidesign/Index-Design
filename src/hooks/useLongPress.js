import { useRef } from 'react';
import { canLongPress, movedPastSlop, LONG_PRESS_MS } from '@/lib/longPress';

const INTERACTIVE = 'button, a, input, textarea, select, label';

const isMobileViewport = () => window.matchMedia('(max-width: 767px)').matches;

function pressedInteractiveChild(event) {
  const node = event.target?.nodeType === 1 ? event.target : event.target?.parentElement;
  if (!node) return false;
  const card = node.closest('.long-press-card');
  const el = node.closest(INTERACTIVE);
  if (!el || !card || el === card) return false;
  return card.contains(el);
}

/**
 * Hold on a mobile card. Ignores buttons and nested links.
 * The card itself may be a link; that still counts.
 */
export default function useLongPress(onLongPress) {
  const timer = useRef(null);
  const start = useRef(null);
  const suppressClick = useRef(false);

  const clear = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const release = (e) => {
    clear();
    start.current = null;
    const node = e.currentTarget;
    if (node?.hasPointerCapture?.(e.pointerId)) node.releasePointerCapture(e.pointerId);
  };

  return {
    onPointerDown(e) {
      suppressClick.current = false;
      clear();
      start.current = null;
      if (!canLongPress({
        isMobile: isMobileViewport(),
        interactiveChild: pressedInteractiveChild(e),
        button: e.button,
      })) return;
      start.current = { x: e.clientX, y: e.clientY, el: e.currentTarget, pointerId: e.pointerId };
      timer.current = window.setTimeout(() => {
        const press = start.current;
        timer.current = null;
        if (!press) return;
        suppressClick.current = true;
        try { press.el.setPointerCapture(press.pointerId); } catch { /* pointer already gone */ }
        onLongPress();
      }, LONG_PRESS_MS);
    },
    onPointerMove(e) {
      if (!start.current) return;
      if (movedPastSlop(e.clientX - start.current.x, e.clientY - start.current.y)) {
        clear();
        start.current = null;
      }
    },
    onPointerUp(e) {
      if (suppressClick.current) {
        e.preventDefault();
        e.stopPropagation();
      }
      release(e);
    },
    onPointerCancel(e) {
      release(e);
    },
    onTouchEnd(e) {
      if (suppressClick.current) e.preventDefault();
    },
    onClickCapture(e) {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
    onContextMenu(e) {
      if (!isMobileViewport() || e.pointerType === 'mouse') return;
      if (pressedInteractiveChild(e)) return;
      e.preventDefault();
    },
  };
}
