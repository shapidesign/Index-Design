import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, Map, List, ChevronDown, ChevronUp, MapPin, Phone } from 'lucide-react';
import pinArtStore from '../../../Pins/p1-2.png';
import pinPrintShop from '../../../Pins/p2-2.png';
import pinProfessionals from '../../../Pins/p4-2.png';
import pinSuppliers from '../../../Pins/p5-2.png';

const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps/d/u/0/embed?mid=1F_s6PIi59T-J0hgTAwJAzbzG9Ru_Kgo&ehbc=2E312F&noprof=1';

const GOOGLE_MAPS_EDIT_URL =
  'https://www.google.com/maps/d/u/0/edit?mid=1F_s6PIi59T-J0hgTAwJAzbzG9Ru_Kgo&usp=sharing';

/* ─── Category definitions ─── */
const CATEGORIES = [
  { id: 'art-stores', label: 'חנויות יצירה ואומנות', image: pinArtStore, desc: 'חנויות לציוד יצירה ואומנות', color: 'bg-tetris-orange' },
  { id: 'print-shops', label: 'בתי דפוס', image: pinPrintShop, desc: 'דפוס וגרפיקה', color: 'bg-tetris-purple' },
  { id: 'professionals', label: 'בעלי מקצוע', image: pinProfessionals, desc: 'בעלי מקצוע בתחום העיצוב', color: 'bg-tetris-green' },
  { id: 'suppliers', label: 'ספקים', image: pinSuppliers, desc: 'ספקי שירות', color: 'bg-tetris-blue' },
];

/**
 * Hardcoded places extracted from the Google My Maps KML.
 * Each place has: name, category (matching CATEGORIES.id), and optional description/coords.
 */
