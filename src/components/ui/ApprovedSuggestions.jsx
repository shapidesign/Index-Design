import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getTagColor, getTagTextClass } from '@/lib/tagColors';
import { ExternalLink } from 'lucide-react';

const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test(text);

/**
 * ApprovedSuggestions - Displays suggestions that have been approved
 * by the admin in the Notion suggestions database.
 */
const ApprovedSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/suggestions')
      .then((r) => r.json())
      .then((data) => {
        if (data.suggestions) setSuggestions(data.suggestions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t-2 border-off-black/10">
      <h3 className="text-2xl font-bold font-shimshon text-off-black mb-4">
        הצעות שאושרו
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((s) => {
          // Find the name/title field – look for any non-empty string starting with שם/Name
          const name = s['שם'] || s['Name'] || '';
          const category = s['קטגוריה'] || s['Category'] || s['סוג'] || '';
          const message = s['הודעה'] || s['Message'] || s['Suggestion'] || s['הצעה'] || '';
          const url = s['קישור'] || s['URL'] || s['Link'] || '';
          
          const catColor = getTagColor(category);
          const catText = getTagTextClass(catColor);

          return (
            <div
              key={s.id}
              dir="rtl"
              className={cn(
                'bg-off-white border-2 border-off-black p-4 flex flex-col gap-2',
                'shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-200'
              )}
            >
              {/* Category badge */}
              {category && (
                <span className={cn(
                  'self-start text-xs font-mixed px-2 py-1 border border-off-black',
                  catColor, catText
                )}>
                  {category}
                </span>
              )}
              {/* Message / suggestion content */}
              {message && (
                <p className="text-sm font-ibm text-dark-gray leading-relaxed line-clamp-4">
                  {message}
                </p>
              )}
              {/* Footer: name + url */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-off-black/10">
                {name && (
                  <span className={cn(
                    'text-xs font-shimshon',
                    isEnglish(name) ? 'font-jersey' : 'font-shimshon'
                  )}>
                    {name}
                  </span>
                )}
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tetris-purple hover:text-tetris-orange transition-colors"
                    aria-label="קישור"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovedSuggestions;
