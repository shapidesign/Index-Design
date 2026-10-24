import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { supabase, GOOGLE_CLIENT_ID } from '@/lib/supabase';
import ScrollYearPicker from '@/components/ui/ScrollYearPicker';
import { Mail, KeyRound, CheckCircle2, ArrowRight, X, ShieldCheck } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_START_YEAR = String(new Date().getFullYear());

/**
 * GoogleEmailAuthPanel - Real Supabase Authentication
 * - Uses in-page 6-digit OTP code verification (never redirects to localhost:3000)
 * - Uses ScrollYearPicker for "שנת התחלת התואר" (1990 -> current year)
 * - Only renders Google One-Tap if VITE_GOOGLE_CLIENT_ID is explicitly configured for the current origin
 */
const GoogleEmailAuthPanel = ({
  onSuccess,
  onClose,
  title = 'התחברות ואימות חשבון עם Google / אימייל',
}) => {
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'password'
  const [passwordMode, setPasswordMode] = useState('signin'); // 'signin' | 'signup'
  const [step, setStep] = useState('request'); // 'request' | 'verify'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studyYear, setStudyYear] = useState(DEFAULT_START_YEAR);
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const googleBtnContainerRef = useRef(null);

  // Only initialize Google Identity Services if a dedicated VITE_GOOGLE_CLIENT_ID is configured for this domain
  useEffect(() => {
    if (typeof window === 'undefined' || !GOOGLE_CLIENT_ID) return undefined;

    let cancelled = false;

    const handleGoogleCredential = async (response) => {
      if (cancelled || !response?.credential) return;
      setError('');
      setBusy(true);
      try {
        const { data, error: idTokenError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });
        if (idTokenError) throw idTokenError;
        if (data?.session) {
          onSuccess?.(data.session);
        }
      } catch (err) {
        setError(err?.message || 'התחברות עם Google נכשלה. נסו אימות קוד במייל למטה.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    };

    const initGsi = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            locale: 'he',
            width: 260,
          });
        }
      } catch {
        /* GIS fallback */
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', initGsi);
        return () => existingScript.removeEventListener('load', initGsi);
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [onSuccess]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) {
      setError('יש להזין שם מלא');
      return;
    }
    if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
      setError('יש להזין כתובת אימייל תקינה');
      return;
    }

    setBusy(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: cleanName,
            study_year: studyYear,
          },
        },
      });

      if (otpError) {
        if (/rate limit|security purposes/i.test(otpError.message)) {
          throw new Error(
            'נשלחו יותר מדי בקשות אימות בדקה האחרונה. אנא המתינו כדקה או הזינו את הקוד שכבר נשלח למייל.'
          );
        }
        throw otpError;
      }

      setStep('verify');
      setInfoMessage(
        `שלחנו קוד אימות לכתובת ${cleanEmail}. העתיקו את קוד המספרים מהמייל והזינו אותו כאן למטה (אל תלחצו על קישור ה-localhost במייל).`
      );
    } catch (err) {
      setError(err?.message || 'שליחת קוד האימות נכשלה. בדקו את הכתובת ונסו שוב.');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = otpCode.trim().replace(/\s+/g, '');

    if (!cleanToken || cleanToken.length < 6) {
      setError('יש להזין את קוד האימות בן 6–8 הספרות שנשלח למייל');
      return;
    }

    setBusy(true);
    try {
      let verifyResult = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });

      if (verifyResult.error) {
        verifyResult = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'signup',
        });
      }

      if (verifyResult.error) {
        verifyResult = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'magiclink',
        });
      }

      if (verifyResult.error) {
        throw new Error('קוד האימות שגוי או שפג תוקפו. בדקו את הקוד במייל ונסו שוב.');
      }

      if (name.trim() || studyYear) {
        await supabase.auth.updateUser({
          data: {
            full_name: name.trim() || undefined,
            study_year: studyYear,
          },
        });
      }

      if (verifyResult.data?.session) {
        onSuccess?.(verifyResult.data.session);
      }
    } catch (err) {
      setError(err?.message || 'אימות הקוד נכשל');
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
      setError('יש להזין כתובת אימייל תקינה');
      return;
    }
    if (!password || password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (passwordMode === 'signup' && !cleanName) {
      setError('יש להזין שם מלא להרשמה');
      return;
    }

    setBusy(true);
    try {
      if (passwordMode === 'signin') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInError) {
          if (/email not confirmed/i.test(signInError.message)) {
            setStep('verify');
            setInfoMessage(
              'החשבון קיים אך טרם אומת. הזינו כאן את קוד המספרים שנשלח למייל שלכם:'
            );
            return;
          }
          throw new Error(
            'הכניסה נכשלה. ודאו שהאימייל והסיסמה נכונים (או הירשמו אם זו פעם ראשונה).'
          );
        }
        if (data?.session) {
          onSuccess?.(data.session);
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              study_year: studyYear,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (data?.session) {
          onSuccess?.(data.session);
        } else {
          setStep('verify');
          setInfoMessage(
            `נשלח קוד אימות לכתובת ${cleanEmail}. הזינו כאן את קוד המספרים מהמייל כדי להפעיל את החשבון (אל תלחצו על קישור ה-localhost במייל).`
          );
        }
      }
    } catch (err) {
      setError(err?.message || 'שגיאה בהתחברות');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="p-5 md:p-6 bg-off-white border-3 border-off-black shadow-brutalist">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-off-black">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-tetris-green border-2 border-off-black flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="text-off-black" />
          </span>
          <h3 className="font-headline text-lg md:text-xl font-bold text-off-black">
            {title}
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור חלון התחברות"
            className="p-1 text-dark-gray hover:text-off-black cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Security / Per-User Cloud Sync Notice */}
      <div className="mb-5 p-3 bg-tetris-yellow/35 border-2 border-off-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs font-ibm text-off-black leading-relaxed">
          <strong>חיבור מאומת בענן:</strong> הזינו את כתובת ה-Gmail / האימייל שלכם כדי לקבל <strong>קוד אימות חד-פעמי</strong> ישירות למייל. כל התיקיות, הפריטים השמורים והעבודות נשמרים לחשבון האישי שלכם מכל מכשיר.
        </p>
        {GOOGLE_CLIENT_ID && (
          <div className="shrink-0 flex items-center justify-end" ref={googleBtnContainerRef} />
        )}
      </div>

      {/* Method Selector Tabs */}
      {step === 'request' && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div className="flex border-2 border-off-black bg-light-gray w-fit">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setError('');
                setInfoMessage('');
              }}
              className={cn(
                'h-10 px-4 font-headline text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer',
                authMethod === 'otp'
                  ? 'bg-tetris-purple text-off-white'
                  : 'bg-off-white text-off-black hover:bg-light-gray'
              )}
            >
              <Mail size={14} />
              <span>קוד אימות ל-Gmail / מייל (ללא סיסמה)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setError('');
                setInfoMessage('');
              }}
              className={cn(
                'h-10 px-4 font-headline text-xs font-bold border-r-2 border-off-black inline-flex items-center gap-1.5 transition-colors cursor-pointer',
                authMethod === 'password'
                  ? 'bg-tetris-purple text-off-white'
                  : 'bg-off-white text-off-black hover:bg-light-gray'
              )}
            >
              <KeyRound size={14} />
              <span>כניסה / הרשמה עם סיסמה</span>
            </button>
          </div>

          {email.trim() && (
            <button
              type="button"
              onClick={() => setStep('verify')}
              className="text-xs font-headline underline text-tetris-purple cursor-pointer"
            >
              כבר קיבלתם קוד למייל? הזינו אותו כאן
            </button>
          )}
        </div>
      )}

      {/* STEP 1A: OTP Request Form */}
      {step === 'request' && authMethod === 'otp' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col">
              <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                <span>שם מלא של הסטודנט/ית *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="למשל: נועה לוי"
                dir="rtl"
                className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-headline text-sm outline-none focus:bg-off-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                <span>כתובת Google / Gmail לאימות *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                dir="ltr"
                className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-jersey text-sm outline-none focus:bg-off-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                <span>שנת התחלת התואר</span>
              </label>
              <ScrollYearPicker value={studyYear} onChange={setStudyYear} />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-ibm text-red-800 bg-red-100 border-2 border-red-700 px-3 py-2"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs font-ibm text-dark-gray">
              יישלח קוד אימות בן 6–8 ספרות לכתובת ה-Gmail / המייל שתזינו.
            </span>
            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="form-control-uniform px-4 bg-light-gray border-2 border-off-black font-headline text-xs font-bold cursor-pointer inline-flex items-center justify-center"
                >
                  ביטול
                </button>
              )}
              <button
                type="submit"
                disabled={busy}
                className="form-control-uniform px-5 bg-tetris-green border-2 border-off-black shadow-brutalist-xs font-headline text-xs font-bold text-off-black cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Mail size={14} />
                <span>{busy ? 'שולח קוד אימות...' : 'שלח קוד אימות למייל'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 1B: Email + Password Form */}
      {step === 'request' && authMethod === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => {
                setPasswordMode('signin');
                setError('');
              }}
              className={cn(
                'px-3 py-1 text-xs font-headline border-2 border-off-black cursor-pointer',
                passwordMode === 'signin' ? 'bg-tetris-yellow font-bold' : 'bg-light-gray'
              )}
            >
              כניסה לחשבון קיים
            </button>
            <button
              type="button"
              onClick={() => {
                setPasswordMode('signup');
                setError('');
              }}
              className={cn(
                'px-3 py-1 text-xs font-headline border-2 border-off-black cursor-pointer',
                passwordMode === 'signup' ? 'bg-tetris-yellow font-bold' : 'bg-light-gray'
              )}
            >
              יצירת חשבון חדש (עם קוד אימות למייל)
            </button>
          </div>

          <div
            className={cn(
              'grid grid-cols-1 gap-4 items-end',
              passwordMode === 'signup' ? 'md:grid-cols-4' : 'md:grid-cols-2'
            )}
          >
            {passwordMode === 'signup' && (
              <div className="flex flex-col">
                <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                  <span>שם מלא *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: נועה לוי"
                  dir="rtl"
                  className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-headline text-sm outline-none focus:bg-off-white"
                />
              </div>
            )}

            <div className="flex flex-col">
              <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                <span>כתובת אימייל *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                dir="ltr"
                className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-jersey text-sm outline-none focus:bg-off-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                <span>סיסמה (מינימום 6 תווים) *</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                dir="ltr"
                className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-jersey text-sm outline-none focus:bg-off-white"
              />
            </div>

            {passwordMode === 'signup' && (
              <div className="flex flex-col">
                <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                  <span>שנת התחלת התואר</span>
                </label>
                <ScrollYearPicker value={studyYear} onChange={setStudyYear} />
              </div>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-ibm text-red-800 bg-red-100 border-2 border-red-700 px-3 py-2"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="form-control-uniform px-4 bg-light-gray border-2 border-off-black font-headline text-xs font-bold cursor-pointer inline-flex items-center justify-center"
              >
                ביטול
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="form-control-uniform px-5 bg-tetris-green border-2 border-off-black shadow-brutalist-xs font-headline text-xs font-bold text-off-black cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <KeyRound size={14} />
              <span>
                {busy
                  ? 'מתחבר...'
                  : passwordMode === 'signup'
                    ? 'הרשמה ושליחת קוד אימות'
                    : 'התחבר לחשבון'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Verify OTP Code Sent to Email */}
      {step === 'verify' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {infoMessage && (
            <div className="p-3 bg-tetris-green/30 border-2 border-off-black text-xs font-ibm text-off-black">
              {infoMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col">
              <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                <span>כתובת אימייל לאימות</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="form-control-uniform w-full px-3 bg-light-gray/70 border-2 border-off-black font-jersey text-sm text-off-black outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                <span>קוד אימות מהמייל (6–8 ספרות) *</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                dir="ltr"
                autoFocus
                className="form-control-uniform w-full px-3 bg-off-white border-2 border-off-black font-jersey text-base tracking-widest outline-none focus:bg-tetris-yellow/20"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-ibm text-red-800 bg-red-100 border-2 border-red-700 px-3 py-2"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setError('');
              }}
              className="form-control-uniform px-3 bg-light-gray border-2 border-off-black font-headline text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowRight size={14} />
              <span>חזרה לשינוי אימייל</span>
            </button>

            <button
              type="submit"
              disabled={busy}
              className="form-control-uniform px-6 bg-tetris-green border-2 border-off-black shadow-brutalist-xs font-headline text-xs font-bold text-off-black cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle2 size={15} />
              <span>{busy ? 'מאמת קוד...' : 'אמת קוד והתחבר'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GoogleEmailAuthPanel;
