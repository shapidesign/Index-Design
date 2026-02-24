import React, { useState, useCallback, useMemo, useRef, useEffect, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import logoDark from '@/assets/svg/logo-dark.svg';
import logoHero from '@/assets/svg/logo-hero-purple.svg';
import logoIcon from '@/assets/svg/logo-icon.svg';
import hitLogo from '@/assets/images/hit-logo.png';
import { Menu, MessageSquare, Heart } from 'lucide-react';
import TetrisShape from '@/components/tetris/TetrisShape';
import TetrisLoader from '@/components/tetris/TetrisLoader';
import MessageSuggestionModal from '@/components/ui/MessageSuggestionModal';
import SupportModal from '@/components/ui/SupportModal';
import WhatsNewModal from '@/components/ui/WhatsNewModal';
import EyeLogo from '@/components/ui/EyeLogo';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import pkg from '../package.json';

/** Lazy-loaded section components */
const CHUNK_RELOAD_FLAG = 'chunk-reload-attempted';

const lazyWithChunkRecovery = (importer) =>
  lazy(async () => {
    try {
      const mod = await importer();
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
      }
      return mod;
    } catch (error) {
      const message = String(error?.message || '');
      const isChunkFetchError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed');

      if (typeof window !== 'undefined' && isChunkFetchError) {
        const alreadyReloaded = window.sessionStorage.getItem(CHUNK_RELOAD_FLAG) === 'true';
        if (!alreadyReloaded) {
          window.sessionStorage.setItem(CHUNK_RELOAD_FLAG, 'true');
          window.location.reload();
          return new Promise(() => {});
        }
      }

      throw error;
    }
  });

const ToolboxSection = lazyWithChunkRecovery(() => import('@/components/sections/ToolboxSection'));
const HallOfFameSection = lazyWithChunkRecovery(() => import('@/components/sections/HallOfFameSection'));
const MuseumSection = lazyWithChunkRecovery(() => import('@/components/sections/MuseumSection'));
const LibrarySection = lazyWithChunkRecovery(() => import('@/components/sections/LibrarySection'));
const MapSection = lazyWithChunkRecovery(() => import('@/components/sections/MapSection'));
const TipsSection = lazyWithChunkRecovery(() => import('@/components/sections/TipsSection'));

/**
 * App - Main Application Component
 * Tetris Design Hub - אינדקס משאבי עיצוב לסטודנט
 */

const navSections = [
  { id: 'toolbox', label: 'ארגז הכלים' },
  { id: 'museum', label: 'המוזיאון' },
  { id: 'library', label: 'הספרייה' },
  { id: 'hallOfFame', label: 'היכל התהילה' },
  { id: 'map', label: 'המפה' },
  { id: 'tips', label: 'טיפים' },
  { id: 'lucky', label: 'הפתעה' },
];

/** Category cards with matching tetris shape icons */
const categories = [
  { id: 'toolbox', title: 'ארגז הכלים', desc: 'כלים חינמיים ומומלצים לעיצוב', color: 'purple', shape: 'T' },
  { id: 'museum', title: 'המוזיאון', desc: 'מעצבים ויצירות שחובה להכיר', color: 'orange', shape: 'L' },
  { id: 'library', title: 'הספרייה', desc: 'ספרים וחומרי לימוד מומלצים', color: 'blue', shape: 'I' },
  { id: 'hallOfFame', title: 'היכל התהילה', desc: 'מאסטרים, זרמים ושפות חזותיות שחובה ללמוד', color: 'yellow', shape: 'Z' },
  { id: 'map', title: 'המפה', desc: 'מיקומים שימושיים לסטודנטים', color: 'green', shape: 'O' },
  { id: 'tips', title: 'טיפים', desc: 'טיפים וביקורות מסטודנטים', color: 'pink', shape: 'S' },
  { id: 'lucky', title: 'הפתעה', desc: 'דף הפתעה עם כרטיס אקראי במיוחד בשבילך', color: 'cyan', shape: 'J', isLucky: true },
];

/** Sections that can be selected by the fortune cookie */
const luckySectionIds = ['toolbox', 'museum', 'library', 'hallOfFame'];

