import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { getTagColor, getTagTextClass } from '@/lib/tagColors';

/**
 * Parses Notion rich-text (which often comes as plain text with newlines)
 * into paragraphs.
 */
const renderContent = (text) => {
  if (!text) return null;
  return text.split('\n').map((paragraph, idx) => {
    // Basic detection for bullet points (Notion sometimes outputs standard bullet characters)
    if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
      return (
        <li key={idx} className="ml-4 mb-2">
          {paragraph.trim().substring(1).trim()}
        </li>
      );
    }
    // Empty lines become spacing
    if (!paragraph.trim()) {
      return <div key={idx} className="h-4" aria-hidden="true" />;
    }
    return (
      <p key={idx} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    );
  });
};

const TipArticleModal = ({ tip, open, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasPrev) onPrev();
      if (e.key === 'ArrowLeft' && hasNext) onNext();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    
    // Reset scroll when tip changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose, onNext, onPrev, hasNext, hasPrev, tip]);

  if (!open || !tip) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col md:flex-row bg-off-black/90 backdrop-blur-sm p-4 md:p-8 overflow-hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        dir="rtl"
        className={cn(
          'relative w-full max-w-4xl mx-auto my-auto flex flex-col',
          'bg-off-white border-4 border-off-black shadow-brutalist',
          'max-h-full h-full md:h-auto md:max-h-[90vh]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Top Navigation & Close) */}
        <header className="flex-none flex items-center justify-between border-b-4 border-off-black bg-tetris-yellow p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className={cn(
                'inline-flex items-center justify-center w-10 h-10',
                'bg-off-white border-2 border-off-black shadow-brutalist-xs',
                'transition-all duration-200',
                hasPrev ? 'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]' : 'opacity-50 cursor-not-allowed'
              )}
              aria-label="טיפ קודם"
            >
              <ChevronRight size={20} className="text-off-black" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={cn(
                'inline-flex items-center justify-center w-10 h-10',
                'bg-off-white border-2 border-off-black shadow-brutalist-xs',
                'transition-all duration-200',
                hasNext ? 'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]' : 'opacity-50 cursor-not-allowed'
              )}
              aria-label="טיפ הבא"
            >
              <ChevronLeft size={20} className="text-off-black" />
            </button>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'inline-flex items-center justify-center w-10 h-10',
              'bg-tetris-pink border-2 border-off-black shadow-brutalist-xs',
              'transition-all duration-200',
              'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
            )}
            aria-label="חזרה"
          >
            <X size={20} className="text-off-black" />
          </button>
        </header>

        {/* Content Area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar bg-noise">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Meta tags */}
            <div className="flex flex-wrap gap-2 items-center">
              {tip.type && (
                <span className="bg-tetris-purple text-off-white text-sm font-bold font-shimshon px-3 py-1 border-2 border-off-black shadow-brutalist-xs">
                  {tip.type}
                </span>
              )}
              {tip.tags?.map((tag) => {
                const tagBgColor = getTagColor(tag);
                return (
                  <span 
                    key={tag} 
                    className={cn(
                      "px-2 py-1 border-2 border-off-black text-base font-mixed",
                      tagBgColor,
                      getTagTextClass(tagBgColor)
                    )}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>

            <h2 className="text-4xl md:text-5xl font-black font-shimshon text-off-black leading-tight border-b-2 border-off-black/10 pb-4">
              {tip.title}
            </h2>

            <div className="text-lg md:text-xl font-ibm text-dark-gray leading-relaxed break-words">
              {renderContent(tip.content)}
            </div>

            {tip.author && (
              <div className="mt-8 pt-6 border-t-2 border-off-black/10 flex items-center gap-3">
                <div className="w-10 h-10 bg-tetris-cyan border-2 border-off-black flex items-center justify-center font-bold font-shimshon text-lg">
                  {tip.author.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-mid-gray font-ibm">נכתב על ידי</p>
                  <p className="text-base font-bold font-shimshon text-off-black">{tip.author}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer (Bottom Navigation) */}
        <footer className="flex-none border-t-4 border-off-black bg-off-white p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="font-bold font-shimshon text-off-black hover:bg-light-gray px-4 py-2 border-2 border-transparent hover:border-off-black transition-all"
          >
            חזרה לטיפים
          </button>
          
          <div className="flex gap-4">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="font-bold font-shimshon text-dark-gray hover:text-off-black flex items-center gap-1"
              >
                <ChevronRight size={16} /> קודם
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="font-bold font-shimshon text-dark-gray hover:text-off-black flex items-center gap-1"
              >
                הבא <ChevronLeft size={16} />
              </button>
            )}
          </div>
        </footer>

      </div>
    </div>
  );
};

export default TipArticleModal;
