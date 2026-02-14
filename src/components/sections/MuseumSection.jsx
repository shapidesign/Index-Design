import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import useData from '@/hooks/useData';
import MuseumCard from '@/components/cards/MuseumCard';
import TetrisLoader from '@/components/tetris/TetrisLoader';
import TetrisShape from '@/components/tetris/TetrisShape';
import { LayoutGrid, List, ChevronDown, X, Search } from 'lucide-react';

/**
 * MuseumSection - המוזיאון
 * Fetches museum locations from Notion and renders a card gallery/list
 * with country filter, searchable dropdown filters, and search bar.
 */

// ===== DECADE SLIDER COMPONENT =====
const DECADE_MIN = 1890;
const DECADE_MAX = 2020;
const DECADES = [];
for (let d = DECADE_MIN; d <= DECADE_MAX; d += 10) DECADES.push(d);

const DecadeSlider = ({ range, onChange }) => {
    const lastIdx = DECADES.length - 1;
    const startIdx = DECADES.indexOf(range[0]) === -1 ? 0 : DECADES.indexOf(range[0]);
    const endIdx = DECADES.indexOf(range[1]) === -1 ? lastIdx : DECADES.indexOf(range[1]);

    const highlightLeft = ((lastIdx - endIdx) / lastIdx) * 100;
    const highlightRight = ((lastIdx - (lastIdx - startIdx)) / lastIdx) * 100;

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-shimshon text-dark-gray text-right">
                תקופת פעילות
            </label>
            <div className="flex items-center gap-3" dir="ltr">
                <span className="text-xs font-pixelify text-dark-gray min-w-[32px] text-center">{range[1]}</span>
                <div className="flex-1 relative h-8 flex items-center">
                    <div className="absolute inset-x-0 h-2 bg-light-gray border-2 border-off-black rounded-none" />
                    <div
                        className="absolute h-2 bg-tetris-yellow border-y-2 border-off-black"
                        style={{
                            left: `${highlightLeft}%`,
                            right: `${highlightRight}%`,
                        }}
                    />
                    <input
                        type="range"
                        min={0}
                        max={lastIdx}
                        value={startIdx}
                        onChange={(e) => {
                            const newStart = Math.min(+e.target.value, endIdx);
                            onChange([DECADES[newStart], range[1]]);
                        }}
                        className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none z-10 cursor-pointer slider-thumb-interactive"
                        style={{ height: '32px', direction: 'rtl' }}
                    />
                    <input
                        type="range"
                        min={0}
                        max={lastIdx}
                        value={endIdx}
                        onChange={(e) => {
                            const newEnd = Math.max(+e.target.value, startIdx);
                            onChange([range[0], DECADES[newEnd]]);
                        }}
                        className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none z-20 cursor-pointer slider-thumb-interactive"
                        style={{ height: '32px', direction: 'rtl' }}
                    />
                </div>
                <span className="text-xs font-pixelify text-dark-gray min-w-[32px] text-center">{range[0]}</span>
            </div>
            <div className="flex justify-between px-1" dir="ltr">
                {DECADES.filter((_, i) => i % 3 === 0).reverse().map((d) => (
                    <span key={d} className="text-[9px] font-pixelify text-mid-gray">{d}</span>
                ))}
            </div>
        </div>
    );
};

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
                        className="shrink-0 p-0.5 hover:bg-tetris-pink/30 rounded-sm"
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