/** Quick suggestions for the search dropdown */
const quickSuggestions = [
  { label: 'פונטים', query: 'פונטים', bgClass: 'bg-tetris-purple' },
  { label: 'צבעים', query: 'צבעים', bgClass: 'bg-tetris-orange' },
  { label: 'השראה', query: 'השראה', bgClass: 'bg-tetris-blue' },
  { label: 'אייקונים', query: 'אייקונים', bgClass: 'bg-tetris-green' },
  { label: 'תמונות', query: 'תמונות', bgClass: 'bg-tetris-pink' },
  { label: 'טקסטורות', query: 'טקסטורות', bgClass: 'bg-tetris-yellow' },
  { label: 'מדריכים', query: 'מדריכים', bgClass: 'bg-tetris-orange' },
  { label: 'תיק עבודות', query: 'תיק עבודות', bgClass: 'bg-tetris-purple' },
  { label: 'מוקאפים', query: 'מוקאפים', bgClass: 'bg-tetris-green' },
  { label: 'כלי AI', query: 'כלי AI', bgClass: 'bg-tetris-cyan' },
];

const suggestionTextClass = (bgClass) =>
  bgClass === 'bg-tetris-purple' ? 'text-off-white' : 'text-off-black';

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

/** Bump this to show "What's New" again for returning users */
const WHATS_NEW_VERSION = 'v1';

