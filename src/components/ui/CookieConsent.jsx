import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  applyClarityChoice,
  readConsent,
  setCookieSettingsOpener,
  writeConsent,
} from '@/lib/clarityConsent';

const choiceButton = cn(
  'px-4 py-3 w-full',
  'border-3 border-off-black shadow-brutalist-sm',
  'font-headline font-bold text-base text-off-black',
  'hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]',
  'transition-all duration-200'
);

const statusLabel = {
  granted: 'כרגע אישרתם.',
  denied: 'כרגע סירבתם.',
};

/**
 * CookieConsent - באנר עוגיות ומדיניות פרטיות
 * Clarity loads only after an explicit yes. Refusal is the same size as accept.
 */
const CookieConsent = () => {
  const [choice, setChoice] = useState(() => readConsent()?.choice ?? null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (readConsent()?.choice === 'granted') applyClarityChoice('granted');
  }, []);

  useEffect(() => setCookieSettingsOpener(() => setPolicyOpen(true)), []);

  useEffect(() => {
    if (!policyOpen) return undefined;
    const onEsc = (event) => {
      if (event.key === 'Escape') setPolicyOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [policyOpen]);

  const choose = (next) => {
    writeConsent(next);
    const reload = applyClarityChoice(next);
    setChoice(next);
    setPolicyOpen(false);
    if (reload) window.setTimeout(() => window.location.reload(), 200);
  };

  return (
    <>
      {choice === null && (
        <aside
          dir="rtl"
          role="region"
          aria-label="הסכמה לעוגיות"
          className="max-w-7xl mx-auto px-4 pt-6"
        >
          <div className={cn(
            'bg-off-white text-off-black',
            'border-3 border-off-black shadow-brutalist',
            'p-4',
            'flex flex-col gap-4 md:flex-row md:items-center'
          )}>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-headline mb-2">תעזרו לנו?</h2>
            <p className="text-sm text-dark-gray leading-relaxed">
              אנחנו רוצים עוגיות כדי להמשיך לשפר את האתר בשבילכם. באישור, Microsoft Clarity
              רושם קליקים, גלילה ושחזור של המסך, ושומר עוגיות בשביל זה. אפשר לסרב, והאתר נשאר פתוח.
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-ibm underline underline-offset-2"
              onClick={() => setPolicyOpen(true)}
            >
              מה בדיוק נאסף
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:w-72 shrink-0">
            <button type="button" className={cn(choiceButton, 'bg-tetris-green')} onClick={() => choose('granted')}>
              כן, קדימה
            </button>
            <button type="button" className={cn(choiceButton, 'bg-off-white')} onClick={() => choose('denied')}>
              לא תודה
            </button>
          </div>
          </div>
        </aside>
      )}

      {policyOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-off-black/80"
          onClick={() => setPolicyOpen(false)}
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            className={cn(
              'w-full max-w-2xl max-h-[90vh] overflow-y-auto',
              'bg-off-white text-off-black',
              'border-3 border-off-black shadow-brutalist',
              'p-5 sm:p-7'
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="privacy-title" className="text-2xl font-bold font-headline mb-1">
              עוגיות ופרטיות
            </h2>
            <p className="text-xs text-dark-gray mb-4">עודכן: 13 בנובמבר 2026</p>
            {statusLabel[choice] && (
              <p className="text-sm font-bold mb-4">{statusLabel[choice]}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className={cn(choiceButton, 'bg-tetris-green')} onClick={() => choose('granted')}>
                כן, קדימה
              </button>
              <button type="button" className={cn(choiceButton, 'bg-off-white')} onClick={() => choose('denied')}>
                לא תודה
              </button>
            </div>
            <button
              type="button"
              className="mt-3 mb-5 text-sm font-ibm underline underline-offset-2"
              onClick={() => setPolicyOpen(false)}
            >
              סגירה
            </button>

            <div className="space-y-4 text-sm leading-relaxed">
              <section>
                <h3 className="font-bold font-headline text-base mb-1">מי מפעיל את האתר</h3>
                <p>
                  האתר ״אינדקס״ מופעל על ידי יהונתן שפירא. פניות בנושא פרטיות:{' '}
                  <a
                    href="https://www.alefsofit.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    alefsofit.com
                  </a>
                  . אין חובה למסור פרטים כדי להשתמש באתר.
                </p>
              </section>

              <section>
                <h3 className="font-bold font-headline text-base mb-1">בלי אישור</h3>
                <p>
                  מדידת צפיות בלי עוגיות דרך Vercel Analytics: כמה נכנסו לאיזה עמוד, בלי הקלטת מסך.
                  העדפות שנשמרות רק בדפדפן: אם כבר ראיתם את ״מה חדש״, וההתקדמות בתרגול המקלדת.
                  הבחירה כאן נשמרת בדפדפן הזה, עם תאריך, כדי שלא נשאל בכל כניסה.
                </p>
              </section>

              <section>
                <h3 className="font-bold font-headline text-base mb-1">רק אם מאשרים</h3>
                <p>
                  Microsoft Clarity מקבלת קליקים, גלילה, מעבר בין עמודים, סוג דפדפן ומכשיר,
                  ושחזור של מה שהופיע על המסך. עוגיות <span dir="ltr">_clck</span> ו־
                  <span dir="ltr">_clsk</span> מחברות את זה לביקור אחד. עוגיה בשם{' '}
                  <span dir="ltr">CLID</span> יכולה להישמר אצל Microsoft לאותו זיהוי.
                  ביקשנו מ־Clarity לא להשתמש בנתונים לפרסום ולא להפעיל את עוגיה{' '}
                  <span dir="ltr">MUID</span>.
                  שדות של שם, אימייל והודעה מוסתרים בהקלטה. שדות טקסט אחרים מוסתרים כברירת מחדל של Clarity.
                </p>
              </section>

              <section>
                <h3 className="font-bold font-headline text-base mb-1">כמה זמן, ואיפה</h3>
                <p>
                  אצל Microsoft: הקלטות נשמרות בערך 30 יום, ונתוני קליקים ומפות חום עד 9 חודשים.
                  השרתים בארצות הברית. פרטים אצל{' '}
                  <a
                    href="https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-cookies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    Microsoft
                  </a>
                  .
                </p>
              </section>

              <section>
                <h3 className="font-bold font-headline text-base mb-1">טפסים, אם שולחים</h3>
                <p>
                  הצעת תוכן: שם, אימייל, קטגוריה, הודעה וקישור. המלצה על מקום במפה: שם, המקום, הטקסט והדירוג.
                  שניהם נשמרים ב־Notion כדי לבדוק מה להציג באתר. המלצה מאושרת מופיעה באתר.
                  כתובת IP משמשת רק לרגע כדי לחסום שליחה חוזרת מהירה, ולא נשמרת במאגר.
                  לא מוכרים מידע. חוץ מזה הנתונים אצל Microsoft, Vercel ו־Notion, לפי מה שתיארנו למעלה.
                </p>
              </section>

              <section>
                <h3 className="font-bold font-headline text-base mb-1">הזכויות שלכם</h3>
                <p>
                  לפי חוק הגנת הפרטיות אפשר לבקש לעיין במידע, לתקן אותו או למחוק אותו, ולחזור מהאישור.
                  ״לא תודה״ עוצר את Clarity מהביקורים הבאים ומוחק את עוגיות האתר שלו.
                  מידע שכבר נשמר אצל Microsoft אפשר לבקש למחוק בפנייה אלינו.
                  אפשר גם לפנות{' '}
                  <a
                    href="https://www.gov.il/he/departments/the_privacy_protection_authority"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    לרשות להגנת הפרטיות
                  </a>
                  .
                </p>
              </section>

              <section>
                <h3 className="font-bold font-headline text-base mb-1">גיל</h3>
                <p>
                  האתר מיועד לסטודנטים לעיצוב. הוא לא מכוון לילדים מתחת לגיל 18, ואנחנו לא אוספים מהם פרטים ביודעין.
                </p>
              </section>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
