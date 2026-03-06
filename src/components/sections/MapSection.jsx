import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, Map, List } from 'lucide-react';
import pinArtStore from '../../../Pins/p1-2.png';
import pinPrintShop from '../../../Pins/p2-2.png';
import pinProfessionals from '../../../Pins/p4-2.png';
import pinSuppliers from '../../../Pins/p5-2.png';

const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps/d/u/0/embed?mid=1F_s6PIi59T-J0hgTAwJAzbzG9Ru_Kgo&ehbc=2E312F&noprof=1';

const GOOGLE_MAPS_EDIT_URL =
  'https://www.google.com/maps/d/u/0/edit?mid=1F_s6PIi59T-J0hgTAwJAzbzG9Ru_Kgo&usp=sharing';

const MAP_LEGEND_ITEMS = [
  { id: 'art-stores', label: 'חנויות יצירה ואומנות', image: pinArtStore, desc: 'חנויות לציוד יצירה ואומנות' },
  { id: 'print-shops', label: 'בתי דפוס', image: pinPrintShop, desc: 'דפוס וגרפיקה' },
  { id: 'professionals', label: 'בעלי מקצוע', image: pinProfessionals, desc: 'בעלי מקצוע בתחום העיצוב' },
  { id: 'suppliers', label: 'ספקים', image: pinSuppliers, desc: 'ספקי שירות' }
];

/**
 * MapSection - המפה
 * Embeds the custom Google My Maps board in site style.
 */
const MapSection = () => {
  const [viewMode, setViewMode] = useState('map');

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

        {/* View toggle */}
        <div className="flex border-2 border-off-black">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'map' ? 'bg-tetris-purple text-off-white' : 'bg-off-white text-off-black hover:bg-light-gray'
            )}
            aria-label="תצוגת מפה"
          >
            <Map size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 border-r-2 border-off-black transition-colors',
              viewMode === 'list' ? 'bg-tetris-purple text-off-white' : 'bg-off-white text-off-black hover:bg-light-gray'
            )}
            aria-label="תצוגת רשימה"
          >
            <List size={16} />
          </button>
        </div>
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

        {viewMode === 'map' && (
          <>
            <div className="mb-4 border-3 border-off-black bg-light-gray p-3 md:p-4 shadow-brutalist-sm">
              <h3 className="text-sm md:text-base font-bold text-off-black font-shimshon text-right mb-3">
                מקרא
              </h3>
              <div className="flex flex-wrap justify-end gap-3 md:gap-4">
                {MAP_LEGEND_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-2 border-2 border-off-black bg-off-white px-3 py-2"
                  >
                    <span className="text-sm font-shimshon text-off-black">{item.label}</span>
                    <img
                      src={item.image}
                      alt={`סמל ${item.label}`}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
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
          </>
        )}

        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {MAP_LEGEND_ITEMS.map((item) => (
              <a
                key={item.id}
                href={GOOGLE_MAPS_EDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-4 p-4',
                  'bg-off-white border-3 border-off-black shadow-brutalist',
                  'hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]',
                  'transition-all duration-200 text-right'
                )}
              >
                <img
                  src={item.image}
                  alt={`סמל ${item.label}`}
                  className="w-12 h-12 object-contain shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold font-shimshon text-off-black">{item.label}</h3>
                  {item.desc && (
                    <p className="text-sm text-dark-gray font-ibm mt-0.5">{item.desc}</p>
                  )}
                </div>
                <ExternalLink size={16} className="text-tetris-green shrink-0" aria-hidden />
              </a>
            ))}
          </div>
        )}

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
