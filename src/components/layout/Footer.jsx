import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import TetrisBlock from '@/components/tetris/TetrisBlock';
import logoDark from '@/assets/svg/logo-dark.svg';
import vcLogo from '@/assets/svg/vc-logo-small.svg';
import pkg from '../../../package.json';
import SupportModal from '@/components/ui/SupportModal';

/**
 * Footer - כותרת תחתונה
 * Site footer with links, credits, and tetris decoration
 */
const Footer = () => {
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  return (
    <footer
      dir="rtl"
      className={cn(
        'border-t-3 border-off-black',
        'bg-off-black text-off-white',
        'mt-16'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <img src={logoDark} alt="אינדקס האב" className="h-7 w-auto mb-4" />
            <p className="text-sm text-dark-gray leading-relaxed">
              האב משאבים לסטודנטים לעיצוב גרפי. כל הכלים, הטיפים והמיקומים שתצטרכו - במקום אחד.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">ניווט מהיר</h3>
            <ul className="space-y-2 text-sm text-dark-gray">
              <li>ארגז הכלים</li>
              <li>המוזיאון</li>
              <li>הספרייה</li>
              <li>המפה המקומית</li>
              <li>סטודנט לסטודנט</li>
            </ul>
          </div>

          {/* Credits */}
          <div className="flex flex-col items-start gap-4">
            <a
              href="https://www.hit.ac.il/academic/design/visual-communication/"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 transition-opacity hover:opacity-80"
              aria-label="המחלקה לתקשורת חזותית - HIT"
            >
              <img
                src={vcLogo}
                alt="המחלקה לתקשורת חזותית"
                className="h-10 w-auto brightness-0 invert"
              />
            </a>
            <h3 className="text-lg font-bold mb-2">נבנה באהבה</h3>
            <div className="flex gap-2">
              <TetrisBlock type="T" color="purple" size={20} />
              <TetrisBlock type="O" color="green" size={20} />
              <TetrisBlock type="L" color="orange" size={20} />
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-block px-3 py-1',
                'bg-tetris-green',
                'text-off-black text-xs font-bold',
                'border-2 border-off-black',
              )}>
                נבנה על ידי יהונתן שפירא, 2026
              </span>
              <span className={cn(
                'inline-block px-2 py-1',
                'bg-tetris-yellow',
                'text-off-black text-xs font-bold font-mono',
                'border-2 border-off-black',
              )}>
                v{pkg.version}
              </span>
            </div>
            <button
              onClick={() => setSupportModalOpen(true)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2',
                'bg-tetris-purple text-off-white',
                'text-sm font-bold font-shimshon',
                'border-2 border-off-black',
                'shadow-brutalist-xs',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-200'
              )}
            >
              <Heart size={14} fill="currentColor" />
              <span>לתמיכה ביוצר</span>
            </button>
          </div>
        </div>

        <div className="border-t border-dark-gray pt-6 text-center text-xs text-mid-gray">
          <p>© {new Date().getFullYear()} אינדקס האב - כל הזכויות שמורות</p>
        </div>
      </div>

      {/* Support Modal */}
      <SupportModal open={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
    </footer>
  );
};

export default Footer;
