import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import logoDark from '@/assets/svg/logo-dark.svg';
import pkg from '../../../package.json'; // Import package.json for version

/**
 * Header - כותרת עליונה
 * Sticky navigation header with dark bg for differentiation:
 * - Dark bg-off-black navbar
 * - Logo on the right (RTL) - white version for dark bg
 * - Nav buttons: #EEEEEE fill, rounded-[5px], 4px shadow
 * - Purple hamburger button with white lines
 * - Shimshon pixel font for all nav text
 * - Version tag on top left (Yellow box)
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
  
  // Debug version
  useEffect(() => {
    console.log('Current App Version:', pkg.version);
  }, []);

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

        {/* Desktop Navigation + Hamburger + Version */}
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
                    'rounded-[5px]',
                    'border border-[#555555]',
                    'transition-all duration-200',
                    activeSection === section.id
                      ? 'bg-tetris-purple text-off-white shadow-none translate-x-[4px] translate-y-[4px]'
                      : 'bg-btn-gray text-[#050505] shadow-brutalist-nav hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>

            {/* Hamburger button (desktop - for extra menu) */}
            <button
              className={cn(
                'w-[34px] h-[34px]',
                'flex items-center justify-center',
                'bg-tetris-purple',
                'rounded-[5px]',
                'border-[1.7px] border-[#555555]',
                'shadow-brutalist-hamburger',
                'transition-all duration-200',
                'hover:shadow-none hover:translate-x-[3.4px] hover:translate-y-[3.4px]'
              )}
              aria-label="תפריט נוסף"
            >
              <Menu size={18} strokeWidth={1.7} className="text-[#EEEEEE]" />
            </button>
          </div>

          {/* Mobile: hamburger only */}
          <button
            className={cn(
              'md:hidden',
              'w-[34px] h-[34px]',
              'flex items-center justify-center',
              'bg-tetris-purple',
              'rounded-[5px]',
              'border-[1.7px] border-[#555555]',
              'shadow-brutalist-hamburger',
              'transition-all duration-200',
              'hover:shadow-none hover:translate-x-[3.4px] hover:translate-y-[3.4px]'
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'סגור תפריט' : 'פתח תפריט'}
          >
            {mobileMenuOpen ? (
              <X size={18} strokeWidth={1.7} className="text-[#EEEEEE]" />
            ) : (
              <Menu size={18} strokeWidth={1.7} className="text-[#EEEEEE]" />
            )}
          </button>

          {/* Version Tag - Always visible, far left, styled box */}
          <div className={cn(
            "hidden md:flex items-center justify-center",
            "px-3 py-1",
            "bg-tetris-yellow",
            "border-2 border-off-black",
            "shadow-[2px_2px_0_#1F1F1F]",
            "rounded-[4px]",
            "text-xs font-bold font-mono text-off-black",
            "rotate-[-2deg]",
            "hover:rotate-0 transition-transform duration-200"
          )}>
            v{pkg.version}
          </div>
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
                'rounded-[5px]',
                'border border-[#555555]',
                'shadow-brutalist-nav',
                'transition-all duration-200',
                activeSection === section.id
                  ? 'bg-tetris-purple text-off-white shadow-none'
                  : 'bg-btn-gray text-[#050505]'
              )}
            >
              {section.label}
            </button>
          ))}
          
          {/* Version in Mobile Menu */}
          <div className="mt-auto pt-6 flex justify-center">
            <div className={cn(
              "inline-flex items-center justify-center",
              "px-3 py-1",
              "bg-tetris-yellow",
              "border-2 border-off-black",
              "shadow-[2px_2px_0_#1F1F1F]",
              "rounded-[4px]",
              "text-xs font-bold font-mono text-off-black"
            )}>
              v{pkg.version}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
