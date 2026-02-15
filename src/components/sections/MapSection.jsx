import React from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, MapPinned } from 'lucide-react';

const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps/d/u/0/embed?mid=1F_s6PIi59T-J0hgTAwJAzbzG9Ru_Kgo&ehbc=2E312F&noprof=1';

const GOOGLE_MAPS_EDIT_URL =
  'https://www.google.com/maps/d/u/0/edit?mid=1F_s6PIi59T-J0hgTAwJAzbzG9Ru_Kgo&usp=sharing';

/**
 * MapSection - המפה
 * Embeds the custom Google My Maps board in site style.
 */
const MapSection = () => {
  return (
    <section dir="rtl" className="animate-tetris-stack">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-off-black font-shimshon">
            המפה
          </h2>
          <span className="font-shimshon text-sm text-dark-gray">
            אינדקס מקומות למעצבים
          </span>
        </div>
        <MapPinned size={24} className="text-tetris-green" aria-hidden="true" />
      </div>

      <div
        className={cn(
          'bg-off-white border-3 border-off-black shadow-brutalist',
          'p-4 md:p-5'
        )}
      >
        <div className="mb-4">
          <p className="text-sm md:text-base text-dark-gray font-ibm text-right leading-relaxed">
            כאן תמצאו את כל המקומות השימושיים לסטודנטים לעיצוב - בתי דפוס, חנויות, גלריות,
            מקומות השראה ועוד.
          </p>
        </div>

        <div className="border-3 border-off-black bg-light-gray shadow-brutalist-sm overflow-hidden">
          <div className="aspect-video w-full">
            <iframe
              src={GOOGLE_MAPS_EMBED_URL}
              title="אינדקס - הכל למעצב"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <a
            href={GOOGLE_MAPS_EDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2',
              'bg-tetris-green text-off-black',
              'font-shimshon text-sm font-bold',
              'border-2 border-off-black shadow-brutalist-xs',
              'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
              'transition-all duration-200'
            )}
          >
            <span>פתחו את המפה במסך מלא</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
