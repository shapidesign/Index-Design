import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import useData from '@/hooks/useData';
import BookCard from '@/components/cards/BookCard';
import TetrisLoader from '@/components/tetris/TetrisLoader';
import TetrisShape from '@/components/tetris/TetrisShape';
import { LayoutGrid, List, Search, X, ChevronDown } from 'lucide-react';

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const makeBookTargetId = (bookId) =>
  `search-item-library-${String(bookId || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

const parseYearsFromText = (value) => {
  const matches = String(value || '').match(/\b(18|19|20)\d{2}\b/g) || [];
  const years = matches
    .map((entry) => Number(entry))
    .filter((year) => Number.isFinite(year) && year >= 1800 && year <= 2099);
  return Array.from(new Set(years)).sort((a, b) => a - b);
};

const isSymbolHeavyText = (value) => /[0-9()[\]{}\-_/\\:;,.+&%#@!?*]/.test(String(value || ''));

const getSymbolicFontClass = (value) => (isSymbolHeavyText(value) ? 'font-pixelify' : 'font-shimshon');

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

const YearRangeSlider = ({ bounds, range, onChange }) => {
  const [minBound, maxBound] = bounds;
  const [rangeMin, rangeMax] = range;
  const total = Math.max(1, maxBound - minBound);
  const leftPercent = ((rangeMin - minBound) / total) * 100;
  const rightPercent = 100 - ((rangeMax - minBound) / total) * 100;

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs text-dark-gray text-right font-shimshon">טווח שנים</label>

      <div className="flex items-center gap-2" dir="ltr">
        <span className="text-xs text-dark-gray min-w-[42px] text-left font-pixelify">{minBound}</span>
        <div className="relative flex-1 h-8 flex items-center">
          <div className="absolute inset-x-0 h-2 bg-light-gray border-2 border-off-black" />
          <div
            className="absolute h-2 bg-tetris-cyan border-y-2 border-off-black"
            style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
          />

          <input
            type="range"
            min={minBound}
            max={maxBound}
            value={rangeMin}
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), rangeMax);
              onChange([next, rangeMax]);
            }}
            className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none z-10 slider-thumb-interactive"
            style={{ height: '32px' }}
          />

          <input
            type="range"
            min={minBound}
            max={maxBound}
            value={rangeMax}
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), rangeMin);
              onChange([rangeMin, next]);
            }}
            className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none z-20 slider-thumb-interactive"
            style={{ height: '32px' }}
          />
        </div>
        <span className="text-xs text-dark-gray min-w-[42px] text-right font-pixelify">{maxBound}</span>
      </div>
    </div>
  );
};

const TagFilterDropdown = ({ options, selected, onToggle, onClear }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleOptions = options.filter((tag) =>
    normalizeText(tag).includes(normalizeText(search))
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'w-full md:w-auto min-w-[220px]',
          'inline-flex items-center justify-between gap-2',
          'px-3 py-2 bg-off-white border-2 border-off-black shadow-brutalist-xs',
          'text-sm font-shimshon',
          'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
          'transition-all duration-200',
          selected.length > 0 && 'bg-tetris-cyan/20'
        )}
      >
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
        <span className="text-right flex-1">
          {selected.length > 0 ? `תגיות (${selected.length})` : 'סינון לפי תגיות'}
        </span>
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full mt-1 z-40',
            'w-full md:w-[300px]',
            'bg-off-white border-2 border-off-black shadow-brutalist',
            'p-2'
          )}
        >
          <div className="flex items-center gap-2 px-2 py-1.5 border border-off-black bg-light-gray mb-2">
            <Search size={12} className="text-mid-gray" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש תגית..."
              className={cn('w-full bg-transparent text-xs outline-none text-right', getSymbolicFontClass(search))}
              dir="rtl"
            />
          </div>

          <div className="max-h-52 overflow-y-auto flex flex-col gap-1">
            {visibleOptions.length === 0 ? (
              <p className="text-xs text-dark-gray font-ibm text-center py-2">לא נמצאו תגיות</p>
            ) : (
              visibleOptions.map((tag, i) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggle(tag)}
                  className={cn(
                    'w-full text-right px-2 py-1.5',
                    'transition-all duration-150',
                    'hover:translate-x-[1px] hover:translate-y-[1px]',
                    getSymbolicFontClass(tag),
                    selected.includes(tag) ? 'bg-light-gray border border-off-black' : 'bg-transparent border border-transparent'
                  )}
                >
                  <span className="inline-flex items-center gap-2 justify-end w-full">
                    {selected.includes(tag) && <span className="text-xs font-shimshon">✓</span>}
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 text-xs font-normal font-shimshon',
                        'border border-off-black shadow-brutalist-xs',
                        tagColors[i % tagColors.length],
                        getTagTextClass(tagColors[i % tagColors.length])
                      )}
                    >
                      {tag}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          {selected.length > 0 && (
            <div className="pt-2 mt-2 border-t border-off-black/20 flex justify-end">
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-shimshon px-2 py-1 border border-off-black bg-light-gray hover:bg-tetris-pink/30 transition-colors"
              >
                ניקוי תגיות
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LibrarySection = () => {
  const { data, loading, error, refetch } = useData('/api/books');
  const [viewMode, setViewMode] = useState('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [yearRange, setYearRange] = useState([0, 0]);

  const books = useMemo(() => data?.results || [], [data]);

  const allTags = useMemo(() => {
    const set = new Set();
    books.forEach((book) => {
      (book.tags || []).forEach((tag) => {
        const normalizedTag = String(tag || '').trim();
        if (normalizedTag) set.add(normalizedTag);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'he'));
  }, [books]);

  const yearBounds = useMemo(() => {
    const allYears = books.flatMap((book) => parseYearsFromText(book.year));
    if (allYears.length === 0) return null;
    return [Math.min(...allYears), Math.max(...allYears)];
  }, [books]);

  useEffect(() => {
    if (!yearBounds) return;
    const [boundMin, boundMax] = yearBounds;
    setYearRange((prev) => {
      const [prevMin, prevMax] = prev;
      if (prevMin === 0 && prevMax === 0) return [boundMin, boundMax];
      const nextMin = Math.max(boundMin, Math.min(prevMin, boundMax));
      const nextMax = Math.min(boundMax, Math.max(prevMax, boundMin));
      if (nextMin > nextMax) return [boundMin, boundMax];
      return [nextMin, nextMax];
    });
  }, [yearBounds]);

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    if (yearBounds) setYearRange(yearBounds);
  }, [yearBounds]);

  const filteredBooks = useMemo(() => {
    const query = normalizeText(searchQuery);
    const isYearFilterActive = Boolean(
      yearBounds && (yearRange[0] !== yearBounds[0] || yearRange[1] !== yearBounds[1])
    );

    return books
      .map((book) => {
        const title = normalizeText(book.title);
        const author = normalizeText(book.author);
        const description = normalizeText(book.description);
        const yearText = normalizeText(book.year);
        const bookYears = parseYearsFromText(book.year);
        const tags = (book.tags || []).map((tag) => normalizeText(tag));

        const hasSelectedTags =
          selectedTags.length === 0 ||
          selectedTags.every((tag) => tags.includes(normalizeText(tag)));

        if (!hasSelectedTags) {
          return { book, score: -1 };
        }

        const inYearRange = !yearBounds
          ? true
          : bookYears.length === 0
            ? !isYearFilterActive
            : bookYears.some((year) => year >= yearRange[0] && year <= yearRange[1]);

        if (!inYearRange) {
          return { book, score: -1 };
        }

        if (!query) {
          return { book, score: 1 };
        }

        let score = 0;
        if (title === query || author === query) score += 16;
        if (title.includes(query) || author.includes(query)) score += 12;
        if (tags.some((tag) => tag.includes(query))) score += 9;
        if (description.includes(query)) score += 6;
        if (yearText.includes(query)) score += 2;

        return { book, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.book);
  }, [books, searchQuery, selectedTags, yearBounds, yearRange]);

  if (loading) {
    return <TetrisLoader className="min-h-[380px]" />;
  }

  if (error) {
    return (
      <div
        dir="rtl"
        className={cn(
          'p-6 md:p-8',
          'bg-off-white border-3 border-off-black shadow-brutalist',
          'text-right'
        )}
      >
        <h3 className="text-xl font-bold font-shimshon text-off-black mb-2">לא הצלחנו לטעון את הספרייה</h3>
        <p className="text-sm font-ibm text-dark-gray mb-4">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className={cn(
            'px-4 py-2',
            'bg-tetris-yellow text-off-black font-shimshon font-bold',
            'border-2 border-off-black shadow-brutalist-xs',
            'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
            'transition-all duration-200'
          )}
        >
          נסו שוב
        </button>
      </div>
    );
  }

  return (
    <section dir="rtl" aria-label="הספרייה">
      <div
        className={cn(
          'p-4 md:p-5 mb-6',
          'bg-off-white border-3 border-off-black shadow-brutalist-sm'
        )}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 border-2 border-off-black px-2 py-1.5 bg-light-gray">
            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              aria-label="תצוגת גלריה"
              className={cn(
                'p-2 border-2 border-off-black transition-all duration-200',
                viewMode === 'gallery'
                  ? 'bg-tetris-purple text-off-white'
                  : 'bg-off-white text-off-black hover:bg-tetris-purple/20'
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="תצוגת רשימה"
              className={cn(
                'p-2 border-2 border-off-black transition-all duration-200',
                viewMode === 'list'
                  ? 'bg-tetris-purple text-off-white'
                  : 'bg-off-white text-off-black hover:bg-tetris-purple/20'
              )}
            >
              <List size={16} />
            </button>
          </div>

          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי שם ספר, מחבר, תיאור או תגית..."
              className={cn(
                'w-full py-2.5 pe-3 ps-9',
                'bg-off-white border-2 border-off-black',
                getSymbolicFontClass(searchQuery),
                'text-sm text-right',
                'focus:outline-none focus:shadow-brutalist-xs transition-all'
              )}
              dir="rtl"
            />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="mt-3 pt-3 border-t-2 border-off-black/20">
            <div className="flex justify-end">
              <TagFilterDropdown
                options={allTags}
                selected={selectedTags}
                onToggle={toggleTag}
                onClear={() => setSelectedTags([])}
              />
            </div>
          </div>
        )}

        {yearBounds && (
          <div className="mt-3 pt-3 border-t-2 border-off-black/20">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="flex-1">
                <YearRangeSlider bounds={yearBounds} range={yearRange} onChange={setYearRange} />
              </div>
              <div className="md:min-w-[170px]">
                <p className="text-xs text-dark-gray text-right mb-1 font-shimshon">טווח נבחר</p>
                <p className="text-sm text-off-black text-right border-2 border-off-black bg-light-gray px-3 py-1.5 font-pixelify">
                  {`${yearRange[0]} - ${yearRange[1]}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {(searchQuery.trim() || selectedTags.length > 0 || (yearBounds && (yearRange[0] !== yearBounds[0] || yearRange[1] !== yearBounds[1]))) && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5',
                'text-xs font-bold font-shimshon',
                'bg-tetris-pink border-2 border-off-black shadow-brutalist-xs',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-200'
              )}
            >
              <X size={12} />
              ניקוי חיפוש וסינון
            </button>
          </div>
        )}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="py-14 flex flex-col items-center justify-center text-center">
          <TetrisShape type="L" color="blue" size={30} className="opacity-60 mb-3" />
          <p className="text-lg font-shimshon font-bold text-off-black mb-1">לא נמצאו ספרים</p>
          <p className="text-sm font-ibm text-dark-gray">נסו מילות חיפוש אחרות או הורידו פילטרים.</p>
        </div>
      ) : viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {filteredBooks.map((book) => (
            <div key={book.id} id={makeBookTargetId(book.id)} className="h-full">
              <BookCard
                viewMode="gallery"
                title={book.title}
                author={book.author}
                year={book.year}
                why={book.description}
                tags={book.tags || []}
                coverUrl={book.coverUrl}
                link={book.link}
                className="h-full"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredBooks.map((book) => (
            <div key={book.id} id={makeBookTargetId(book.id)}>
              <BookCard
                viewMode="list"
                title={book.title}
                author={book.author}
                year={book.year}
                why={book.description}
                tags={book.tags || []}
                coverUrl={book.coverUrl}
                link={book.link}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default LibrarySection;
