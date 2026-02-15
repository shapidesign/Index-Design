import React, { useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import useData from '@/hooks/useData';
import BookCard from '@/components/cards/BookCard';
import TetrisLoader from '@/components/tetris/TetrisLoader';
import TetrisShape from '@/components/tetris/TetrisShape';
import { LayoutGrid, List, Search, X } from 'lucide-react';

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const makeBookTargetId = (bookId) =>
  `search-item-library-${String(bookId || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

const LibrarySection = () => {
  const { data, loading, error, refetch } = useData('/api/books');
  const [viewMode, setViewMode] = useState('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

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

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
  }, []);

  const filteredBooks = useMemo(() => {
    const query = normalizeText(searchQuery);

    return books
      .map((book) => {
        const title = normalizeText(book.title);
        const author = normalizeText(book.author);
        const description = normalizeText(book.description);
        const year = normalizeText(book.year);
        const tags = (book.tags || []).map((tag) => normalizeText(tag));

        const hasSelectedTags =
          selectedTags.length === 0 ||
          selectedTags.every((tag) => tags.includes(normalizeText(tag)));

        if (!hasSelectedTags) {
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
        if (year.includes(query)) score += 2;

        return { book, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.book);
  }, [books, searchQuery, selectedTags]);

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
                'w-full py-2.5 pr-3 pl-9',
                'bg-off-white border-2 border-off-black',
                'font-shimshon text-sm text-right',
                'focus:outline-none focus:shadow-brutalist-xs transition-all'
              )}
              dir="rtl"
            />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 justify-end">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-3 py-1 text-xs font-bold font-shimshon',
                  'border-2 border-off-black shadow-brutalist-xs',
                  'transition-all duration-200',
                  'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                  selectedTags.includes(tag)
                    ? 'bg-tetris-cyan'
                    : 'bg-light-gray text-off-black'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {(searchQuery.trim() || selectedTags.length > 0) && (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} id={makeBookTargetId(book.id)}>
              <BookCard
                viewMode="gallery"
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