const WHATS_NEW_STORAGE_KEY = 'index-whats-new-seen';

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
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [luckyPick, setLuckyPick] = useState(null);
  const searchContainerRef = useRef(null);
  const highlightedTargetRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const lastLuckyTargetRef = useRef(null);

  /** Initial website loading animation */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsInitialLoading(false);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, []);

  /** Show "What's New" once per user per version (after initial load) */
  useEffect(() => {
    if (isInitialLoading) return;
    const timer = window.setTimeout(() => {
      try {
        const seen = localStorage.getItem(WHATS_NEW_STORAGE_KEY);
        if (seen !== WHATS_NEW_VERSION) {
          setIsWhatsNewOpen(true);
        }
      } catch {
        /* localStorage unavailable */
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [isInitialLoading]);

  const handleWhatsNewClose = useCallback(() => {
    setIsWhatsNewOpen(false);
    try {
      localStorage.setItem(WHATS_NEW_STORAGE_KEY, WHATS_NEW_VERSION);
    } catch {
      /* localStorage unavailable */
    }
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

        const fetchJsonOrEmpty = async (url, label) => {
          try {
            const res = await fetch(url);
            if (!res.ok) {
              console.info(`Global search source unavailable: ${label} (${res.status})`);
              return { results: [] };
            }
            return await res.json();
          } catch (error) {
            console.info(`Global search source failed: ${label}`, error);
            return { results: [] };
          }
        };

        const [resourcesJson, museumJson, hallJson, booksJson] = await Promise.all([
          fetchJsonOrEmpty('/api/resources', 'resources'),
          fetchJsonOrEmpty('/api/museum', 'museum'),
          fetchJsonOrEmpty('/api/hall-of-fame', 'hall-of-fame'),
          fetchJsonOrEmpty('/api/books', 'books')
        ]);

        const resources = (resourcesJson?.results || []).map((item) => ({
          id: item.id,
          sectionId: 'toolbox',
          sectionLabel: 'ארגז הכלים',
          titleHe: item.name || '',
          titleEn: '',
          description: item.description || '',
          link: item.link || '',
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
          link: item.link || '',
          tags: toArray(item.tags),
          keywords: [
            item.name,
            item.nameHe,
            item.nameEn,
            item.description,
            item.famousWork,
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
          link: item.link || '',
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

        const libraryItems = (booksJson?.results || []).map((item) => ({
          id: item.id,
          sectionId: 'library',
          sectionLabel: 'הספרייה',
          titleHe: item.title || '',
          titleEn: '',
          description: item.description || '',
          link: item.link || '',
          tags: toArray(item.tags),
          keywords: [
            item.title,
            item.author,
            item.year,
            item.description,
            ...toArray(item.tags)
          ].filter(Boolean),
          targetId: makeTargetId('library', item.id)
        }));

        const mapItems = [
          {
            id: 'google-my-maps-main',
            sectionId: 'map',
            sectionLabel: 'המפה',
            titleHe: 'המפה',
            titleEn: 'Google My Maps',
            description: 'אינדקס מקומות למעצבים: בתי דפוס, חנויות, גלריות ומקומות השראה.',
            link: '',
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
          setGlobalSearchItems([...resources, ...museumItems, ...hallItems, ...libraryItems, ...mapItems]);
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
  const luckyItems = useMemo(
    () => globalSearchItems.filter((item) => luckySectionIds.includes(item.sectionId) && item.targetId),
    [globalSearchItems]
  );

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
      } else if (attempts >= 40) {
        window.clearInterval(interval);
        setPendingNavigation(null);
      }
    }, 200);

    return () => window.clearInterval(interval);
  }, [activeSection, pendingNavigation, highlightSearchTarget]);

  /** Pick a random card for the dedicated surprise page */
  const handleFeelingLucky = useCallback(() => {
    clearSearchTargetHighlight();
    setPendingNavigation(null);
    setActiveSection('lucky');

    if (luckyItems.length > 0) {
      let pool = luckyItems;
      if (luckyItems.length > 1 && lastLuckyTargetRef.current) {
        const filtered = luckyItems.filter((item) => item.targetId !== lastLuckyTargetRef.current);
        if (filtered.length > 0) pool = filtered;
      }

      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      lastLuckyTargetRef.current = randomItem.targetId;
      setLuckyPick(randomItem);
      setLuckyHighlight(randomItem.sectionId);
    } else {
      setLuckyPick(null);
      setLuckyHighlight(null);
    }

    window.setTimeout(() => setLuckyHighlight(null), 2000);
  }, [clearSearchTargetHighlight, luckyItems]);

  const handleSectionChange = useCallback((sectionId) => {
    if (sectionId === 'lucky') {
      handleFeelingLucky();
      return;
    }
    setActiveSection(sectionId);
  }, [handleFeelingLucky]);

  useEffect(() => {
    // If user already opened "Surprise" while data was still loading,
    // auto-pick a card as soon as lucky items are available.
    if (activeSection !== 'lucky') return;
    if (luckyPick) return;
    if (luckyItems.length === 0) return;
    handleFeelingLucky();
  }, [activeSection, luckyItems, luckyPick, handleFeelingLucky]);

  const handleGoHome = useCallback(() => {
    clearSearchTargetHighlight();
    setActiveSection(null);
    setPendingNavigation(null);
    setSearchFocused(false);
    setActiveResultIndex(-1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [clearSearchTargetHighlight]);

  if (isInitialLoading) {
    return <TetrisLoader fullScreen />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-off-white text-off-black font-shimshon animate-app-fade-in">

      {/* ===== NAVBAR - Dark for differentiation ===== */}
      <Header
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onHelpClick={() => setIsSuggestionModalOpen(true)}
        onHomeClick={handleGoHome}
      />

      {/* ===== MAIN ===== */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero + category cards: hidden when any section is active */}
        {!activeSection && (
          <>
            <section className="text-center mb-8 py-4 flex flex-col items-center">
              {/* Eye Logo Animation */}
              <div className="mb-6">
                <EyeLogo className="w-32 h-32 md:w-40 md:h-40" />
              </div>

              {/* Logo "אינדקס" from Figma */}
              <div className="flex justify-center mb-4">
                <img
                  src={logoHero}
                  alt="אינדקס"
                  className="h-16 md:h-24 w-auto"
                />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                <span className="text-tetris-purple">ארגז כלים למעצב</span>
              </h1>
              {/* <p className="text-base md:text-lg text-dark-gray max-w-xl mx-auto font-ibm text-balance leading-relaxed">
                כל מה שסטודנט לעיצוב צריך במקום אחד
              </p> */}
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
                  isEnglishText(searchQuery) ? "font-jersey" : "font-shimshon",
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
                          className={cn(
                            "px-3 py-1.5",
                            "font-shimshon text-sm",
                            suggestion.bgClass,
                            suggestionTextClass(suggestion.bgClass),
                            "border-2 border-off-black",
                            "shadow-brutalist-xs",
                            "transition-all duration-200",
                            "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                            "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
                            "cursor-pointer"
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
                              <span className="text-xs font-shimshon px-2 py-0.5 bg-off-white border border-off-black">
                                {result.sectionLabel}
                              </span>
                              <div className="flex-1">
                                <p className={cn("text-sm font-bold text-off-black", isEnglishText(result.titleHe || result.titleEn) ? "font-jersey" : "font-shimshon")}>
                                  {result.titleHe || result.titleEn}
                                </p>
                                {result.titleEn && result.titleEn !== result.titleHe && (
                                  <p className="text-xs text-mid-gray font-jersey mt-0.5">{result.titleEn}</p>
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
              <ToolboxSection pendingNavigation={pendingNavigation} />
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
              <HallOfFameSection pendingNavigation={pendingNavigation} />
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
              <MuseumSection pendingNavigation={pendingNavigation} />
            </Suspense>
          </div>
        )}

        {/* ===== LIBRARY SECTION ===== */}
        {activeSection === 'library' && (
          <div className="mt-12" id="section-library">
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
              <LibrarySection pendingNavigation={pendingNavigation} />
            </Suspense>
          </div>
        )}

        {/* ===== TIPS SECTION ===== */}
        {activeSection === 'tips' && (
          <div className="mt-12" id="section-tips">
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
              <TipsSection />
            </Suspense>
          </div>
        )}

        {/* ===== SURPRISE SECTION ===== */}
        {activeSection === 'lucky' && (
          <div className="mt-12" id="section-lucky">
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

            <section className="max-w-2xl mx-auto">
              <article
                className={cn(
                  "p-6 md:p-8",
                  "bg-off-white border-3 border-off-black",
                  "shadow-brutalist",
                  "transition-all duration-200",
                  luckyHighlight && "animate-line-clear"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="inline-flex px-3 py-1 bg-tetris-cyan border-2 border-off-black text-sm font-bold">
                    הפתעה
                  </span>
                  <button
                    type="button"
                    onClick={handleFeelingLucky}
                    className={cn(
                      "px-4 py-2",
                      "font-shimshon text-sm font-bold text-off-black",
                      "bg-tetris-cyan border-2 border-off-black shadow-brutalist-xs",
                      "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                      "transition-all duration-200"
                    )}
                  >
                    עוד הפתעה
                  </button>
                </div>

                {!luckyPick ? (
                  <div className="text-right">
                    <h3 className="text-2xl font-bold text-off-black mb-2">מכין לך כרטיס הפתעה...</h3>
                    <p className="text-dark-gray font-ibm">נסה שוב בעוד רגע, או לחץ על "עוד הפתעה".</p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-xs font-bold text-dark-gray mb-2">{luckyPick.sectionLabel}</p>
                    <h3 className={cn("text-3xl font-bold text-off-black mb-2", isEnglishText(luckyPick.titleHe || luckyPick.titleEn) ? "font-jersey" : "font-shimshon")}>
                      {luckyPick.titleHe || luckyPick.titleEn}
                    </h3>
                    {luckyPick.titleEn && luckyPick.titleEn !== luckyPick.titleHe && (
                      <p className="text-sm text-mid-gray font-jersey mb-3">{luckyPick.titleEn}</p>
                    )}
                    {luckyPick.description && (
                      <p className="text-base text-dark-gray font-ibm leading-relaxed mb-4">
                        {luckyPick.description}
                      </p>
                    )}
                    {luckyPick.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end">
                        {luckyPick.tags.slice(0, 5).map((tag) => (
                          <span
                            key={`${luckyPick.id}-${tag}`}
                            className={cn("px-2 py-1 bg-light-gray border border-off-black text-xs font-normal", isEnglishText(tag) ? "font-jersey" : "font-shimshon")}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-6 flex flex-wrap gap-2 justify-end">
                      {luckyPick.link && (
                        <a
                          href={luckyPick.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "px-4 py-2",
                            "font-shimshon text-sm font-bold text-off-black",
                            "bg-tetris-yellow border-2 border-off-black shadow-brutalist-xs",
                            "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                            "transition-all duration-200"
                          )}
                        >
                          מעבר לקישור
                        </a>
                      )}
                      {luckyPick.targetId && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSection(luckyPick.sectionId);
                            setPendingNavigation({
                              sectionId: luckyPick.sectionId,
                              targetId: luckyPick.targetId
                            });
                          }}
                          className={cn(
                            "px-4 py-2",
                            "font-shimshon text-sm font-bold text-off-black",
                            "bg-tetris-green border-2 border-off-black shadow-brutalist-xs",
                            "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                            "transition-all duration-200"
                          )}
                        >
                          פתיחה בכרטיס המלא
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </article>
            </section>
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
          <div className="mb-5 flex justify-center gap-3">
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
            {/* Support Button - Hidden for now
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2',
                'bg-tetris-purple text-off-white text-sm font-bold font-shimshon',
                'border-2 border-off-black',
                'shadow-brutalist-xs',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-200'
              )}
            >
              <Heart size={14} />
              <span>לתמיכה ביוצר</span>
            </button>
            */}
          </div>
          <p className="text-sm text-tetris-green font-ibm">
            נבנה על ידי יהונתן שפירא, 2026
          </p>
        </div>
      </footer>

      <MessageSuggestionModal
        open={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
      />
      <SupportModal
        open={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
      <WhatsNewModal
        open={isWhatsNewOpen}
        onClose={handleWhatsNewClose}
      />
    </div>
  );
};

export default App;
