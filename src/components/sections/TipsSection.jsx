import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import TipArticleModal from '../ui/TipArticleModal';
import TetrisLoader from '@/components/tetris/TetrisLoader';
import { getTagColor, getTagTextClass } from '@/lib/tagColors';

const bgColorMap = {
  0: 'bg-tetris-pink',
  1: 'bg-tetris-blue',
  2: 'bg-tetris-orange',
  3: 'bg-tetris-green',
  4: 'bg-tetris-yellow',
};

const TipsSection = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters — null means 'show all'
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  // Modal State
  const [activeTipIndex, setActiveTipIndex] = useState(null);

  useEffect(() => {
    fetch('/api/tips')
      .then((res) => {
        if (!res.ok) throw new Error('שגיאה בטעינת טיפים');
        return res.json();
      })
      .then((data) => {
        if (data.tips) setTips(data.tips);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Compute available filters — no 'הכל' needed
  const types = useMemo(() => {
    return [...new Set(tips.map((t) => t.type).filter(Boolean))];
  }, [tips]);

  const tags = useMemo(() => {
    const allTags = tips.flatMap((t) => t.tags || []);
    return [...new Set(allTags)];
  }, [tips]);

  // Apply filters
  const filteredTips = useMemo(() => {
    return tips.filter((t) => {
      const matchType = !selectedType || t.type === selectedType;
      const matchTag = !selectedTag || (t.tags && t.tags.includes(selectedTag));
      return matchType && matchTag;
    });
  }, [tips, selectedType, selectedTag]);

  // Actions
  const handleOpenTip = (tipId) => {
    const idx = filteredTips.findIndex((t) => t.id === tipId);
    if (idx !== -1) setActiveTipIndex(idx);
  };

  const handleNextTip = () => {
    if (activeTipIndex !== null && activeTipIndex < filteredTips.length - 1) {
      setActiveTipIndex(activeTipIndex + 1);
    }
  };

  const handlePrevTip = () => {
    if (activeTipIndex !== null && activeTipIndex > 0) {
      setActiveTipIndex(activeTipIndex - 1);
    }
  };

  const activeTip = activeTipIndex !== null ? filteredTips[activeTipIndex] : null;

  return (
    <section id="section-tips" className="py-12 md:py-16 relative" dir="rtl">
      <div className="mb-8 md:mb-12">
        <h2 className="text-4xl md:text-5xl font-bold font-shimshon text-off-black mb-4">
          טיפים
        </h2>
        <p className="text-lg text-dark-gray font-ibm max-w-2xl">
         מאגר של טיפים, הסברים ומדריכים
        </p>
      </div>

      {loading ? (
        <TetrisLoader className="min-h-[40vh]" />
      ) : error ? (
        <div className="p-4 bg-red-100 border-2 border-red-700 text-red-800 font-ibm shadow-brutalist">
          {error}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-8 bg-off-white border-3 border-off-black p-4 shadow-brutalist-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold font-shimshon text-off-black shrink-0 w-16">סוג:</span>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={`type-${type}`}
                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                    className={cn(
                      'px-3 py-1 font-shimshon border-2 border-off-black transition-all',
                      selectedType === type
                        ? 'bg-tetris-purple text-off-white shadow-none translate-x-[2px] translate-y-[2px] font-bold'
                        : 'bg-white text-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] font-bold'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold font-shimshon text-off-black shrink-0 w-16 pt-1">נושא:</span>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const tagBg = getTagColor(tag);
                  const isTagSelected = selectedTag === tag;
                  return (
                    <button
                      key={`tag-${tag}`}
                      onClick={() => setSelectedTag(isTagSelected ? null : tag)}
                      className={cn(
                        'px-3 py-1 font-mixed border-2 border-off-black transition-all',
                        isTagSelected
                          ? cn(tagBg, getTagTextClass(tagBg), 'shadow-none translate-x-[2px] translate-y-[2px]')
                          : 'bg-white text-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-sm font-ibm text-mid-gray mb-4">
            מציג {filteredTips.length} טיפים
          </div>

          {/* Cards Grid */}
          {filteredTips.length === 0 ? (
            <div className="py-12 text-center text-dark-gray font-ibm border-3 border-dashed border-mid-gray bg-white/50">
              לא נמצאו טיפים התואמים לסינון.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTips.map((tip, idx) => {
                const headColor = bgColorMap[idx % 5];
                return (
                  <button
                    key={tip.id}
                    onClick={() => handleOpenTip(tip.id)}
                    className={cn(
                      'group relative overflow-hidden bg-off-white text-right',
                      'border-3 border-off-black shadow-brutalist',
                      'aspect-[3/4] md:aspect-[4/5] flex flex-col',
                      'transition-all duration-300 hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                    )}
                  >
                    {/* Header Area */}
                    <div className={cn('h-[40%] border-b-3 border-off-black relative p-4', headColor)}>
                      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
                      {tip.type && (
                        <div className="absolute top-4 right-4 bg-off-black text-off-white px-2 py-1 text-xs font-bold font-shimshon shadow-brutalist-xs">
                          {tip.type}
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex-1 flex flex-col min-h-0 bg-noise mix-blend-multiply">
                      <h3 className="text-xl md:text-2xl font-bold font-shimshon text-off-black mb-2 line-clamp-3 leading-tight group-hover:text-tetris-purple transition-colors">
                        {tip.title}
                      </h3>
                      
                      <p className="text-sm text-dark-gray font-ibm line-clamp-3 mb-4 flex-1">
                        {/* Show a preview of the content, stripping simple formatting */}
                        {tip.content.substring(0, 150)}{tip.content.length > 150 ? '...' : ''}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {tip.tags?.slice(0, 3).map((tag, tagIdx) => {
                          const tagBgColor = getTagColor(tag);
                          return (
                            <span 
                              key={`${tip.id}-tag-${tagIdx}`}
                              className={cn(
                                "border border-off-black px-1.5 py-0.5 text-xs font-mixed",
                                tagBgColor,
                                getTagTextClass(tagBgColor)
                              )}
                            >
                              {tag}
                            </span>
                          );
                        })}
                        {tip.tags?.length > 3 && (
                          <span className="text-xs text-mid-gray shrink-0 pt-0.5 font-shimshon">
                            +{tip.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Article Modal */}
          <TipArticleModal
            tip={activeTip}
            open={activeTipIndex !== null}
            onClose={() => setActiveTipIndex(null)}
            onNext={handleNextTip}
            onPrev={handlePrevTip}
            hasNext={activeTipIndex !== null && activeTipIndex < filteredTips.length - 1}
            hasPrev={activeTipIndex !== null && activeTipIndex > 0}
          />
        </>
      )}
    </section>
  );
};

export default TipsSection;
