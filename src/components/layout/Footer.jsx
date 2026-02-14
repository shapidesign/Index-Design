import React from 'react';
import { cn } from '@/lib/utils';
import TetrisBlock from '@/components/tetris/TetrisBlock';
import logoDark from '@/assets/svg/logo-dark.svg';

/**
 * Footer - כותרת תחתונה
 * Site footer with links, credits, and tetris decoration
 */
const Footer = () => {
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
            <p className="text-sm text-gray-400 leading-relaxed">
              האב משאבים לסטודנטים לעיצוב גרפי. כל הכלים, הטיפים והמיקומים שתצטרכו - במקום אחד.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">ניווט מהיר</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>ארגז הכלים</li>
              <li>המוזיאון</li>
              <li>הספרייה</li>
              <li>המפה המקומית</li>
              <li>סטודנט לסטודנט</li>
            </ul>
          </div>

          {/* Credits */}
          <div className="flex flex-col items-start gap-4">
            <h3 className="text-lg font-bold mb-2">נבנה באהבה</h3>
            <div className="flex gap-2">
              <TetrisBlock type="T" color="purple" size={20} />
              <TetrisBlock type="O" color="green" size={20} />
              <TetrisBlock type="L" color="orange" size={20} />
            </div>
            <span className={cn(
              'inline-block px-3 py-1',
              'bg-tetris-green',
              'text-off-black text-xs font-bold',
              'border-2 border-off-white',
            )}>
              נבנה על ידי יהונתן שפירא, 2026
            </span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} אינדקס האב - כל הזכויות שמורות</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
