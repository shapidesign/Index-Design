import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import useData from '@/hooks/useData';
import HallOfFameCard from '@/components/cards/HallOfFameCard';
import TetrisLoader from '@/components/tetris/TetrisLoader';
import TetrisShape from '@/components/tetris/TetrisShape';
import { LayoutGrid, List, ChevronDown, X, Search } from 'lucide-react';

/**
 * HallOfFameSection - היכל התהילה
 * Fetches famous designers from Notion and renders a card gallery/list
 * with decade slider, searchable dropdown filters, and search bar.
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

    // For RTL: slider value 0 = rightmost (oldest), value max = leftmost (newest)
    // The native range + direction:rtl handles the visual flip.
    // Active highlight: left% = distance from left edge (newer side in RTL)
    const highlightLeft = ((lastIdx - endIdx) / lastIdx) * 100;
    const highlightRight = ((lastIdx - (lastIdx - startIdx)) / lastIdx) * 100;

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-shimshon text-dark-gray text-right">
                תקופת פעילות
            </label>
            <div className="flex items-center gap-3" dir="ltr">
                {/* Left label = newer year */}
                <span className="text-xs font-pixelify text-dark-gray min-w-[32px] text-center">{range[1]}</span>
                <div className="flex-1 relative h-8 flex items-center">
                    {/* Track background */}
                    <div className="absolute inset-x-0 h-2 bg-light-gray border-2 border-off-black rounded-none" />
                    {/* Active range highlight */}
                    <div
                        className="absolute h-2 bg-tetris-yellow border-y-2 border-off-black"
                        style={{
                            left: `${highlightLeft}%`,
                            right: `${highlightRight}%`,
                        }}
                    />
                    {/* Start (older decade) thumb — pointer-events only on thumb */}
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
                    {/* End (newer decade) thumb — pointer-events only on thumb */}
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
                {/* Right label = older year */}
                <span className="text-xs font-pixelify text-dark-gray min-w-[32px] text-center">{range[0]}</span>
            </div>
            {/* Decade markers — reversed for RTL (newest left, oldest right) */}
            <div className="flex justify-between px-1" dir="ltr">
                {DECADES.filter((_, i) => i % 3 === 0).reverse().map((d) => (
                    <span key={d} className="text-xs font-pixelify text-mid-gray">{d}</span>
                ))}
            </div>
        </div>
    );
};

// ===== SEARCHABLE DROPDOWN COMPONENT =====
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
    'טיפוגרפיה',
    'מודרניזם',
    'פוסט-מודרניזם',
    'סוריאליזם',
    'פופ-ארט',
    'ישראלי',
    'Swiss Design',
];

// ===== MAIN SECTION =====
const HallOfFameSection = () => {
    const { data, loading, error, refetch } = useData('/api/hall-of-fame');
    const [viewMode, setViewMode] = useState('gallery');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [decadeRange, setDecadeRange] = useState([DECADE_MIN, DECADE_MAX]);
    const [selectedStyles, setSelectedStyles] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const searchRef = useRef(null);

    const designers = data?.results || [];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /** All unique styles from data */
    const allStyles = useMemo(() => {
        const set = new Set();
        designers.forEach((d) => d.styles?.forEach((s) => set.add(s)));
        return Array.from(set).sort();
    }, [designers]);

    /** All unique fields from data */
    const allFields = useMemo(() => {
        const set = new Set();
        designers.forEach((d) => d.fields?.forEach((f) => set.add(f)));
        return Array.from(set).sort();
    }, [designers]);

    /** Toggle style filter */
    const toggleStyle = useCallback((val) => {
        setSelectedStyles((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    }, []);

    /** Toggle field filter */
    const toggleField = useCallback((val) => {
        setSelectedFields((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    }, []);

    /** All active filters */
    const hasActiveFilters = searchQuery.trim() ||
        selectedStyles.length > 0 ||
        selectedFields.length > 0 ||
        decadeRange[0] !== DECADE_MIN ||
        decadeRange[1] !== DECADE_MAX;

    /** Clear all filters */
    const clearAll = useCallback(() => {
        setSearchQuery('');
        setSelectedStyles([]);
        setSelectedFields([]);
        setDecadeRange([DECADE_MIN, DECADE_MAX]);
    }, []);

    /** Filtered designers */
    const filteredDesigners = useMemo(() => {
        return designers.filter((d) => {
            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const match =
                    d.nameHe?.toLowerCase().includes(q) ||
                    d.nameEn?.toLowerCase().includes(q) ||
                    d.name?.toLowerCase().includes(q) ||
                    d.description?.toLowerCase().includes(q) ||
                    d.styles?.some((s) => s.toLowerCase().includes(q)) ||
                    d.fields?.some((f) => f.toLowerCase().includes(q));
                if (!match) return false;
            }

            // Decade range filter
            if (decadeRange[0] !== DECADE_MIN || decadeRange[1] !== DECADE_MAX) {
                if (d.decadeStart === null && d.decadeEnd === null) return false;
                // Designer's range must overlap with selected range
                const dStart = d.decadeStart ?? DECADE_MIN;
                const dEnd = d.decadeEnd ?? DECADE_MAX;
                if (dEnd < decadeRange[0] || dStart > decadeRange[1]) return false;
            }

            // Style filter
            if (selectedStyles.length > 0) {
                if (!d.styles?.some((s) => selectedStyles.includes(s))) return false;
            }

            // Field filter
            if (selectedFields.length > 0) {
                if (!d.fields?.some((f) => selectedFields.includes(f))) return false;
            }

            return true;
        });
    }, [designers, searchQuery, decadeRange, selectedStyles, selectedFields]);

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
            {/* ===== SECTION HEADER + VIEW TOGGLE ===== */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-off-black font-shimshon">
                        היכל התהילה
                    </h2>
                    <span className="font-shimshon text-sm text-dark-gray">
                        {filteredDesigners.length} מעצבים
                        {hasActiveFilters && ` (מסוננים מתוך ${designers.length})`}
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
                            placeholder="חיפוש מעצבים, סגנונות, תחומים..."
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

                {/* Filter row: dropdowns + decade slider */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Style dropdown */}
                    <SearchableDropdown
                        label="סגנון"
                        options={allStyles}
                        selected={selectedStyles}
                        onToggle={toggleStyle}
                        onClear={() => setSelectedStyles([])}
                    />

                    {/* Field/tag dropdown */}
                    <SearchableDropdown
                        label="תחום"
                        options={allFields}
                        selected={selectedFields}
                        onToggle={toggleField}
                        onClear={() => setSelectedFields([])}
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
            {filteredDesigners.length > 0 ? (
                viewMode === 'gallery' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDesigners.map((designer) => (
                            <HallOfFameCard
                                key={designer.id}
                                itemId={designer.id}
                                viewMode="gallery"
                                nameHe={designer.nameHe}
                                nameEn={designer.nameEn}
                                description={designer.description}
                                fields={designer.fields}
                                styles={designer.styles}
                                era={designer.era}
                                link={designer.link}
                                imageUrl={designer.imageUrl}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredDesigners.map((designer) => (
                            <HallOfFameCard
                                key={designer.id}
                                itemId={designer.id}
                                viewMode="list"
                                nameHe={designer.nameHe}
                                nameEn={designer.nameEn}
                                description={designer.description}
                                fields={designer.fields}
                                styles={designer.styles}
                                era={designer.era}
                                link={designer.link}
                                imageUrl={designer.imageUrl}
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

export default HallOfFameSection;