const PLACES = [
  /* ── חנויות יצירה ואומנות ── */
  { name: 'קסם האומנות', category: 'art-stores', coords: [35.5512, 32.9825] },
  { name: 'המרכז לאומן - באר שבע', category: 'art-stores', coords: [34.7988, 31.2474] },
  { name: 'Shirbutim', category: 'art-stores', description: 'החנות בחדרה. אורלי - 0506508669', coords: [34.9156, 32.4332] },
  { name: 'ארט דיפו חנות המחסן ART DEPOT', category: 'art-stores', coords: [34.9150, 32.4475] },
  { name: 'רפידו ציוד משרדי - נתניה', category: 'art-stores', coords: [34.8567, 32.3301] },
  { name: 'ארט כפר סבא', category: 'art-stores', coords: [34.9082, 32.1760] },
  { name: 'ארט אורי פרץ', category: 'art-stores', coords: [34.7889, 31.2384] },
  { name: 'לב התחביב', category: 'art-stores', coords: [34.7985, 31.8977] },
  { name: 'האָטֶלְיֶה - בית לאמנות', category: 'art-stores', coords: [34.7727, 32.0522] },
  { name: 'Hobi Lobi 2005', category: 'art-stores', coords: [34.8155, 32.0597] },
  { name: 'דרור ליצירה רמת גן', category: 'art-stores', coords: [34.8143, 32.0794] },
  { name: 'ארט סנטר', category: 'art-stores', coords: [34.7749, 32.0751] },
  { name: 'Chubu - צ\'ובו', category: 'art-stores', coords: [34.7708, 32.0594] },
  { name: 'ארטולס | ראשון לציון', category: 'art-stores', coords: [34.7710, 31.9698] },
  { name: 'ארטולס | סניף חולון', category: 'art-stores', coords: [34.7749, 32.0144] },
  { name: 'Art Set - Art supplies shop', category: 'art-stores', coords: [35.2151, 31.7803] },
  { name: 'Fixline', category: 'art-stores', coords: [34.8005, 31.9624] },
  { name: 'Top Art', category: 'art-stores', coords: [34.8409, 32.1666] },
  { name: 'Artistic Hands', category: 'art-stores', coords: [35.2148, 31.7809] },
  { name: 'אסכולה', category: 'art-stores', coords: [34.7738, 32.0105] },
  { name: 'Arta', category: 'art-stores', coords: [34.7726, 32.0613] },
  { name: 'ארטא חולון / ארט פוינט', category: 'art-stores', coords: [34.7733, 32.0230] },
  { name: 'kanvas', category: 'art-stores', coords: [34.7631, 32.0577] },
  { name: 'Mai-art', category: 'art-stores', coords: [34.7730, 32.0797] },
  { name: 'Ronbi', category: 'art-stores', coords: [34.8118, 31.8974] },
  { name: 'אקוורל קרית אונו', category: 'art-stores', coords: [34.8633, 32.0547] },
  { name: 'Aqvarel', category: 'art-stores', coords: [34.8896, 32.1757] },
  { name: 'Artistim', category: 'art-stores', coords: [34.8626, 32.2754] },

  /* ── בתי דפוס ── */
  { name: 'חולון גרף', category: 'print-shops', coords: [34.7816, 32.0167] },
  { name: 'פרינטיקה - Printika', category: 'print-shops', description: 'דפוס דיגיטלי להדפסה על מוצרים וחולצות בהתאמה אישית', coords: [34.8118, 31.9780] },
  { name: 'Yprint', category: 'print-shops', description: 'Professional Printing House', coords: [34.7670, 32.0565] },
  { name: 'בית דפוס דקל', category: 'print-shops', coords: [34.7713, 32.0644] },
  { name: 'נועה שירותי העתקות', category: 'print-shops', description: 'הדפסה, סריקה וצילום תכניות בניה', coords: [34.7753, 31.8101] },
  { name: 'פרפל פרינט', category: 'print-shops', coords: [34.8130, 31.8896] },
  { name: 'Graphos Print', category: 'print-shops', coords: [35.2143, 31.7807] },
  { name: 'Dojo Jerusalem', category: 'print-shops', coords: [35.2128, 31.7809] },
  { name: 'תא תרבות המחוגה', category: 'print-shops', coords: [34.7667, 32.0572] },
  { name: 'pyramid', category: 'print-shops', coords: [35.0035, 32.8107] },
  { name: 'HC Studio Editions', category: 'print-shops', coords: [34.7912, 32.0688] },
  { name: 'ArtScan - ארטסקאן', category: 'print-shops', coords: [34.8237, 32.0931] },
  { name: 'Tap-Print', category: 'print-shops', coords: [34.9136, 32.4381] },
  { name: 'רע - בית מלאכה לצילום | The Print House', category: 'print-shops', coords: [34.7657, 32.0495] },
  { name: 'Print Station Haifa', category: 'print-shops', coords: [35.0013, 32.8103] },
  { name: 'סדנת ההדפס ירושלים (חל"צ)', category: 'print-shops', coords: [35.2249, 31.7842] },
  { name: 'דפוס השלמה', category: 'print-shops', coords: [34.7874, 32.0649] },
  { name: 'פוטוגרפיקס', category: 'print-shops', coords: [34.7814, 32.0673] },
  { name: 'קובי - רן (1989) בע"מ', category: 'print-shops', coords: [34.8026, 32.0882] },
  { name: 'Nachlieli Printing', category: 'print-shops', coords: [34.7824, 32.0612] },
  { name: 'שיא קופי - c-copy', category: 'print-shops', description: 'בית דפוס בתל אביב', coords: [34.7873, 32.0674] },
  { name: 'דפוס אילן', category: 'print-shops', coords: [34.7768, 32.0547] },
  { name: 'קודף בע"מ', category: 'print-shops', coords: [34.7888, 32.0673] },
  { name: 'ע.ר. הדפסות', category: 'print-shops', coords: [34.7817, 32.0627] },
  { name: 'ארט פלוס בע"מ', category: 'print-shops', coords: [35.2072, 31.7498] },
  { name: 'דיל דיגיטל / Fizzy Stickers', category: 'print-shops', description: 'תעשיות דפוס, סטיקרים', coords: [34.7696, 32.0503] },

  /* ── ספקים ── */
  { name: 'מדן נייר', category: 'suppliers', coords: [34.7819, 32.0537] },
  { name: 'מפעל סיכות', category: 'suppliers', coords: [34.8162, 31.9742] },
  { name: 'פייפרנט בע"מ', category: 'suppliers', description: 'שווק ומסחר בנייר וקרטון', coords: [34.7873, 32.0674] },
  { name: 'Sharon Trading Ltd.', category: 'suppliers', coords: [34.9752, 31.9215] },

  /* ── בעלי מקצוע ── */
  { name: 'אברהם פרץ - כורך', category: 'professionals', description: 'https://talisimantov.wixsite.com/perez', link: 'https://talisimantov.wixsite.com/perez', coords: [34.7512, 32.0129] },
  { name: 'כריכיית אברהם פרץ', category: 'professionals', coords: [34.7479, 32.0103] },
  { name: 'כריכיית צימבר', category: 'professionals', coords: [34.7693, 32.0529] },
  { name: 'דניאל בלום - כורך', category: 'professionals', coords: [34.7721, 32.0659] },
  { name: 'חיתוך בלייזר ארטק לייזר', category: 'professionals', coords: [34.8032, 32.0867] },
  { name: 'אלקוסר שלטים', category: 'professionals', coords: [34.8038, 32.0879] },
  { name: 'לייזר קאט תעשיות', category: 'professionals', description: 'חיתוך בלייזר ו-CNC', coords: [34.8026, 32.0127] },
  { name: 'The Papercut Factory', category: 'professionals', coords: [34.7668, 32.0532] },
  { name: 'ארט לייזר', category: 'professionals', coords: [34.8972, 32.1030] },
  { name: 'Gotsgndh seals', category: 'professionals', coords: [34.7744, 32.0607] },
  { name: 'ברינר חותמות', category: 'professionals', coords: [34.8913, 32.1039] },
  { name: 'חותמות הגשר', category: 'professionals', description: 'שירות מהיר ואמין', coords: [34.7822, 32.0650] },
  { name: 'Axelera 3D', category: 'professionals', coords: [34.7899, 32.0623] },
  { name: 'Studio Hagai Farago - סטודיו חגי פרגו', category: 'professionals', coords: [34.7653, 32.0573] },
];

