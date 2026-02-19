import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import logoDark from '@/assets/svg/logo-dark.svg';
import vcLogo from '@/assets/svg/vc-logo-small.svg';

/**
 * Header - כותרת עליונה
 * Sticky navigation header with dark bg for differentiation:
 * - Dark bg-off-black navbar
 * - Logo on the right (RTL) - white version for dark bg
 * - Nav buttons: #EEEEEE fill, square edges, 4px shadow
 * - Purple hamburger button with white lines
 * - Shimshon pixel font for all nav text
 */

const navSections = [
  { id: 'toolbox', label: 'ארגז כלים' },
  { id: 'museum', label: 'מוזיאון' },
  { id: 'library', label: 'ספרייה' },
  { id: 'hallOfFame', label: 'היכל התהילה' },
  { id: 'map', label: 'מפה' },
  { id: 'tips', label: 'טיפים' },
  { id: 'lucky', label: 'הפתעה' },
];

const Header = ({ activeSection, onSectionChange, onHelpClick, onHomeClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      dir="rtl"
      className={cn(
        'sticky top-0 z-50',
        'bg-off-black',
        'border-b-3 border-off-black',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between md:grid md:grid-cols-[auto_1fr_auto] md:gap-6">

        {/* Logo - right corner in RTL (white version for dark bg) */}
        <button
          type="button"
          onClick={() => onHomeClick?.()}
          aria-label="אינדקס האב - דף הבית"
          className="shrink-0"
        >
          <img src={logoDark} alt="אינדקס האב" className="h-8 w-auto" />
        </button>

        {/* Desktop navigation centered */}
        <div className="hidden md:flex items-center justify-center gap-4">
          <nav className="flex items-center justify-center gap-4">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange?.(section.id)}
                className={cn(
                  'px-4 py-2',
                  'text-sm font-shimshon whitespace-nowrap',
                  'border border-dark-gray',
                  'transition-all duration-200',
                  section.id === 'lucky'
                    ? 'bg-tetris-yellow text-off-black shadow-brutalist-nav hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                    : activeSection === section.id
                      ? 'bg-tetris-purple text-off-white shadow-none translate-x-[4px] translate-y-[4px]'
                      : 'bg-btn-gray text-off-black shadow-brutalist-nav hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => onHelpClick?.()}
            className={cn(
              'px-4 py-2',
              'text-sm font-shimshon whitespace-nowrap',
              'bg-tetris-purple text-off-white',
              'border border-dark-gray shadow-brutalist-nav',
              'transition-all duration-200',
              'hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
            )}
          >
            לעזור
          </button>
        </div>

        {/* Left side: VC logo (desktop full, mobile icon) + mobile hamburger */}
        <div className="flex items-center gap-2 md:justify-self-start">
          <a
            href="https://www.hit.ac.il/academic/design/visual-communications/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            {/* Desktop: Full Logo */}
            <img
              src={vcLogo}
              alt="המחלקה לתקשורת חזותית"
              className="hidden md:block h-10 w-auto brightness-0 invert"
            />
            {/* Mobile: Full VC logo */}
            <img
              src={vcLogo}
              alt="המחלקה לתקשורת חזותית"
              className="md:hidden h-8 w-auto brightness-0 invert"
            />
          </a>

          {/* Mobile: hamburger */}
          <button
            className={cn(
              'md:hidden',
              'w-[34px] h-[34px]',
              'flex items-center justify-center',
              'bg-tetris-purple',
              'border-[1.7px] border-dark-gray',
              'shadow-brutalist-hamburger',
              'transition-all duration-200',
              'hover:shadow-none hover:translate-x-[3.4px] hover:translate-y-[3.4px]'
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'סגור תפריט' : 'פתח תפריט'}
          >
            {mobileMenuOpen ? (
              <X size={18} strokeWidth={1.7} className="text-off-white" />
            ) : (
              <Menu size={18} strokeWidth={1.7} className="text-off-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'md:hidden fixed inset-0 top-[65px] bg-off-black z-40 p-6 overflow-y-auto',
          'transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className="flex flex-col gap-4">
          {navSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                onSectionChange?.(section.id);
                setMobileMenuOpen(false);
              }}
              className={cn(
                'px-6 py-4 text-right',
                'font-shimshon text-lg',
                'border border-dark-gray',
                'shadow-brutalist-nav',
                'transition-all duration-200',
                section.id === 'lucky'
                  ? 'bg-tetris-yellow text-off-black'
                  : activeSection === section.id
                    ? 'bg-tetris-purple text-off-white shadow-none'
                    : 'bg-btn-gray text-off-black'
              )}
            >
              {section.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onHelpClick?.();
              setMobileMenuOpen(false);
            }}
            className={cn(
              'px-6 py-4 text-right',
              'font-shimshon text-lg',
              'border border-dark-gray',
              'bg-tetris-purple text-off-white',
              'shadow-brutalist-nav',
              'transition-all duration-200'
            )}
          >
            לעזור
          </button>
        </nav>
      </div>

    </header>
  );
};

export default Header;
