import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Send, Link as LinkIcon } from 'lucide-react';
import ApprovedSuggestions from './ApprovedSuggestions';

const CATEGORY_OPTIONS = ['טיפ', 'מעצב', 'סטודיו', 'אתר', 'ספר', 'מפה'];

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidUrl = (value) => {
  if (!value) return true;
  try {
    const normalized = value.startsWith('http') ? value : `https://${value}`;
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
};

const normalizeUrl = (value) => {
  if (!value) return '';
  return value.startsWith('http') ? value : `https://${value}`;
};

/**
 * MessageSuggestionModal - modal for user suggestions.
 */
const MessageSuggestionModal = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const validationError = useMemo(() => {
    if (!name.trim()) return 'יש להזין שם מלא';
    if (!email.trim()) return 'יש להזין אימייל';
    if (!isValidEmail(email.trim())) return 'כתובת אימייל לא תקינה';
    if (!category) return 'יש לבחור קטגוריה';
    if (!message.trim()) return 'יש להזין הודעה';
    if (message.trim().length < 5) return 'ההודעה קצרה מדי (מינימום 5 תווים)';
    if (!isValidUrl(url.trim())) return 'הקישור שהוזן אינו תקין';
    return '';
  }, [name, email, category, message, url]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setCategory('');
    setMessage('');
    setUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          message: message.trim(),
          url: normalizeUrl(url.trim())
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'שליחת ההצעה נכשלה');
      }

      setSuccess('תודה! ההצעה נקלטה בהצלחה ותיבדק בקרוב.');
      resetForm();
    } catch (submitError) {
      setError(submitError.message || 'אירעה שגיאה בשליחה');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-off-black/80 dark:bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="שליחת הצעה לאתר"
    >
      <div
        dir="rtl"
        className={cn(
          'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto',
          'bg-off-white border-3 border-off-black shadow-brutalist',
          'p-6 md:p-7'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute top-3 left-3 p-2',
            'bg-tetris-pink border-2 border-off-black shadow-brutalist-xs',
            'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
            'transition-all duration-200'
          )}
          aria-label="סגירת חלון שליחת הצעה"
        >
          <X size={18} />
        </button>

        <h3 className="text-2xl font-bold font-headline text-off-black mb-2">
          שליחת הצעה לאתר
        </h3>
        <p className="text-sm text-dark-gray font-ibm mb-5">
          רוצים להמליץ על כלי/מעצב/משאב? שלחו הודעה ונוסיף לאינדקס לאחר בדיקה.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="flex items-center h-6 text-xs font-bold font-headline text-off-black leading-none mb-1">שם מלא *</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 bg-off-white border-2 border-off-black text-right font-headline text-sm outline-none"
              placeholder="השם שלך"
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="flex items-center h-6 text-xs font-bold font-headline text-off-black leading-none mb-1">אימייל *</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 bg-off-white border-2 border-off-black text-right font-ibm text-sm outline-none"
              placeholder="לדוגמה: name@example.com"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="form-label-uniform text-xs font-bold font-headline text-off-black">קטגוריה *</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-control-uniform w-full px-3 bg-off-white border-2 border-off-black text-right font-headline text-sm outline-none"
            >
              <option value="">בחרו קטגוריה</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="flex items-center h-6 text-xs font-bold font-headline text-off-black leading-none mb-1">הודעה / הצעה *</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-28 px-3 py-2 bg-off-white border-2 border-off-black text-right font-ibm text-sm outline-none resize-y"
              placeholder="מה הייתם רוצים להוסיף לאתר?"
            />
          </label>

          <label className="block">
            <span className="flex items-center h-6 text-xs font-bold font-headline text-off-black leading-none mb-1">קישור רלוונטי (אופציונלי)</span>
            <div className="flex items-center gap-2 h-11 px-3 border-2 border-off-black bg-off-white">
              <LinkIcon size={14} className="text-dark-gray shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-full bg-transparent text-right font-ibm text-sm outline-none"
                placeholder="לדוגמה: https://example.com"
              />
            </div>
          </label>

          {error && (
            <p className="text-sm font-ibm text-red-700 bg-red-100 border border-red-700 px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-ibm text-green-800 bg-green-100 border border-green-800 px-3 py-2">
              {success}
            </p>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5',
                'bg-tetris-green border-2 border-off-black',
                'font-bold font-headline text-off-black shadow-brutalist-xs',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              <span>{submitting ? 'שולח...' : 'שליחה'}</span>
              <Send size={14} />
            </button>
          </div>
        </form>

        <ApprovedSuggestions />
      </div>
    </div>
  );
};

export default MessageSuggestionModal;
