import React, { useState, useCallback, useMemo, useRef, useEffect, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import logoDark from '@/assets/svg/logo-dark.svg';
import logoHero from '@/assets/svg/logo-hero-purple.svg';
import logoIcon from '@/assets/svg/logo-icon.svg';
import { Menu, MessageSquare } from 'lucide-react';
import TetrisShape from '@/components/tetris/TetrisShape';
import TetrisLoader from '@/components/tetris/TetrisLoader';
import MessageSuggestionModal from '@/components/ui/MessageSuggestionModal';
import pkg from '../package.json';

/** Lazy-loaded section components */
const ToolboxSection = lazy(() => import('@/components/sections/ToolboxSection'));
const HallOfFameSection = lazy(() => import('@/components/sections/HallOfFameSection'));
const MuseumSection = lazy(() => import('@/components/sections/MuseumSection'));
const MapSection = lazy(() => import('@/components/sections/MapSection'));

/**
 * App - Main Application Component
 * Tetris Design Hub - אינדקס משאבי עיצוב לסטודנט
 */

const navSections = [
  { id: 'toolbox', label: 'ארגז הכלים' },
  { id: 'museum', label: 'המוזיאון' },
  { id: 'library', label: 'הספרייה' },
  { id: 'map', label: 'המפה' },
  { id: 'tips', label: 'טיפים' },
  { id: 'hallOfFame', label: 'היכל התהילה' },
  { id: 'lucky', label: 'עוגיית מזל' },
];

/** Category cards with matching tetris shape icons */
const categories = [
  { id: 'toolbox', title: 'ארגז הכלים', desc: 'כלים חינמיים ומומלצים לעיצוב', color: 'purple', shape: 'T' },
  { id: 'museum', title: 'המוזיאון', desc: 'מעצבים ויצירות שחובה להכיר', color: 'orange', shape: 'L' },
  { id: 'library', title: 'הספרייה', desc: 'ספרים וחומרי לימוד מומלצים', color: 'blue', shape: 'I' },
  { id: 'map', title: 'המפה', desc: 'מיקומים שימושיים לסטודנטים', color: 'green', shape: 'O' },
  { id: 'tips', title: 'טיפים', desc: 'טיפים וביקורות מסטודנטים', color: 'pink', shape: 'S' },
  { id: 'hallOfFame', title: 'היכל התהילה', desc: 'מעצבים ויצירות שחובה להכיר', color: 'yellow', shape: 'Z' },
  { id: 'lucky', title: 'עוגיית מזל', desc: 'הפתעה! לחצו וגלו משאב אקראי', color: 'cyan', shape: 'J', isLucky: true },
];

/** Non-lucky categories for random selection */
const regularCategories = categories.filter((c) => !c.isLucky);

/** Quick suggestions for the search dropdown */
const quickSuggestions = [
  { label: 'פונטים', query: 'פונטים', color: '#7D53FA' },
  { label: 'צבעים', query: 'צבעים', color: '#FD982E' },
  { label: 'השראה', query: 'השראה', color: '#93C5FD' },
  { label: 'אייקונים', query: 'אייקונים', color: '#36EF79' },
  { label: 'תמונות', query: 'תמונות', color: '#F9A8D4' },
  { label: 'טקסטורות', query: 'טקסטורות', color: '#FDE047' },
  { label: 'מדריכים', query: 'מדריכים', color: '#FD982E' },
  { label: 'תיק עבודות', query: 'תיק עבודות', color: '#7D53FA' },
  { label: 'מוקאפים', query: 'מוקאפים', color: '#36EF79' },
  { label: 'כלי AI', query: 'כלי AI', color: '#93C5FD' },
];

/** Search icon from Figma (purple variant) */
const SearchIcon = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="18 50 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M32 64L29.1333 61.1333M30.6667 57.3333C30.6667 60.2789 28.2789 62.6667 25.3333 62.6667C22.3878 62.6667 20 60.2789 20 57.3333C20 54.3878 22.3878 52 25.3333 52C28.2789 52 30.6667 54.3878 30.6667 57.3333Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const isEnglishText = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test((text || '').trim());

const normalizeSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const toArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const makeTargetId = (sectionId, itemId) =>
  `search-item-${sectionId}-${String(itemId || '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')}`;

const getPreviewText = (text, max = 85) => {
  const clean = String(text || '').trim();
  if (!clean) return '';
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
};

const App = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [luckyHighlight, setLuckyHighlight] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [globalSearchItems, setGlobalSearchItems] = useState([]);
  const [isSearchDataLoading, setIsSearchDataLoading] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const highlightedTargetRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  /** Initial website loading animation */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsInitialLoading(false);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, []);

  /** Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
        setActiveResultIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Fetch searchable datasets for global search */
  useEffect(() => {
    let cancelled = false;

    const buildUnifiedSearchIndex = async () => {
      try {
        setIsSearchDataLoading(true);

        const [resourcesRes, museumRes, hallRes] = await Promise.all([
          fetch('/api/resources'),
          fetch('/api/museum'),
          fetch('/api/hall-of-fame')
        ]);

        if (!resourcesRes.ok || !museumRes.ok || !hallRes.ok) {
          throw new Error('Failed loading global search data');
        }

        const [resourcesJson, museumJson, hallJson] = await Promise.all([
          resourcesRes.json(),
          museumRes.json(),
          hallRes.json()
        ]);

        const resources = (resourcesJson?.results || []).map((item) => ({
          id: item.id,
          sectionId: 'toolbox',
          sectionLabel: 'ארגז הכלים',
          titleHe: item.name || '',
          titleEn: '',
          description: item.description || '',
          tags: toArray(item.tags),
          keywords: [
            item.name,
            item.description,
            ...toArray(item.tags),
            ...toArray(item.types)
          ].filter(Boolean),
          targetId: makeTargetId('toolbox', item.id)
        }));

        const museumItems = (museumJson?.results || []).map((item) => ({
          id: item.id,
          sectionId: 'museum',
          sectionLabel: 'המוזיאון',
          titleHe: item.nameHe || item.name || '',
          titleEn: item.nameEn || '',
          description: item.description || '',
          tags: toArray(item.tags),
          keywords: [
            item.name,
            item.nameHe,
            item.nameEn,
            item.description,
            item.famousWork,
            item.quote,
            item.country,
            ...toArray(item.tags),
            ...toArray(item.type),
            ...toArray(item.era)
          ].filter(Boolean),
          targetId: makeTargetId('museum', item.id)
        }));

        const hallItems = (hallJson?.results || []).map((item) => ({
          id: item.id,
          sectionId: 'hallOfFame',
          sectionLabel: 'היכל התהילה',
          titleHe: item.nameHe || item.name || '',
          titleEn: item.nameEn || '',
          description: item.description || '',
          tags: [...toArray(item.styles), ...toArray(item.fields)],
          keywords: [
            item.name,
            item.nameHe,
            item.nameEn,
            item.description,
            ...toArray(item.styles),
            ...toArray(item.fields),
            ...toArray(item.era)
          ].filter(Boolean),
          targetId: makeTargetId('hallOfFame', item.id)
        }));

        const mapItems = [
          {
            id: 'google-my-maps-main',
            sectionId: 'map',
            sectionLabel: 'המפה',
            titleHe: 'המפה',
            titleEn: 'Google My Maps',
            description: 'אינדקס מקומות למעצבים: בתי דפוס, חנויות, גלריות ומקומות השראה.',
            tags: ['מפה', 'Google Maps', 'My Maps', 'מעצבים'],
            keywords: [
              'המפה',
              'מפה',
              'מיקומים שימושיים',
              'אינדקס מקומות',
              'בתי דפוס',
              'חנויות אמנות',
              'גלריות',
              'השראה',
              'google maps',
              'my maps'
            ],
            targetId: 'section-map'
          }
        ];

        if (!cancelled) {
          setGlobalSearchItems([...resources, ...museumItems, ...hallItems, ...mapItems]);
        }
      } catch (error) {
        console.error('Global search index error:', error);
        if (!cancelled) setGlobalSearchItems([]);
      } finally {
        if (!cancelled) setIsSearchDataLoading(false);
      }
    };

    buildUnifiedSearchIndex();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Handle picking a quick suggestion */
  const handleSuggestionClick = useCallback((query) => {
    setSearchQuery(query);
    setSearchFocused(true);
    setActiveResultIndex(-1);
  }, []);

  /** Global search results across implemented sections */
  const globalSearchResults = useMemo(() => {
    const query = normalizeSearchText(searchQuery);
    if (!query) return [];

    return globalSearchItems
      .map((item) => {
        const titleHe = normalizeSearchText(item.titleHe);
        const titleEn = normalizeSearchText(item.titleEn);
        const description = normalizeSearchText(item.description);
        const tagsText = normalizeSearchText(item.tags.join(' '));
        const keywordsText = normalizeSearchText(item.keywords.join(' '));

        let score = 0;
        if (titleHe === query || titleEn === query) score += 20;
        if (titleHe.includes(query) || titleEn.includes(query)) score += 12;
        if (tagsText.includes(query)) score += 8;
        if (keywordsText.includes(query)) score += 5;
        if (description.includes(query)) score += 3;

        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [globalSearchItems, searchQuery]);

  const displayCategories = categories;

  const clearSearchTargetHighlight = useCallback(() => {
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    if (highlightedTargetRef.current) {
      highlightedTargetRef.current.classList.remove('search-focus-target');
      highlightedTargetRef.current = null;
    }
  }, []);

  const highlightSearchTarget = useCallback((targetEl) => {
    if (!targetEl) return;
    clearSearchTargetHighlight();
    targetEl.classList.add('search-focus-target');
    highlightedTargetRef.current = targetEl;
    highlightTimeoutRef.current = window.setTimeout(() => {
      clearSearchTargetHighlight();
    }, 2200);
  }, [clearSearchTargetHighlight]);

  useEffect(() => {
    return () => clearSearchTargetHighlight();
  }, [clearSearchTargetHighlight]);

  const handleResultSelect = useCallback((result) => {
    if (!result) return;
    clearSearchTargetHighlight();
    setSearchQuery(result.titleHe || result.titleEn || '');
    setSearchFocused(false);
    setActiveResultIndex(-1);
    setActiveSection(result.sectionId);
    setPendingNavigation({ sectionId: result.sectionId, targetId: result.targetId });
  }, [clearSearchTargetHighlight]);

  useEffect(() => {
    if (!pendingNavigation?.sectionId || activeSection !== pendingNavigation.sectionId) return;

    const sectionEl = document.getElementById(`section-${pendingNavigation.sectionId}`);
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (!pendingNavigation.targetId || pendingNavigation.targetId === `section-${pendingNavigation.sectionId}`) {
      setPendingNavigation(null);
      return;
    }

    let attempts = 0;
    const interval = window.setInterval(() => {
      const target = document.getElementById(pendingNavigation.targetId);
      attempts += 1;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightSearchTarget(target);
        window.clearInterval(interval);
        setPendingNavigation(null);
      } else if (attempts >= 15) {
        window.clearInterval(interval);
        setPendingNavigation(null);
      }
    }, 120);

    return () => window.clearInterval(interval);
  }, [activeSection, pendingNavigation, highlightSearchTarget]);

  /** Pick a random category and scroll/highlight it */
  const handleFeelingLucky = useCallback(() => {
    const random = regularCategories[Math.floor(Math.random() * regularCategories.length)];
    setLuckyHighlight(random.id);
    setActiveSection(random.id);
    // Scroll to the card
    const el = document.getElementById(`card-${random.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Clear highlight after animation
    setTimeout(() => setLuckyHighlight(null), 2000);
  }, []);

  if (isInitialLoading) {
    return <TetrisLoader fullScreen />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-off-white text-off-black font-shimshon">

      {/* ===== NAVBAR - Dark for differentiation ===== */}
      <header className="sticky top-0 z-50 bg-off-black border-b-3 border-off-black">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

          {/* Logo icon + logotype - right side in RTL */}
          <button
            onClick={() => { setActiveSection(null); setSearchQuery(''); setSearchFocused(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="אינדקס האב - דף הבית"
            className="shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <img src={logoIcon} alt="" aria-hidden="true" className="w-8 h-8" />
            <img src={logoDark} alt="אינדקס האב" className="h-8 w-auto" />
          </button>

          {/* Desktop Nav - left side in RTL */}
          <div className="hidden lg:flex items-center gap-2">
            <span
              className={cn(
                'inline-block px-3 py-1',
                'bg-tetris-yellow',
                'text-off-black text-xs font-bold font-mono',
                'border-2 border-off-white',
                'shadow-brutalist-nav'
              )}
              aria-label={`גרסה ${pkg.version}`}
              title={`גרסה ${pkg.version}`}
            >
              v{pkg.version}
            </span>
            <button
              type="button"
              onClick={() => setIsSuggestionModalOpen(true)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2',
                'bg-tetris-cyan text-off-black text-sm font-bold font-shimshon',
                'border border-[#555555] shadow-brutalist-nav',
                'hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]',
                'transition-all duration-200'
              )}
            >
              <MessageSquare size={14} />
              <span>שליחת הצעה</span>
            </button>
            <nav className="flex items-center gap-2">
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => section.id === 'lucky' ? handleFeelingLucky() : setActiveSection(section.id)}
                  className={cn(
                    'px-3 py-2',
                    'text-sm font-shimshon whitespace-nowrap',
                    'rounded-[5px]',
                    'border border-[#555555]',
                    'transition-all duration-200',
                    section.id === 'lucky'
                      ? 'bg-tetris-cyan text-off-black shadow-brutalist-nav hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                      : activeSection === section.id
                        ? 'bg-tetris-green text-off-black shadow-brutalist-nav'
                        : 'bg-btn-gray text-[#050505] shadow-brutalist-nav hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile/Tablet left-side controls: version + hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <span
              className={cn(
                'inline-block px-2 py-1',
                'bg-tetris-yellow',
                'text-off-black text-[10px] leading-none font-bold font-mono',
                'border-2 border-off-white',
                'shadow-brutalist-xs'
              )}
              aria-label={`גרסה ${pkg.version}`}
              title={`גרסה ${pkg.version}`}
            >
              v{pkg.version}
            </span>
            <button
              className={cn(
                'w-[34px] h-[34px]',
                'flex items-center justify-center',
                'bg-tetris-purple',
                'rounded-[5px]',
                'border-[1.7px] border-[#555555]',
                'shadow-brutalist-hamburger',
                'transition-all duration-200',
                'hover:shadow-none hover:translate-x-[3.4px] hover:translate-y-[3.4px]'
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'סגור תפריט' : 'פתח תפריט'}
            >
              <Menu size={18} strokeWidth={1.7} className="text-[#EEEEEE]" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[65px] bg-off-black z-40 p-6 overflow-y-auto">
            <nav className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsSuggestionModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'px-6 py-4 text-right',
                  'font-shimshon text-lg',
                  'rounded-[5px]',
                  'border border-[#555555]',
                  'bg-tetris-cyan text-off-black',
                  'shadow-brutalist-nav',
                  'transition-all duration-200'
                )}
              >
                שליחת הצעה
              </button>
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    if (section.id === 'lucky') {
                      handleFeelingLucky();
                    } else {
                      setActiveSection(section.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'px-6 py-4 text-right',
                    'font-shimshon text-lg',
                    'rounded-[5px]',
                    'border border-[#555555]',
                    'shadow-brutalist-nav',
                    'transition-all duration-200',
                    section.id === 'lucky'
                      ? 'bg-tetris-cyan text-off-black'
                      : activeSection === section.id
                        ? 'bg-tetris-green text-off-black shadow-brutalist-nav'
                        : 'bg-btn-gray text-[#050505]'
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ===== MAIN ===== */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero + category cards: hidden when any section is active */}
        {!activeSection && (
          <>
            <section className="text-center mb-8 py-4">
              {/* Logo "אינדקס" from Figma */}
              <div className="flex justify-center mb-4">
                <img
                  src={logoHero}
                  alt="אינדקס"
                  className="h-16 md:h-24 w-auto"
                />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                <span className="text-tetris-purple">משאבי עיצוב לסטודנט</span>
              </h1>
              <p className="text-lg text-dark-gray max-w-2xl mx-auto font-ibm text-balance">
                כל מה שסטודנט לעיצוב גרפי צריך - כלים, טיפוגרפיה, מוקאפים, טיפים מסטודנטים ומיקומים מקומיים
              </p>
            </section>
          </>
        )}

        {/* ===== SEARCH BAR (always visible) ===== */}
        <section className="max-w-xl mx-auto mb-8" ref={searchContainerRef}>
          <div className="relative">
            <div className={cn(
              "flex items-center gap-3",
              "bg-off-white",
              "border-3 border-off-black",
              "shadow-brutalist-sm",
              "px-4 py-3",
              "transition-shadow duration-200",
              "focus-within:shadow-brutalist",
              searchFocused && "shadow-brutalist"
            )}>
              <SearchIcon className="text-tetris-purple shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveResultIndex(-1);
                }}
                onFocus={() => setSearchFocused(true)}
                onClick={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  const hasResults = globalSearchResults.length > 0;
                  if (e.key === 'Escape') {
                    setSearchFocused(false);
                    setActiveResultIndex(-1);
                    return;
                  }
                  if (!hasResults) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveResultIndex((prev) => (prev + 1) % globalSearchResults.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveResultIndex((prev) => (prev <= 0 ? globalSearchResults.length - 1 : prev - 1));
                  } else if (e.key === 'Enter' && activeResultIndex >= 0) {
                    e.preventDefault();
                    handleResultSelect(globalSearchResults[activeResultIndex]);
                  }
                }}
                placeholder="חיפוש..."
                className={cn(
                  "w-full bg-transparent",
                  "text-off-black text-base",
                  isEnglishText(searchQuery) ? "font-pixelify" : "font-shimshon",
                  "placeholder:text-mid-gray placeholder:font-shimshon",
                  "outline-none border-none",
                  "text-right"
                )}
                dir="rtl"
                aria-label="חיפוש משאבים"
                role="combobox"
                aria-expanded={searchFocused}
                aria-haspopup="listbox"
                aria-controls="search-suggestions"
              />
            </div>

            {/* Search Dropdown */}
            {searchFocused && (
              <div
                id="search-suggestions"
                role="listbox"
                aria-label={searchQuery.trim() ? "תוצאות חיפוש כלליות" : "הצעות חיפוש מהירות"}
                className={cn(
                  "absolute top-full left-0 right-0 z-30",
                  "mt-1",
                  "bg-off-white",
                  "border-3 border-off-black",
                  "shadow-brutalist",
                  "p-3",
                  "animate-tetris-stack"
                )}
              >
                {!searchQuery.trim() ? (
                  <>
                    <p className="text-xs font-shimshon text-dark-gray mb-3 text-right">
                      חיפוש מהיר
                    </p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {quickSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.label}
                          role="option"
                          aria-selected={searchQuery === suggestion.query}
                          onClick={() => handleSuggestionClick(suggestion.query)}
                          style={{
                            backgroundColor: searchQuery === suggestion.query
                              ? suggestion.color
                              : undefined,
                            '--suggestion-color': suggestion.color,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = suggestion.color; }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = searchQuery === suggestion.query
                              ? suggestion.color
                              : '';
                          }}
                          className={cn(
                            "px-3 py-1.5",
                            "font-shimshon text-sm",
                            "text-off-black",
                            "border-2 border-off-black",
                            "shadow-brutalist-xs",
                            "transition-all duration-200",
                            "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                            "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
                            "cursor-pointer",
                            searchQuery !== suggestion.query && "bg-light-gray"
                          )}
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {isSearchDataLoading ? (
                      <p className="text-sm font-ibm text-mid-gray text-right py-2">טוען תוצאות...</p>
                    ) : globalSearchResults.length === 0 ? (
                      <p className="text-sm font-ibm text-mid-gray text-right py-2">לא נמצאו תוצאות לחיפוש זה</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {globalSearchResults.map((result, index) => (
                          <button
                            key={`${result.sectionId}-${result.id}`}
                            role="option"
                            aria-selected={activeResultIndex === index}
                            onClick={() => handleResultSelect(result)}
                            className={cn(
                              "w-full p-3 text-right",
                              "bg-light-gray border-2 border-off-black",
                              "shadow-brutalist-xs",
                              "transition-all duration-200",
                              "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                              activeResultIndex === index && "bg-tetris-yellow/40"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[11px] font-shimshon px-2 py-0.5 bg-off-white border border-off-black">
                                {result.sectionLabel}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-off-black font-shimshon">
                                  {result.titleHe || result.titleEn}
                                </p>
                                {result.titleEn && result.titleEn !== result.titleHe && (
                                  <p className="text-xs text-mid-gray font-pixelify mt-0.5">{result.titleEn}</p>
                                )}
                                {result.description && (
                                  <p className="text-xs text-dark-gray font-ibm mt-1">
                                    {getPreviewText(result.description)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ===== CATEGORY CARDS (hidden when any section is active) ===== */}
        {!activeSection && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCategories.map((card) => (
              <article
                key={card.id}
                id={`card-${card.id}`}
                onClick={() => card.isLucky ? handleFeelingLucky() : setActiveSection(card.id)}
                className={cn(
                  "p-6",
                  "bg-off-white",
                  "border-3 border-off-black",
                  "shadow-brutalist",
                  "hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]",
                  "transition-all duration-200",
                  "group cursor-pointer",
                  luckyHighlight === card.id && "animate-line-clear",
                  card.isLucky && "bg-tetris-cyan/10"
                )}
              >
                {/* Tetris shape icon - size=14 means each cube is 14px */}
                <div className="mb-4 flex items-center justify-start overflow-hidden">
                  <div className={cn(
                    "w-16 h-16 flex items-center justify-center",
                    "transition-transform duration-300",
                    "group-hover:rotate-90"
                  )}>
                    <TetrisShape type={card.shape} color={card.color} size={14} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-off-black text-right mb-2 font-shimshon">
                  {card.title}
                </h3>
                <p className="text-base text-dark-gray text-right font-ibm">
                  {card.desc}
                </p>
              </article>
            ))}
          </section>
        )}

        {/* ===== TOOLBOX SECTION ===== */}
        {activeSection === 'toolbox' && (
          <div className="mt-12" id="section-toolbox">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className={cn(
                  "px-4 py-2",
                  "font-shimshon text-sm font-bold text-off-black",
                  "bg-light-gray",
                  "border-2 border-off-black",
                  "shadow-brutalist-xs",
                  "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                  "transition-all duration-200"
                )}
              >
                חזרה לכל הקטגוריות
              </button>
            </div>
            <Suspense fallback={<TetrisLoader className="min-h-[400px]" />}>
              <ToolboxSection />
            </Suspense>
          </div>
        )}

        {/* ===== HALL OF FAME SECTION ===== */}
        {activeSection === 'hallOfFame' && (
          <div className="mt-12" id="section-hallOfFame">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className={cn(
                  "px-4 py-2",
                  "font-shimshon text-sm font-bold text-off-black",
                  "bg-light-gray",
                  "border-2 border-off-black",
                  "shadow-brutalist-xs",
                  "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                  "transition-all duration-200"
                )}
              >
                חזרה לכל הקטגוריות
              </button>
            </div>
            <Suspense fallback={<TetrisLoader className="min-h-[400px]" />}>
              <HallOfFameSection />
            </Suspense>
          </div>
        )}

        {/* ===== MUSEUM SECTION ===== */}
        {activeSection === 'museum' && (
          <div className="mt-12" id="section-museum">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className={cn(
                  "px-4 py-2",
                  "font-shimshon text-sm font-bold text-off-black",
                  "bg-light-gray",
                  "border-2 border-off-black",
                  "shadow-brutalist-xs",
                  "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                  "transition-all duration-200"
                )}
              >
                חזרה לכל הקטגוריות
              </button>
            </div>
            <Suspense fallback={<TetrisLoader className="min-h-[400px]" />}>
              <MuseumSection />
            </Suspense>
          </div>
        )}

        {/* ===== MAP SECTION ===== */}
        {activeSection === 'map' && (
          <div className="mt-12" id="section-map">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className={cn(
                  "px-4 py-2",
                  "font-shimshon text-sm font-bold text-off-black",
                  "bg-light-gray",
                  "border-2 border-off-black",
                  "shadow-brutalist-xs",
                  "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                  "transition-all duration-200"
                )}
              >
                חזרה לכל הקטגוריות
              </button>
            </div>
            <Suspense fallback={<TetrisLoader className="min-h-[400px]" />}>
              <MapSection />
            </Suspense>
          </div>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t-3 border-off-black bg-off-black text-off-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={() => setIsSuggestionModalOpen(true)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2',
                'bg-tetris-green text-off-black text-sm font-bold font-shimshon',
                'border-2 border-off-white',
                'shadow-brutalist-xs',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-200'
              )}
            >
              <MessageSquare size={15} />
              <span>רוצים להציע תוכן לאתר?</span>
            </button>
          </div>
          <p className="text-sm text-dark-gray font-ibm">
            נבנה על ידי יהונתן שפירא, 2026
          </p>
        </div>
      </footer>

      <MessageSuggestionModal
        open={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
      />
    </div>
  );
};

export default App;
