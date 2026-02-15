import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import useData from '@/hooks/useData';
import MuseumCard from '@/components/cards/MuseumCard';
import TetrisLoader from '@/components/tetris/TetrisLoader';
import TetrisShape from '@/components/tetris/TetrisShape';
import { LayoutGrid, List, ChevronDown, X, Search, ExternalLink } from 'lucide-react';
import { getFlagPath, getRandomThumbnail } from '@/lib/museum';

/** URL-based screenshot thumbnail fallback */
const getLinkThumbnail = (url) => {
    if (!url) return null;
    try {
        return `https://image.thum.io/get/width/600/${url}`;
    } catch {
        return null;
    }
};

/**
 * MuseumSection - המוזיאון
 * Fetches museum locations from Notion and renders a card gallery/list
 * with country filter, searchable dropdown filters, and search bar.
 */

// ===== SEARCHABLE DROPDOWN COMPONENT (Reused) =====
const SearchableDropdown = ({ label, options, selected, onToggle, onClear }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex items-center gap-2 w-full',
                    'px-3 py-2',
                    'bg-off-white',
                    'border-2 border-off-black',
                    'shadow-brutalist-xs',
                    'font-shimshon text-sm text-right',
                    'transition-all duration-200',
                    'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                    open && 'shadow-none translate-x-[2px] translate-y-[2px]',
                    selected.length > 0 && 'border-tetris-purple'
                )}
            >
                <ChevronDown size={14} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
                <span className="flex-1 truncate">
                    {selected.length > 0 ? `${label} (${selected.length})` : label}
                </span>
                {selected.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="shrink-0 p-0.5 hover:bg-tetris-pink/30"
                    >
                        <X size={12} />
                    </button>
                )}
            </button>

            {open && (
                <div
                    className={cn(
                        'absolute top-full left-0 right-0 z-40',
                        'mt-1',
                        'bg-off-white',
                        'border-2 border-off-black',
                        'shadow-brutalist',
                        'max-h-64 flex flex-col',
                        'animate-tetris-stack'
                    )}
                >
                    {/* Search input */}
                    <div className="p-2 border-b-2 border-off-black/20">
                        <div className="flex items-center gap-2 px-2 py-1 bg-light-gray border border-off-black/30">
                            <Search size={12} className="text-mid-gray shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="חיפוש..."
                                className="w-full bg-transparent text-xs font-shimshon outline-none text-right"
                                dir="rtl"
                                autoFocus
                            />
                        </div>
                    </div>
                    {/* Options */}
                    <div className="overflow-y-auto flex-1 p-1">
                        {filtered.length === 0 ? (
                            <p className="text-xs text-mid-gray text-center py-3 font-ibm">לא נמצאו תוצאות</p>
                        ) : (
                            filtered.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => onToggle(opt)}
                                    className={cn(
                                        'w-full text-right px-3 py-1.5',
                                        'text-xs font-shimshon',
                                        'hover:bg-light-gray',
                                        'transition-colors',
                                        selected.includes(opt) && 'bg-tetris-yellow/30 font-bold'
                                    )}
                                >
                                    <span className="flex items-center gap-2 justify-end">
                                        {opt}
                                        {selected.includes(opt) && <span className="text-tetris-purple">✓</span>}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ===== QUICK SEARCH SUGGESTIONS =====
const quickSearches = [
    'מוזיאון',
    'גלריה',
    'עיצוב',
    'אמנות',
    'ישראל',
    'לונדון',
    'ניו יורק',
];

const tagColors = [
    'bg-tetris-purple',
    'bg-tetris-orange',
    'bg-tetris-green',
    'bg-tetris-pink',
    'bg-tetris-yellow',
    'bg-tetris-blue',
    'bg-tetris-cyan',
];

const getTagTextClass = (bgColor) => (bgColor === 'bg-tetris-purple' ? 'text-off-white' : 'text-off-black');

// ===== MUSEUM MODAL COMPONENT =====
const MuseumModal = ({ item, onClose }) => {
    // All hooks must be called before any conditional return
    const flagPath = item ? getFlagPath(item.country) : null;
    const thumbnail = useMemo(
        () => getRandomThumbnail(item?.id || item?.nameHe || 'modal'),
        [item?.id, item?.nameHe]
    );

    // Escape key handler
    useEffect(() => {
        if (!item) return;
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [item, onClose]);

    // Body scroll lock
    useEffect(() => {
        if (!item) return;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [item]);

    if (!item) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-off-black/80 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={item.nameHe ? `מידע על ${item.nameHe}` : 'פרטי יצירה'}
        >
            <div
                className={cn(
                    'relative w-full max-w-5xl',
                    'bg-off-white',
                    'border-3 border-off-black',
                    'shadow-brutalist',
                    'max-h-[90vh] overflow-y-auto'
                )}
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={cn(
                        'absolute top-3 left-3 p-2.5',
                        'bg-tetris-pink border-2 border-off-black',
                        'shadow-brutalist-xs',
                        'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                        'hover:bg-tetris-orange transition-all duration-200',
                        'z-10 cursor-pointer'
                    )}
                    aria-label="סגור"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Image Side */}
                    <div className="w-full md:w-2/5 h-56 md:h-auto md:min-h-[420px] bg-light-gray border-b-3 md:border-b-0 md:border-s-3 border-off-black relative overflow-hidden">
                        {(item.imageUrl || getLinkThumbnail(item.link)) ? (
                            <img
                                src={item.imageUrl || getLinkThumbnail(item.link)}
                                alt={item.name}
                                className="w-full h-full object-cover opacity-70"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-tetris-blue/10">
                                <TetrisShape type={thumbnail.type} size={48} color={thumbnail.color} className="opacity-60" />
                            </div>
                        )}
                        {item.country && (
                            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-off-white border-2 border-off-black shadow-brutalist-xs">
                                {flagPath && <img src={flagPath} alt={item.country} className="w-4 h-auto" />}
                                <span className="text-sm font-bold font-shimshon">{item.country}</span>
                            </div>
                        )}
                    </div>

                    {/* Content Side */}
                    <div className="flex-1 p-6 md:p-8">
                        {/* Name */}
                        <div className="mb-5">
                            <h2 className="text-2xl md:text-3xl font-bold font-shimshon text-off-black mb-1">
                                {item.nameHe || item.name}
                            </h2>
                            {item.nameEn && (
                                <h3 className="text-lg font-pixelify text-mid-gray">{item.nameEn}</h3>
                            )}
                        </div>

                        {/* Type + Era Tags */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {item.type?.map((t) => (
                                <span key={t} className="px-3 py-1 text-xs font-normal font-shimshon bg-tetris-cyan/30 border border-off-black">
                                    {t}
                                </span>
                            ))}
                            {item.era?.map((e) => (
                                <span key={e} className="px-3 py-1 text-xs font-normal font-shimshon bg-tetris-purple text-off-white border border-off-black">
                                    {e}
                                </span>
                            ))}
                        </div>

                        {/* Details */}
                        <div className="space-y-4 mb-6">
                            {item.description && (
                                <div>
                                    <h4 className="text-sm font-bold font-shimshon text-off-black mb-1">תיאור</h4>
                                    <p className="text-sm text-dark-gray font-ibm leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            {item.famousWork && (
                                <div>
                                    <h4 className="text-sm font-bold font-shimshon text-off-black mb-1">עבודות בולטות</h4>
                                    <p className="text-sm text-dark-gray font-ibm">
                                        {item.famousWork}
                                    </p>
                                </div>
                            )}

                            {item.tags?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold font-shimshon text-off-black mb-2">תגיות</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {item.tags.map((tag, i) => (
                                            <span
                                                key={tag}
                                                className={cn(
                                                    'px-2.5 py-1',
                                                    'text-xs font-normal font-shimshon',
                                                    'border border-off-black',
                                                    tagColors[i % tagColors.length],
                                                    getTagTextClass(tagColors[i % tagColors.length]),
                                                    'shadow-brutalist-xs'
                                                )}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Website Link */}
                        {item.link && (
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'inline-flex items-center gap-2 px-5 py-2.5',
                                    'bg-off-black text-off-white',
                                    'font-bold font-shimshon text-sm',
                                    'border-2 border-off-black',
                                    'hover:bg-tetris-purple transition-colors'
                                )}
                            >
                                <span>לאתר</span>
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ===== MAIN SECTION =====
const MuseumSection = () => {
    const { data, loading, error, refetch } = useData('/api/museum');
    const [bootLoading, setBootLoading] = useState(true);
    const [viewMode, setViewMode] = useState('gallery');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedEras, setSelectedEras] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const searchRef = useRef(null);

    const items = data?.results || [];

    // Keep a short, guaranteed loader window to avoid flashing partially rendered cards.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setBootLoading(false);
        }, 450);

        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /** All unique countries from data */
    const allCountries = useMemo(() => {
        const set = new Set();
        items.forEach((d) => { if (d.country) set.add(d.country) });
        return Array.from(set).sort();
    }, [items]);

    /** All unique types from data */
    const allTypes = useMemo(() => {
        const set = new Set();
        items.forEach((d) => d.type?.forEach((t) => set.add(t)));
        return Array.from(set).sort();
    }, [items]);

    /** All unique tags from data */
    const allTags = useMemo(() => {
        const set = new Set();
        items.forEach((d) => d.tags?.forEach((t) => set.add(t)));
        return Array.from(set).sort();
    }, [items]);

    /** All unique eras from data */
    const allEras = useMemo(() => {
        const set = new Set();
        items.forEach((d) => d.era?.forEach((e) => set.add(e)));
        return Array.from(set).sort();
    }, [items]);

    /** Toggle country filter */
    const toggleCountry = useCallback((val) => {
        setSelectedCountries((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    }, []);

    /** Toggle type filter */
    const toggleType = useCallback((val) => {
        setSelectedTypes((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    }, []);

    /** Toggle tag filter */
    const toggleTag = useCallback((val) => {
        setSelectedTags((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    }, []);

    /** Toggle era filter */
    const toggleEra = useCallback((val) => {
        setSelectedEras((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    }, []);

    /** All active filters */
    const hasActiveFilters = searchQuery.trim() ||
        selectedCountries.length > 0 ||
        selectedTypes.length > 0 ||
        selectedTags.length > 0 ||
        selectedEras.length > 0;

    /** Clear all filters */
    const clearAll = useCallback(() => {
        setSearchQuery('');
        setSelectedCountries([]);
        setSelectedTypes([]);
        setSelectedTags([]);
        setSelectedEras([]);
    }, []);

    /** Filtered items */
    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const hasQuery = Boolean(q);

        const scored = items
            .map((d) => {
                let score = 0;

                if (hasQuery) {
                    const tags = d.tags || [];
                    const exactTag = tags.some((tag) => tag?.toLowerCase() === q);
                    const partialTag = tags.some((tag) => tag?.toLowerCase().includes(q));

                    if (exactTag) score += 7;
                    else if (partialTag) score += 5;

                    if (d.description?.toLowerCase().includes(q)) score += 4;
                    if (d.famousWork?.toLowerCase().includes(q)) score += 3;
                    if (d.nameHe?.toLowerCase().includes(q)) score += 2;
                    if (d.nameEn?.toLowerCase().includes(q)) score += 2;
                    if (d.name?.toLowerCase().includes(q)) score += 2;

                    if (d.type?.some((t) => t.toLowerCase().includes(q))) score += 1.5;
                    if (d.era?.some((e) => e.toLowerCase().includes(q))) score += 1.5;
                    if (d.country?.toLowerCase().includes(q)) score += 1;
                }

                return { d, score };
            })
            .filter(({ d, score }) => {
                if (hasQuery && score <= 0) return false;

                if (selectedCountries.length > 0 && !selectedCountries.includes(d.country)) return false;
                if (selectedTypes.length > 0 && !d.type?.some((t) => selectedTypes.includes(t))) return false;
                if (selectedTags.length > 0 && !d.tags?.some((t) => selectedTags.includes(t))) return false;
                if (selectedEras.length > 0 && !d.era?.some((e) => selectedEras.includes(e))) return false;

                return true;
            });

        if (hasQuery) {
            scored.sort((a, b) => b.score - a.score);
        }

        return scored.map(({ d }) => d);
    }, [items, searchQuery, selectedCountries, selectedTypes, selectedTags, selectedEras]);

    // ===== LOADING STATE =====
    const isDataReady = Array.isArray(data?.results);
    if (loading || bootLoading || (!error && !isDataReady)) {
        return <TetrisLoader className="min-h-[400px]" />;
    }

    // ===== ERROR STATE =====
    if (error) {
        return (
            <div
                dir="rtl"
                className={cn(
                    'min-h-[400px] flex flex-col items-center justify-center',
                    'p-8 text-center'
                )}
            >
                <TetrisShape type="Z" color="yellow" size={40} className="mb-6" />
                <h2 className="text-2xl font-bold text-off-black mb-4 font-shimshon">
                    אופס! משהו השתבש
                </h2>
                <p className="text-dark-gray font-ibm mb-6">{error}</p>
                <button
                    onClick={refetch}
                    className={cn(
                        'px-6 py-3',
                        'bg-tetris-green',
                        'font-shimshon font-bold',
                        'border-3 border-off-black',
                        'shadow-brutalist',
                        'hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]',
                        'transition-all duration-200'
                    )}
                >
                    נסה שוב
                </button>
            </div>
        );
    }

    return (
        <section dir="rtl" className="animate-tetris-stack">
            {/* ===== MODAL ===== */}
            {selectedItem && (
                <MuseumModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}

            {/* ===== SECTION HEADER + VIEW TOGGLE ===== */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-off-black font-shimshon">
                        המוזיאון
                    </h2>
                    <span className="font-shimshon text-sm text-dark-gray">
                        {filteredItems.length} מקומות
                        {hasActiveFilters && ` (מסוננים מתוך ${items.length})`}
                    </span>
                </div>

                {/* View toggle */}
                <div className="flex border-2 border-off-black">
                    <button
                        onClick={() => setViewMode('gallery')}
                        className={cn(
                            'p-2 transition-colors',
                            viewMode === 'gallery' ? 'bg-tetris-purple text-off-white' : 'bg-off-white text-off-black hover:bg-light-gray'
                        )}
                        aria-label="תצוגת גלריה"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
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

            {/* ===== FILTER BAR ===== */}
            <div className={cn(
                'p-4 mb-8',
                'bg-off-white',
                'border-3 border-off-black',
                'shadow-brutalist-sm'
            )}>
                {/* Search bar */}
                <div className="relative mb-4" ref={searchRef}>
                    <div className={cn(
                        'flex items-center gap-2',
                        'px-3 py-2',
                        'bg-light-gray',
                        'border-2 border-off-black',
                        'transition-all',
                        searchFocused && 'border-tetris-purple'
                    )}>
                        <Search size={14} className="text-tetris-purple shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            placeholder="חיפוש לפי תגיות, תיאור, שם, מדינה או סוג..."
                            className="w-full bg-transparent text-sm font-shimshon outline-none text-right"
                            dir="rtl"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="shrink-0">
                                <X size={14} className="text-dark-gray hover:text-off-black" />
                            </button>
                        )}
                    </div>
                    {/* Quick search suggestions */}
                    {searchFocused && !searchQuery && (
                        <div className={cn(
                            'absolute top-full left-0 right-0 z-30',
                            'mt-1 p-3',
                            'bg-off-white border-2 border-off-black shadow-brutalist',
                            'animate-tetris-stack'
                        )}>
                            <p className="text-xs font-shimshon text-dark-gray mb-2 text-right">חיפוש מהיר</p>
                            <div className="flex flex-wrap gap-1.5 justify-end">
                                {quickSearches.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => { setSearchQuery(q); setSearchFocused(false); }}
                                        className={cn(
                                            'px-2.5 py-1',
                                            'font-shimshon text-xs text-off-black',
                                            'bg-light-gray border border-off-black',
                                            'shadow-brutalist-xs',
                                            'hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]',
                                            'transition-all duration-150 cursor-pointer'
                                        )}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter row: dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Country dropdown */}
                    <SearchableDropdown
                        label="מדינה/אזור"
                        options={allCountries}
                        selected={selectedCountries}
                        onToggle={toggleCountry}
                        onClear={() => setSelectedCountries([])}
                    />

                    {/* Type dropdown */}
                    <SearchableDropdown
                        label="סוג"
                        options={allTypes}
                        selected={selectedTypes}
                        onToggle={toggleType}
                        onClear={() => setSelectedTypes([])}
                    />

                    {/* Tags dropdown */}
                    <SearchableDropdown
                        label="תגיות"
                        options={allTags}
                        selected={selectedTags}
                        onToggle={toggleTag}
                        onClear={() => setSelectedTags([])}
                    />

                    {/* Era dropdown */}
                    <SearchableDropdown
                        label="תקופה"
                        options={allEras}
                        selected={selectedEras}
                        onToggle={toggleEra}
                        onClear={() => setSelectedEras([])}
                    />
                </div>

                {/* Clear all filters */}
                {hasActiveFilters && (
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={clearAll}
                            className={cn(
                                'px-3 py-1.5',
                                'font-shimshon text-xs font-bold text-off-black',
                                'bg-tetris-pink border-2 border-off-black',
                                'shadow-brutalist-xs',
                                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                                'transition-all duration-200 cursor-pointer'
                            )}
                        >
                            נקה הכל ✕
                        </button>
                    </div>
                )}
            </div>

            {/* ===== CONTENT ===== */}
            {filteredItems.length > 0 ? (
                viewMode === 'gallery' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <MuseumCard
                                key={item.id}
                                id={item.id}
                                viewMode="gallery"
                                nameHe={item.nameHe}
                                nameEn={item.nameEn}
                                description={item.description}
                                country={item.country}
                                type={item.type}
                                tags={item.tags}
                                link={item.link}
                                imageUrl={item.imageUrl}
                                onClick={() => setSelectedItem(item)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredItems.map((item) => (
                            <MuseumCard
                                key={item.id}
                                id={item.id}
                                viewMode="list"
                                nameHe={item.nameHe}
                                nameEn={item.nameEn}
                                description={item.description}
                                country={item.country}
                                type={item.type}
                                tags={item.tags}
                                link={item.link}
                                imageUrl={item.imageUrl}
                                onClick={() => setSelectedItem(item)}
                            />
                        ))}
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <TetrisShape type="Z" color="yellow" size={32} className="mb-4 opacity-40" />
                    <p className="text-lg font-bold text-dark-gray font-shimshon mb-2">
                        לא נמצאו תוצאות
                    </p>
                    <p className="text-sm text-mid-gray font-ibm mb-4">
                        נסו לשנות את הסינון או לחפש משהו אחר
                    </p>
                    <button
                        onClick={clearAll}
                        className={cn(
                            'px-4 py-2',
                            'bg-tetris-pink',
                            'font-shimshon text-sm font-bold',
                            'border-2 border-off-black',
                            'shadow-brutalist-xs',
                            'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                            'transition-all duration-200'
                        )}
                    >
                        נקה סינון
                    </button>
                </div>
            )}
        </section>
    );
};

export default MuseumSection;
