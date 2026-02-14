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

// ===== MAIN SECTION =====
const MuseumSection = () => {
    const { data, loading, error, refetch } = useData('/api/museum');
    const [viewMode, setViewMode] = useState('gallery');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
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

    /** All active filters */
    const hasActiveFilters = searchQuery.trim() ||
        selectedCountries.length > 0 ||
        selectedTypes.length > 0;

    /** Clear all filters */
    const clearAll = useCallback(() => {
        setSearchQuery('');
        setSelectedCountries([]);
        setSelectedTypes([]);
    }, []);

    /** Filtered items */
    const filteredItems = useMemo(() => {
        return items.filter((d) => {
            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const match =
                    d.name?.toLowerCase().includes(q) ||
                    d.description?.toLowerCase().includes(q) ||
                    d.country?.toLowerCase().includes(q) ||
                    d.type?.some((t) => t.toLowerCase().includes(q));
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

            return true;
        });
    }, [items, searchQuery, selectedCountries, selectedTypes]);

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                viewMode="gallery"
                                name={item.name}
                                description={item.description}
                                country={item.country}
                                type={item.type}
                                link={item.link}
                                imageUrl={item.imageUrl}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredItems.map((item) => (
                            <MuseumCard
                                key={item.id}
                                viewMode="list"
                                name={item.name}
                                description={item.description}
                                country={item.country}
                                type={item.type}
                                link={item.link}
                                imageUrl={item.imageUrl}
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