// ===== MUSEUM MODAL COMPONENT =====
const MuseumModal = ({ item, onClose }) => {
    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-off-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-2xl bg-off-white border-3 border-off-black shadow-brutalist animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                dir="rtl"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 bg-tetris-pink border-2 border-off-black hover:bg-tetris-orange transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Image Side */}
                    <div className="w-full md:w-1/3 h-64 md:h-auto min-h-[300px] bg-light-gray border-b-3 md:border-b-0 md:border-l-3 border-off-black relative overflow-hidden">
                        {item.imageUrl ? (
                            <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-tetris-blue/10">
                                <TetrisShape type="T" size={80} color="purple" className="opacity-50" />
                            </div>
                        )}
                        {item.country && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-off-white border-2 border-off-black shadow-sm">
                                <span className="text-sm font-bold font-shimshon">{item.country}</span>
                            </div>
                        )}
                    </div>

                    {/* Content Side */}
                    <div className="flex-1 p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold font-shimshon text-off-black mb-1">{item.nameHe}</h2>
                            {item.nameEn && (
                                <h3 className="text-xl font-pixelify text-mid-gray">{item.nameEn}</h3>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {item.type?.map((t) => (
                                <span key={t} className="px-3 py-1 text-xs font-bold font-shimshon bg-tetris-cyan/30 border border-off-black">
                                    {t}
                                </span>
                            ))}
                            {item.era?.map((e) => (
                                <span key={e} className="px-3 py-1 text-xs font-bold font-shimshon bg-tetris-purple text-off-white border border-off-black">
                                    {e}
                                </span>
                            ))}
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <h4 className="text-sm font-bold font-shimshon text-off-black mb-1">תיאור</h4>
                                <p className="text-sm text-dark-gray font-ibm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            {item.famousWork && (
                                <div>
                                    <h4 className="text-sm font-bold font-shimshon text-off-black mb-1">עבודות בולטות</h4>
                                    <p className="text-sm text-dark-gray font-ibm">
                                        {item.famousWork}
                                    </p>
                                </div>
                            )}

                            {item.quote && (
                                <div className="bg-tetris-yellow/20 p-4 border-l-4 border-tetris-yellow">
                                    <p className="text-sm font-bold font-shimshon text-off-black italic">
                                        "{item.quote}"
                                    </p>
                                </div>
                            )}
                            
                            {item.tags?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold font-shimshon text-off-black mb-2">תגיות</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.tags.map((tag) => (
                                            <span key={tag} className="text-xs text-mid-gray font-ibm bg-light-gray px-2 py-0.5 rounded border border-off-black/20">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {item.link && (
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'inline-flex items-center gap-2 px-6 py-3',
                                    'bg-off-black text-off-white',
                                    'font-bold font-shimshon',
                                    'hover:bg-tetris-purple transition-colors',
                                    'border-2 border-transparent hover:border-off-black'
                                )}
                            >
                                <span>לאתר</span>
                                <ExternalLink size={16} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== MAIN SECTION =====
const MuseumSection = () => {
    const { data, loading, error, refetch } = useData('/api/museum');
    const [viewMode, setViewMode] = useState('gallery');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [decadeRange, setDecadeRange] = useState([DECADE_MIN, DECADE_MAX]);
    const [selectedItem, setSelectedItem] = useState(null);
    const searchRef = useRef(null);

    const items = data?.results || [];

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

    /** All active filters */
    const hasActiveFilters = searchQuery.trim() ||
        selectedCountries.length > 0 ||
        selectedTypes.length > 0 ||
        selectedTags.length > 0 ||
        decadeRange[0] !== DECADE_MIN ||
        decadeRange[1] !== DECADE_MAX;

    /** Clear all filters */
    const clearAll = useCallback(() => {
        setSearchQuery('');
        setSelectedCountries([]);
        setSelectedTypes([]);
        setSelectedTags([]);
        setDecadeRange([DECADE_MIN, DECADE_MAX]);
    }, []);

    /** Filtered items */
    const filteredItems = useMemo(() => {
        return items.filter((d) => {
            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const match =
                    d.name?.toLowerCase().includes(q) ||
                    d.nameHe?.toLowerCase().includes(q) ||
                    d.nameEn?.toLowerCase().includes(q) ||
                    d.description?.toLowerCase().includes(q) ||
                    d.country?.toLowerCase().includes(q) ||
                    d.type?.some((t) => t.toLowerCase().includes(q)) ||
                    d.tags?.some((t) => t.toLowerCase().includes(q));
                if (!match) return false;
            }

            // Country filter
            if (selectedCountries.length > 0) {
                if (!selectedCountries.includes(d.country)) return false;
            }

            // Type filter
            if (selectedTypes.length > 0) {
                if (!d.type?.some((t) => selectedTypes.includes(t))) return false;
            }

            // Tag filter
            if (selectedTags.length > 0) {
                if (!d.tags?.some((t) => selectedTags.includes(t))) return false;
            }

            // Decade range filter
            if (decadeRange[0] !== DECADE_MIN || decadeRange[1] !== DECADE_MAX) {
                // If item has no era data, decide whether to show or hide. 
                // Usually hide if filtering is active.
                if (!d.decadeStart && !d.decadeEnd) return false;
                
                const dStart = d.decadeStart ?? DECADE_MIN;
                const dEnd = d.decadeEnd ?? DECADE_MAX;
                
                // Check for overlap
                if (dEnd < decadeRange[0] || dStart > decadeRange[1]) return false;
            }

            return true;
        });
    }, [items, searchQuery, selectedCountries, selectedTypes, selectedTags, decadeRange]);

    // ===== LOADING STATE =====
    if (loading) {
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
                            placeholder="חיפוש מוזיאונים, מדינות, סוגים..."
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
                            <p className="text-[10px] font-shimshon text-dark-gray mb-2 text-right">חיפוש מהיר</p>
                            <div className="flex flex-wrap gap-1.5 justify-end">
                                {quickSearches.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => { setSearchQuery(q); setSearchFocused(false); }}
                                        className={cn(
                                            'px-2.5 py-1',
                                            'font-shimshon text-xs text-off-black',
                                            'bg-light-gray border border-off-black',
                                            'shadow-[1px_1px_0px_#1F1F1F]',
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

                    {/* Decade slider */}
                    <DecadeSlider range={decadeRange} onChange={setDecadeRange} />
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
