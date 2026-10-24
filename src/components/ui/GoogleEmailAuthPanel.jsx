import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { supabase, GOOGLE_CLIENT_ID } from '@/lib/supabase';
import { HIT_STUDY_YEARS } from '@/data/hitFaculty';
import { Mail, KeyRound, CheckCircle2, ArrowRight, X, ShieldCheck } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GoogleEmailAuthPanel - Real Supabase Authentication (Google Identity / OAuth + Verified Email OTP & Password)
 * Ensures users cannot spoof an email without real verification, and links session to per-user Supabase storage.
 */
const GoogleEmailAuthPanel = ({ onSuccess, onClose, title = 'התחברות ואימות חשבון עם Google / אימייל' }) => {
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'password'
  const [passwordMode, setPasswordMode] = useState('signin'); // 'signin' | 'signup'
  const [step, setStep] = useState('request'); // 'request' | 'verify'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studyYear, setStudyYear] = useState('שנה ב׳');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const googleBtnContainerRef = useRef(null);

  // Initialize official Google Identity Services button -> exchanges signed Google JWT with Supabase Auth
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
        setError(err?.message || 'התחברות עם Google נכשלה. נסו אימות במייל למטה.');
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
            width: 280,
          });
        }
      } catch {
        /* GIS initialization fallback */
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
      const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
          data: {
            full_name: cleanName,
            study_year: studyYear,
          },
        },
      });

      if (otpError) {
        if (/rate limit|security purposes/i.test(otpError.message)) {
          throw new Error('נשלחו יותר מדי בקשות אימות בדקה האחרונה. אנא המתינו כדקה או השתמשו בקוד שכבר נשלח למייל.');
        }
        throw otpError;
      }

      setStep('verify');
      setInfoMessage(
        `שלחנו מייל אימות לכתובת ${cleanEmail}. הזינו את קוד האימות מהמייל (או לחצו על קישור האימות במייל) כדי להשלים את החיבור.`
      );
    } catch (err) {
      setError(err?.message || 'שליחת מייל האימות נכשלה. בדקו את הכתובת ונסו שוב.');
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
      // Try 'email' first, then 'signup' or 'magiclink' in case this is a brand-new user confirmation
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
        throw new Error('קוד האימות שגוי או שפג תוקפו. בדקו את המייל ונסו שוב.');
      }

      // Ensure user metadata includes name and studyYear if provided
      if (name.trim()) {
        await supabase.auth.updateUser({
          data: {
            full_name: name.trim(),
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
            setInfoMessage('החשבון קיים אך טרם אומת במייל. הזינו את קוד האימות שנשלח למייל שלכם:');
            return;
          }
          throw new Error('הכניסה נכשלה. ודאו שהאימייל והסיסמה נכונים (או הירשמו אם זו פעם ראשונה).');
        }
        if (data?.session) {
          onSuccess?.(data.session);
        }
      } else {
        const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: redirectTo,
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
          // Email confirmation is required by Supabase! Transition to OTP verification step.
          setStep('verify');
          setInfoMessage(
            `נשלח מייל אימות לכתובת ${cleanEmail}. אשרו את הקישור במייל או הזינו כאן את קוד האימות כדי להפעיל את החשבון.`
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
          <strong>חיבור מאומת בענן:</strong> התיקיות, הפריטים השמורים, ההערות והעבודות שלכם נשמרים באופן אישי ומאובטח לחשבון האימייל המאומת שלכם מכל מכשיר.
        </p>
        {/* Official Google Sign-In Button container */}
        <div className="shrink-0 flex items-center justify-end" ref={googleBtnContainerRef} />
      </div>

      {/* Method Selector Tabs */}
      {step === 'request' && (
        <div className="flex border-2 border-off-black mb-5 bg-light-gray w-fit">
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
            <span>קוד אימות למייל (Google / Email OTP)</span>
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
                <span>שנת לימודים</span>
              </label>
              <select
                value={studyYear}
                onChange={(e) => setStudyYear(e.target.value)}
                className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-headline text-sm outline-none cursor-pointer"
              >
                {HIT_STUDY_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs font-ibm text-red-800 bg-red-100 border-2 border-red-700 px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs font-ibm text-dark-gray">
              יישלח קוד אימות חד-פעמי וקישור התחברות לכתובת המייל שתזינו.
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
              יצירת חשבון חדש (עם אימות מייל)
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
                  <span>שנת לימודים</span>
                </label>
                <select
                  value={studyYear}
                  onChange={(e) => setStudyYear(e.target.value)}
                  className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-headline text-sm outline-none cursor-pointer"
                >
                  {HIT_STUDY_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs font-ibm text-red-800 bg-red-100 border-2 border-red-700 px-3 py-2">
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
                    ? 'הרשמה ושליחת מייל אימות'
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
                readOnly
                dir="ltr"
                className="form-control-uniform w-full px-3 bg-light-gray/70 border-2 border-off-black font-jersey text-sm text-dark-gray outline-none"
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
            <p role="alert" className="text-xs font-ibm text-red-800 bg-red-100 border-2 border-red-700 px-3 py-2">
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
