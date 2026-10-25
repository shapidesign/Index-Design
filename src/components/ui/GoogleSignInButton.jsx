import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { signInWithGoogle } from '@/lib/supabase';

const GoogleMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

const callbackError = () => {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('error_description');
  if (fromQuery) return fromQuery;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return hash.get('error_description') || '';
};

/** Sends the browser to Google's account picker via Supabase Auth. */
const GoogleSignInButton = ({
  className,
  label = 'התחבר עם Google',
  busyLabel = 'מעביר אל Google...',
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(callbackError);

  const onClick = async () => {
    setError('');
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err?.message || 'התחברות עם Google נכשלה');
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-stretch gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={cn(
          'inline-flex items-center justify-center gap-2.5 px-4 py-2.5',
          'bg-off-white text-off-black font-headline text-xs md:text-sm font-bold',
          'border-3 border-off-black shadow-brutalist-sm',
          'hover:bg-tetris-yellow hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
          'transition-all cursor-pointer disabled:opacity-60',
          className
        )}
      >
        <GoogleMark />
        <span>{busy ? busyLabel : label}</span>
      </button>
      {error && (
        <p role="alert" className="text-xs font-ibm text-red-800 bg-red-100 border-2 border-red-700 px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
