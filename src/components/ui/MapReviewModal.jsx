import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { cn } from '@/lib/utils';
import { X, Send } from 'lucide-react';
import StarIcon from '@/assets/star.svg';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';
import { supabase } from '@/lib/supabase';

const PLACE_TAG_OPTIONS = ['חנויות יצירה ואומנות', 'בתי דפוס', 'בעלי מקצוע', 'ספקים'];
const MAX_PLACE_TAGS = 5;

/**
 * MapReviewModal - modal for user map place recommendations.
 * Writing a comment or tags requires a Google session.
 */
const MapReviewModal = ({ open, onClose, placeName, userProfile }) => {
  const [recommendation, setRecommendation] = useState('');
  const [rating, setRating] = useState(0); // 0 means no rating
  const [hoveredRating, setHoveredRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [trackedOpen, setTrackedOpen] = useState(open);
  if (open !== trackedOpen) {
    setTrackedOpen(open);
    if (!open) {
      setRecommendation('');
      setRating(0);
      setHoveredRating(0);
      setTags([]);
      setCustomTag('');
      setSuccess('');
      setError('');
    }
  }

  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open]);

  const addTag = (raw) => {
    const tag = String(raw || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!tag) return;
    setTags((prev) => (prev.includes(tag) || prev.length >= MAX_PLACE_TAGS ? prev : [...prev, tag]));
    setCustomTag('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!userProfile) {
      setError('יש להתחבר עם Google כדי להגיב ולתייג מקום');
      return;
    }
    if (!recommendation.trim() || recommendation.trim().length < 3) {
      setError('יש להזין המלצה (לפחות 3 תווים)');
      return;
    }

    try {
      setSubmitting(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setError('יש להתחבר עם Google כדי להגיב ולתייג מקום');
        return;
      }
      const payload = {
        place: placeName,
        recommendation: recommendation.trim(),
        tags,
      };
      if (rating > 0) payload.rating = rating;

      const response = await fetch('/api/map-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'שליחת ההמלצה נכשלה');
      }

      setSuccess('תודה! ההמלצה נשלחה בהצלחה ותפורסם לאחר אישור.');
      setTimeout(() => {
        onCloseRef.current();
      }, 2000);
    } catch (submitError) {
      setError(submitError.message || 'אירעה שגיאה בשליחה');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="שליחת המלצה למקום"
    >
      <div
        dir="rtl"
        className={cn(
          'relative w-full max-w-xl mx-auto my-auto',
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
          aria-label="סגירת חלון"
        >
          <X size={18} />
        </button>

        <h3 className="text-2xl font-bold font-headline text-off-black mb-1">
          המלצה על כלי / מקום
        </h3>
        <p className="text-lg font-bold text-tetris-purple font-headline mb-4">
          {placeName}
        </p>

        {userProfile ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-lg font-bold font-headline text-off-black block mb-2">השם שלך</span>
            <input
              type="text"
              value={userProfile.name || ''}
              readOnly
              className="w-full px-4 py-3 bg-light-gray border-2 border-off-black text-right font-headline text-lg outline-none cursor-not-allowed"
            />
          </label>

          <div className="block bg-light-gray/30 p-4 border-2 border-off-black/10 rounded-sm">
            <span className="text-lg font-bold font-headline text-off-black block mb-3">דירוג (אופציונלי)</span>
            <div className="flex items-center gap-2" dir="ltr">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isActive = (hoveredRating || rating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(starValue)}
                    aria-label={`דרג ${starValue} כוכבים`}
                  >
                    <img 
                      src={StarIcon} 
                      alt="" 
                      className={cn(
                        "w-10 h-10 select-none transition-all duration-200 cursor-pointer",
                        isActive ? "opacity-100 scale-110 drop-shadow-sm" : "opacity-25"
                      )} 
                    />
                  </button>
                );
              })}
              <span className="mr-5 text-lg font-bold font-headline text-tetris-purple min-w-[80px] text-right" dir="rtl">
                {rating > 0 ? `${rating} כוכבים` : hoveredRating > 0 ? `${hoveredRating} כוכבים` : ''}
              </span>
            </div>
          </div>

          <label className="block pb-2">
            <span className="text-lg font-bold font-headline text-off-black block mb-2">ההמלצה *</span>
            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full min-h-[120px] px-4 py-3 bg-off-white border-2 border-off-black text-right font-ibm text-base outline-none focus:border-tetris-purple transition-all shadow-brutalist-xs focus:shadow-brutalist resize-y"
              placeholder="כתבו מה ניסיתם, אהבתם או פחות אהבתם במקום הזה..."
            />
          </label>

          <div>
            <span className="text-lg font-bold font-headline text-off-black block mb-2">תגיות (עד {MAX_PLACE_TAGS})</span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PLACE_TAG_OPTIONS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => (active ? setTags((prev) => prev.filter((item) => item !== tag)) : addTag(tag))}
                    className={cn(
                      'px-2.5 py-1 text-xs font-headline border-2 border-off-black cursor-pointer',
                      active ? 'bg-tetris-purple text-off-white font-bold' : 'bg-light-gray text-off-black'
                    )}
                  >
                    {tag} {active && '✓'}
                  </button>
                );
              })}
            </div>
            <div className="flex items-stretch gap-2">
              <input
                type="text"
                value={customTag}
                maxLength={40}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(customTag);
                  }
                }}
                placeholder="תגית נוספת..."
                dir="rtl"
                className="flex-1 px-3 py-2 bg-off-white border-2 border-off-black font-headline text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => addTag(customTag)}
                className="px-3 py-2 bg-off-black text-off-white font-headline text-xs font-bold border-2 border-off-black cursor-pointer"
              >
                הוסף תגית
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm font-ibm text-red-700 bg-red-100 border-2 border-red-700 px-3 py-2 shadow-brutalist-xs">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-ibm text-green-800 bg-green-100 border-2 border-green-800 px-3 py-2 shadow-brutalist-xs">
              {success}
            </p>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-2.5',
                'bg-tetris-purple border-2 border-off-black text-off-white',
                'font-bold font-headline text-lg shadow-brutalist-xs',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              <span>{submitting ? 'שולח...' : 'שליחה'}</span>
              <Send size={16} />
            </button>
          </div>
        </form>
        ) : (
          <div className="space-y-4">
            <p className="font-ibm text-sm text-dark-gray">
              רק חשבון Google מחובר יכול להגיב ולתייג מקום. אפשר עדיין לקרוא המלצות שכבר אושרו.
            </p>
            <GoogleSignInButton label="התחבר עם Google" />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default MapReviewModal;