/** Build a Google Maps directions link from coords */
const buildMapsLink = (coords) => {
  if (!coords) return null;
  return `https://www.google.com/maps/search/?api=1&query=${coords[1]},${coords[0]}`;
};

/**
 * Category group — collapsible section with places list
 */
const CategoryGroup = ({ category, places, defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-3 border-off-black bg-off-white shadow-brutalist-sm overflow-hidden">
      {/* Category header — clickable toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 p-3 md:p-4 text-right',
          'transition-colors duration-200',
          'hover:bg-light-gray',
          isOpen && 'border-b-3 border-off-black'
        )}
      >
        <img
          src={category.image}
          alt={`סמל ${category.label}`}
          className="w-10 h-10 object-contain shrink-0"
          loading="lazy"
          decoding="async"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold font-shimshon text-off-black text-lg">
            {category.label}
          </h3>
          <p className="text-xs text-dark-gray font-ibm mt-0.5">
            {category.desc} · {places.length} מקומות
          </p>
        </div>
        <span className={cn(
          'inline-flex items-center justify-center w-7 h-7 shrink-0',
          'border-2 border-off-black bg-light-gray',
          'transition-transform duration-200',
        )}>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Places list */}
      {isOpen && (
        <div className="divide-y-2 divide-light-gray">
          {places.map((place, idx) => {
            const mapsLink = buildMapsLink(place.coords);
            return (
              <div
                key={`${place.name}-${idx}`}
                className={cn(
                  'flex items-start gap-3 p-3 md:px-4 md:py-3',
                  'hover:bg-light-gray/60 transition-colors duration-150',
                  'text-right'
                )}
              >
                {/* Place info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold font-shimshon text-off-black text-sm md:text-base leading-snug">
                    {place.name}
                  </p>
                  {place.description && !place.description.startsWith('http') && (
                    <p className="text-xs text-dark-gray font-ibm mt-1 leading-relaxed">
                      {place.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  {place.link && (
                    <a
                      href={place.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center justify-center w-8 h-8',
                        'border-2 border-off-black bg-tetris-green',
                        'shadow-brutalist-xs',
                        'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                        'transition-all duration-200'
                      )}
                      title="אתר"
                    >
                      <ExternalLink size={13} className="text-off-black" />
                    </a>
                  )}
                  {mapsLink && (
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center justify-center w-8 h-8',
                        'border-2 border-off-black bg-tetris-blue',
                        'shadow-brutalist-xs',
                        'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                        'transition-all duration-200'
                      )}
                      title="פתח במפות גוגל"
                    >
                      <MapPin size={13} className="text-off-black" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * MapSection - המפה
 * Embeds the custom Google My Maps board + a full list view of all places.
 */
const MapSection = () => {
  const [viewMode, setViewMode] = useState('map');
  const [activeFilters, setActiveFilters] = useState(new Set(CATEGORIES.map((c) => c.id)));

  /** Toggle a category filter */
  const toggleFilter = (categoryId) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        // Don't allow deselecting all
        if (next.size > 1) next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  /** Select only one category */
  const selectOnly = (categoryId) => {
    setActiveFilters(new Set([categoryId]));
  };

  /** Select all categories */
  const selectAll = () => {
    setActiveFilters(new Set(CATEGORIES.map((c) => c.id)));
  };

  /** Group places by category */
  const groupedPlaces = useMemo(() => {
    return CATEGORIES
      .filter((cat) => activeFilters.has(cat.id))
      .map((cat) => ({
        category: cat,
        places: PLACES.filter((p) => p.category === cat.id),
      }));
  }, [activeFilters]);

  const totalVisible = useMemo(
    () => groupedPlaces.reduce((sum, g) => sum + g.places.length, 0),
    [groupedPlaces]
  );

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
                {CATEGORIES.map((item) => (
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
          <>
            {/* Category filter chips */}
            <div className="mb-4 flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                onClick={selectAll}
                className={cn(
                  'px-3 py-1.5 text-xs font-shimshon font-bold',
                  'border-2 border-off-black',
                  'transition-all duration-200',
                  activeFilters.size === CATEGORIES.length
                    ? 'bg-off-black text-off-white'
                    : 'bg-off-white text-off-black hover:bg-light-gray shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                )}
              >
                הכל ({PLACES.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    activeFilters.has(cat.id) && activeFilters.size === 1
                      ? selectAll()
                      : activeFilters.size === CATEGORIES.length
                        ? selectOnly(cat.id)
                        : toggleFilter(cat.id)
                  }
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-shimshon font-bold',
                    'border-2 border-off-black',
                    'transition-all duration-200',
                    activeFilters.has(cat.id) && activeFilters.size < CATEGORIES.length
                      ? `${cat.color} text-off-black`
                      : 'bg-off-white text-off-black hover:bg-light-gray shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                  )}
                >
                  <img
                    src={cat.image}
                    alt=""
                    className="w-4 h-4 object-contain"
                    aria-hidden
                  />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Places count */}
            <p className="text-xs text-mid-gray font-ibm text-right mb-3">
              מציג {totalVisible} מקומות
            </p>

            {/* Category groups */}
            <div className="flex flex-col gap-4">
              {groupedPlaces.map((group) => (
                <CategoryGroup
                  key={group.category.id}
                  category={group.category}
                  places={group.places}
                  defaultOpen={groupedPlaces.length <= 2}
                />
              ))}
            </div>
          </>
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
