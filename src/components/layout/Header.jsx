import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, User, Bookmark } from 'lucide-react';
import logoDark from '@/assets/svg/logo-dark.svg';
import vcLogo from '@/assets/svg/vc-logo-small.svg';
import useSavedItems from '@/hooks/useSavedItems';

/**
 * Header - כותרת עליונה
 * Sticky navigation header with dark bg for differentiation:
 * - Dark bg-off-black navbar
 * - Logo on the right (RTL) - white version for dark bg
 * - Center nav buttons: #EEEEEE fill, square edges, 4px shadow
 * - Left corner (RTL end): Profile / Personal Drawer button ("אזור אישי / המגירה") + VC logo + Mobile hamburger
 */

const navSections = [
  { id: 'toolbox', label: 'ארגז כלים' },
  { id: 'museum', label: 'מוזיאון' },
  { id: 'library', label: 'ספרייה' },
  { id: 'dictionary', label: 'מילון' },
  { id: 'keyboard', label: 'מקלדת' },
  { id: 'map', label: 'מפה' },
  { id: 'tips', label: 'טיפים' },
  { id: 'lucky', label: 'הפתעה' },
];

const Header = ({ activeSection, onSectionChange, onHelpClick, onHomeClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { savedCount, userProfile } = useSavedItems();

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

  const isProfileActive = activeSection === 'saved';

  return (
    <header
      dir="rtl"
      className={cn(
        'sticky top-0 z-50',
        'bg-off-black',
        'border-b-3 border-off-black'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">

        {/* Logo - right corner in RTL (white version for dark bg) */}
        <button
          type="button"
          onClick={() => onHomeClick?.()}
          aria-label="אינדקס האב - דף הבית"
          className="shrink-0 cursor-pointer"
        >
          <img src={logoDark} alt="אינדקס האב" className="h-8 w-auto" />
        </button>

        {/* Desktop navigation centered — strictly single line, never wraps */}
        <div className="hidden md:flex items-center justify-center gap-1.5 lg:gap-2 min-w-0 flex-nowrap overflow-x-auto no-scrollbar">
          <nav className="flex items-center justify-center gap-1.5 lg:gap-2 flex-nowrap shrink-0">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange?.(section.id)}
                className={cn(
                  'h-10 px-2.5 lg:px-3.5 shrink-0',
                  'inline-flex items-center justify-center gap-1.5',
                  'text-xs lg:text-sm font-headline leading-none whitespace-nowrap',
                  'border border-dark-gray',
                  'transition-all duration-200 cursor-pointer',
                  section.id === 'lucky'
                    ? 'bg-tetris-yellow text-off-black shadow-brutalist-nav hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                    : activeSection === section.id
                      ? 'bg-tetris-purple text-off-white shadow-none translate-x-[4px] translate-y-[4px]'
                      : 'bg-btn-gray text-off-black shadow-brutalist-nav hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                )}
              >
                <span>{section.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => onHelpClick?.()}
            className={cn(
              'h-10 px-3 lg:px-4 shrink-0',
              'inline-flex items-center justify-center',
              'text-xs lg:text-sm font-headline leading-none whitespace-nowrap',
              'bg-tetris-purple text-off-white',
              'border border-dark-gray shadow-brutalist-nav',
              'transition-all duration-200 cursor-pointer',
              'hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
            )}
          >
            <span>לעזור</span>
          </button>
        </div>

        {/* Left corner (Top-Left of screen in RTL): Profile icon button + VC logo + Mobile hamburger */}
        <div className="flex items-center gap-2.5 shrink-0 md:justify-self-end">
          {/* Profile / Personal Drawer Icon Button (Top-Left on Desktop & Mobile) */}
          <button
            type="button"
            onClick={() => {
              onSectionChange?.('saved');
              setMobileMenuOpen(false);
            }}
            aria-label="אזור אישי והמגירה שלי"
            title="אזור אישי · המגירה שלי"
            className={cn(
              'relative h-10 px-2.5 inline-flex items-center justify-center gap-1.5',
              'border border-dark-gray font-headline text-xs lg:text-sm font-bold leading-none whitespace-nowrap',
              'transition-all duration-200 cursor-pointer',
              isProfileActive
                ? 'bg-tetris-pink text-off-black shadow-none translate-x-[3px] translate-y-[3px]'
                : 'bg-tetris-pink text-off-black shadow-brutalist-nav hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]'
            )}
          >
            <User size={18} strokeWidth={2.2} className="text-off-black shrink-0" />
            {savedCount > 0 && (
              <span className="px-1.5 py-0.5 bg-off-black text-off-white text-[11px] font-jersey leading-none">
                {savedCount}
              </span>
            )}
          </button>

          <a
            href="https://www.hit.ac.il/academic/design/visual-communications/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center"
          >
            <img
              src={vcLogo}
              alt="המחלקה לתקשורת חזותית"
              className="h-9 w-auto brightness-0 invert"
            />
          </a>

          {/* Mobile: hamburger */}
          <button
            className={cn(
              'md:hidden',
              'w-11 h-11',
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
              <X size={22} strokeWidth={1.7} className="text-off-white" />
            ) : (
              <Menu size={22} strokeWidth={1.7} className="text-off-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'md:hidden fixed inset-0 top-[79px] bg-off-black z-40 p-6 overflow-y-auto',
          'transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className="flex flex-col gap-4">
          {/* Profile / Personal Drawer entry at the top of the Hamburger Menu */}
          <button
            type="button"
            onClick={() => {
              onSectionChange?.('saved');
              setMobileMenuOpen(false);
            }}
            className={cn(
              'px-6 py-4 text-right flex items-center justify-between',
              'font-headline text-lg font-bold',
              'border-2 border-dark-gray',
              'shadow-brutalist-nav',
              'transition-all duration-200',
              isProfileActive
                ? 'bg-tetris-pink text-off-black shadow-none'
                : 'bg-tetris-pink text-off-black'
            )}
          >
            <span className="flex items-center gap-3">
              <span className="w-7 h-7 bg-off-black text-off-white flex items-center justify-center">
                <User size={16} />
              </span>
              <span>
                {userProfile?.name ? `פרופיל והמגירה (${userProfile.name})` : 'פרופיל · המגירה שלי'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Bookmark size={16} className="fill-off-black" />
              <span className="px-2 py-0.5 bg-off-black text-off-white text-sm font-jersey">
                {savedCount}
              </span>
            </span>
          </button>

          {navSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                onSectionChange?.(section.id);
                setMobileMenuOpen(false);
              }}
              className={cn(
                'px-6 py-4 text-right flex items-center justify-between',
                'font-headline text-lg',
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
              <span>{section.label}</span>
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
              'font-headline text-lg',
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
