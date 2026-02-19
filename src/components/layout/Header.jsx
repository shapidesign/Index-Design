import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, Heart } from 'lucide-react';
import logoDark from '@/assets/svg/logo-dark.svg';
import vcLogo from '@/assets/svg/vc-logo-small.svg';
import SupportModal from '@/components/ui/SupportModal';

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
  { id: 'tips', label: 'טיפ' },
  { id: 'students', label: 'סטודנט לסטודנט' },
  { id: 'library', label: 'הספרייה' },
  { id: 'museum', label: 'המוזיאון' },
  { id: 'toolbox', label: 'ארגז כלים' },
  { id: 'ai-tools', label: 'כלי AI ותוכנות' },
];

const Header = ({ activeSection, onSectionChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

        {/* Logo - right corner in RTL (white version for dark bg) */}
        <a href="/" aria-label="אינדקס האב - דף הבית" className="shrink-0">
          <img src={logoDark} alt="אינדקס האב" className="h-8 w-auto" />
        </a>

        {/* Left Section: VC Logo */}
        <div className="flex items-center gap-4 absolute left-4 md:left-6">
          <a
            href="https://www.hit.ac.il/academic/design/visual-communication/"
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
            {/* Mobile: Icon Only (using object-position to crop) */}
            <div className="md:hidden h-8 w-8 overflow-hidden relative">
              <img 
                src={vcLogo} 
                alt="המחלקה לתקשורת חזותית" 
                className="h-8 w-auto max-w-none absolute right-0 brightness-0 invert"
                style={{ right: '-2px' }} // Adjust to show only the icon part
              />
            </div>
          </a>
        </div>

        {/* Desktop Navigation + Hamburger */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-4">
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSectionChange?.(section.id)}
                  className={cn(
                    'px-4 py-2',
                    'text-sm font-shimshon',
                    'border border-dark-gray',
                    'transition-all duration-200',
                    activeSection === section.id
                      ? 'bg-tetris-purple text-off-white shadow-none translate-x-[4px] translate-y-[4px]'
                      : 'bg-btn-gray text-off-black shadow-brutalist-nav hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>

            {/* Support heart button (desktop) */}
            <button
              onClick={() => setSupportModalOpen(true)}
              className={cn(
                'w-[34px] h-[34px]',
                'flex items-center justify-center',
                'bg-tetris-pink',
                'border-[1.7px] border-dark-gray',
                'shadow-brutalist-hamburger',
                'transition-all duration-200',
                'hover:shadow-none hover:translate-x-[3.4px] hover:translate-y-[3.4px]'
              )}
              aria-label="תמיכה ביוצר"
            >
              <Heart size={18} strokeWidth={1.7} className="text-off-white" fill="#FAFAF9" />
            </button>

            {/* Hamburger button (desktop - for extra menu) */}
            <button
              className={cn(
                'w-[34px] h-[34px]',
                'flex items-center justify-center',
                'bg-tetris-purple',
                'border-[1.7px] border-dark-gray',
                'shadow-brutalist-hamburger',
                'transition-all duration-200',
                'hover:shadow-none hover:translate-x-[3.4px] hover:translate-y-[3.4px]'
              )}
              aria-label="תפריט נוסף"
            >
              <Menu size={18} strokeWidth={1.7} className="text-off-white" />
            </button>
          </div>

          {/* Mobile: support heart button */}
          <button
            className={cn(
              'md:hidden',
              'w-[34px] h-[34px]',
              'flex items-center justify-center',
              'bg-tetris-pink',
              'border-[1.7px] border-dark-gray',
              'shadow-brutalist-hamburger',
              'transition-all duration-200',
              'hover:shadow-none hover:translate-x-[3.4px] hover:translate-y-[3.4px]'
            )}
            onClick={() => setSupportModalOpen(true)}
            aria-label="תמיכה ביוצר"
          >
            <Heart size={18} strokeWidth={1.7} className="text-off-white" fill="#FAFAF9" />
          </button>

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
                activeSection === section.id
                  ? 'bg-tetris-purple text-off-white shadow-none'
                  : 'bg-btn-gray text-off-black'
              )}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Support Modal */}
      <SupportModal open={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
    </header>
  );
};

export default Header;
