import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ThemeToggle - מתג מצב כהה
 * Brutalist sun/moon switch. Flips `.dark` on <html> and remembers the choice;
 * the initial class is set before paint by the inline script in index.html.
 */
const ThemeToggle = ({ className }) => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this visit.
    }
    setIsDark(next);
  };

  const KnobIcon = isDark ? Moon : Sun;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="מצב כהה"
      title={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
      onClick={toggle}
      className={cn(
        'relative shrink-0 w-[76px] h-11 cursor-pointer',
        'bg-btn-gray border-3 border-dark-gray shadow-none',
        className
      )}
    >
      <span aria-hidden="true" className="absolute inset-0 flex items-center justify-between px-2 text-mid-gray">
        <Sun size={16} strokeWidth={2} />
        <Moon size={16} strokeWidth={2} />
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1 start-1 w-[30px] h-[30px]',
          'flex items-center justify-center',
          'border-2 border-off-black',
          'transition-transform duration-200 ease-[var(--ease-bounce)]',
          isDark
            ? 'bg-tetris-purple text-off-black translate-x-8 rtl:-translate-x-8'
            : 'bg-tetris-yellow text-off-black'
        )}
      >
        <KnobIcon size={18} strokeWidth={2.25} />
      </span>
    </button>
  );
};

export default ThemeToggle;
