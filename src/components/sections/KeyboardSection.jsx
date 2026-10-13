import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import TetrisShape from '@/components/tetris/TetrisShape';
import {
  APPS,
  BADGES,
  KEYBOARD,
  KEY_WIDTH,
  SHORTCUTS,
  applyAnswer,
  comboText,
  dayStreak,
  earnedBadges,
  emptyProgress,
  keyFace,
  masteryByApp,
  quizChoices,
  recordQuiz,
  sanitizeProgress,
} from '@/data/shortcuts';

const STORAGE_KEY = 'index-keyboard-progress';
const QUIZ_MS = 60_000;
const MODES = [
  { id: 'browse', label: 'עיון' },
  { id: 'practice', label: 'תרגול' },
  { id: 'quiz', label: 'חידון' },
  { id: 'achievements', label: 'הישגים' },
];

const appById = Object.fromEntries(APPS.map((app) => [app.id, app]));

const poolFor = (appId) => (
  appId === 'all' ? SHORTCUTS : SHORTCUTS.filter((item) => item.app === appId)
);

const pickItem = (items, avoidId) => {
  if (items.length === 0) return SHORTCUTS[0];
  let item = items[Math.floor(Math.random() * items.length)];
  let guard = 0;
  while (items.length > 1 && item.id === avoidId && guard < 8) {
    item = items[Math.floor(Math.random() * items.length)];
    guard += 1;
  }
  return item;
};

/**
 * KeyboardSection - המקלדת
 * Shortcut browser, practice, and timed quiz for design software.
 */
const KeyboardSection = ({ pendingNavigation }) => {
  const [platform, setPlatform] = useState('mac');
  const [appId, setAppId] = useState('all');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('browse');
  const [selectedId, setSelectedId] = useState(SHORTCUTS[0].id);
  const [hoverId, setHoverId] = useState(null);
  const [pressedKey, setPressedKey] = useState(null);
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? sanitizeProgress(JSON.parse(saved)) : emptyProgress();
    } catch {
      return emptyProgress();
    }
  });
  const [freshBadges, setFreshBadges] = useState([]);
  const [practiceId, setPracticeId] = useState(null);
  const [practiceOptions, setPracticeOptions] = useState([]);
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [tick, setTick] = useState(0);
  const round = useRef({ answered: 0, correct: 0 });
  const recorded = useRef(false);
  const answering = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const linkedId = (pendingNavigation?.targetId || '').replace(/^search-item-keyboard-/, '');
  const linked = linkedId === pendingNavigation?.targetId ? null : SHORTCUTS.find((entry) => entry.id === linkedId);
  const [appliedLink, setAppliedLink] = useState('');
  if (linked && linked.id !== appliedLink) {
    setAppliedLink(linked.id);
    setMode('browse');
    setAppId(linked.app);
    setQuery('');
    setSelectedId(linked.id);
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SHORTCUTS.filter((item) => {
      if (appId !== 'all' && item.app !== appId) return false;
      if (!needle) return true;
      const app = appById[item.app];
      const keys = [...item.mac, ...item.win]
        .map((key) => `${keyFace(key, 'mac').en} ${keyFace(key, 'win').en} ${keyFace(key, platform).he}`)
        .join(' ');
      return `${item.label} ${item.category} ${app.name} ${app.he} ${keys}`.toLowerCase().includes(needle);
    });
  }, [appId, platform, query]);

  const browseItems = useMemo(() => (
    pressedKey ? filtered.filter((item) => item[platform].includes(pressedKey)) : filtered
  ), [filtered, platform, pressedKey]);

  const groups = useMemo(() => {
    const next = [];
    browseItems.forEach((item) => {
      const last = next[next.length - 1];
      if (!last || last.category !== item.category || last.app !== item.app) {
        next.push({ key: `${item.app}-${item.category}-${next.length}`, app: item.app, category: item.category, items: [item] });
      } else {
        last.items.push(item);
      }
    });
    return next;
  }, [browseItems]);

  const noteBadges = (before, after) => {
    const known = new Set(earnedBadges(before).map((badge) => badge.id));
    const earned = earnedBadges(after).filter((badge) => !known.has(badge.id));
    if (earned.length > 0) setFreshBadges(earned);
  };

  const dealPractice = useCallback((avoidId) => {
    const item = pickItem(filtered.length > 0 ? filtered : SHORTCUTS, avoidId);
    setPracticeId(item.id);
    setPracticeOptions(quizChoices(item, platform, SHORTCUTS));
    setPracticeFeedback(null);
  }, [filtered, platform]);

  const changePlatform = (next) => {
    setPlatform(next);
    if (practiceId && !practiceFeedback) {
      const item = SHORTCUTS.find((entry) => entry.id === practiceId);
      if (item) setPracticeOptions(quizChoices(item, next, SHORTCUTS));
    }
    if (quiz && !quiz.finished && !quiz.feedback) {
      const item = SHORTCUTS.find((entry) => entry.id === quiz.itemId);
      if (item) {
        setQuiz((current) => (
          current ? { ...current, options: quizChoices(item, next, SHORTCUTS) } : current
        ));
      }
    }
  };

  const startQuiz = () => {
    const item = pickItem(poolFor(appId));
    recorded.current = false;
    round.current = { answered: 0, correct: 0 };
    setTick(Date.now());
    setQuiz({
      endsAt: Date.now() + QUIZ_MS,
      itemId: item.id,
      options: quizChoices(item, platform, SHORTCUTS),
      feedback: null,
      answered: 0,
      correct: 0,
      finished: false,
    });
    setMode('quiz');
  };

  const finishQuiz = useCallback(() => {
    if (recorded.current) return;
    recorded.current = true;
    const { answered, correct } = round.current;
    setProgress((prev) => {
      const next = recordQuiz(prev, { answered, correct });
      const known = new Set(earnedBadges(prev).map((badge) => badge.id));
      const earned = earnedBadges(next).filter((badge) => !known.has(badge.id));
      if (earned.length > 0) setFreshBadges(earned);
      return next;
    });
    setQuiz((current) => (
      current ? { ...current, finished: true, answered, correct, feedback: null } : current
    ));
  }, []);

  useEffect(() => {
    if (!quiz || quiz.finished) return undefined;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setTick(now);
      if (now >= quiz.endsAt) finishQuiz();
    }, 250);
    return () => window.clearInterval(timer);
  }, [finishQuiz, quiz]);

  const answerWith = (item, option, onFeedback) => {
    if (!item || option == null) return;
    const next = applyAnswer(progress, {
      shortcutId: item.id,
      correct: option.correct,
      platform,
    });
    noteBadges(progress, next);
    setProgress(next);
    onFeedback();
  };

  const answerPractice = (option) => {
    if (answering.current || practiceFeedback) return;
    answering.current = true;
    const item = SHORTCUTS.find((entry) => entry.id === practiceId);
    answerWith(item, option, () => setPracticeFeedback({ correct: option.correct, id: option.id }));
  };

  const answerQuiz = (option) => {
    if (answering.current || !quiz || quiz.feedback || quiz.finished) return;
    answering.current = true;
    const item = SHORTCUTS.find((entry) => entry.id === quiz.itemId);
    answerWith(item, option, () => {
      const answered = quiz.answered + 1;
      const correct = quiz.correct + (option.correct ? 1 : 0);
      round.current = { answered, correct };
      setQuiz((current) => (
        current ? { ...current, feedback: { correct: option.correct, id: option.id }, answered, correct } : current
      ));
    });
  };

  const continueQuiz = () => {
    if (!quiz) return;
    answering.current = false;
    if (Date.now() >= quiz.endsAt) {
      finishQuiz();
      return;
    }
    const item = pickItem(poolFor(appId), quiz.itemId);
    setQuiz((current) => (
      current ? {
        ...current,
        itemId: item.id,
        options: quizChoices(item, platform, SHORTCUTS),
        feedback: null,
      } : current
    ));
  };

  const resetProgress = () => {
    if (!window.confirm('לאפס את הרצף, הניקוד וההישגים?')) return;
    setProgress(emptyProgress());
    setFreshBadges([]);
  };

  const pressKey = (id) => {
    if (mode !== 'browse') return;
    const next = pressedKey === id ? null : id;
    setPressedKey(next);
    if (!next) return;
    const match = SHORTCUTS.find((item) => (
      (appId === 'all' || item.app === appId) && item[platform].includes(next)
    ));
    if (match) setSelectedId(match.id);
  };

  const highlightedId = mode === 'browse'
    ? hoverId || selectedId
    : mode === 'practice' && practiceFeedback
      ? practiceId
      : mode === 'quiz' && quiz?.feedback
        ? quiz.itemId
        : null;
  const highlightedItem = SHORTCUTS.find((item) => item.id === highlightedId);
  const highlighted = new Set(highlightedItem ? highlightedItem[platform] : []);
  const announcement = highlightedItem
    ? `${highlightedItem.label}. ${comboText(highlightedItem[platform], platform, 'he')}`
    : '';

  const accuracy = progress.attempts > 0
    ? Math.round((progress.correct / progress.attempts) * 100)
    : 0;
  const remaining = quiz && !quiz.finished
    ? Math.max(0, Math.ceil((quiz.endsAt - tick) / 1000))
    : 0;
  const badges = earnedBadges(progress);
  const mastery = masteryByApp(progress);

  return (
    <section dir="rtl" aria-labelledby="keyboard-title">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="text-right">
          <div className="flex items-center justify-end gap-3 mb-2">
            <h2 id="keyboard-title" className="text-3xl md:text-5xl font-bold font-headline text-off-black">
              המקלדת
            </h2>
            <TetrisShape type="I" color="blue" size={12} />
          </div>
          <p className="font-ibm text-dark-gray max-w-2xl">
            קיצורי המקלדת השימושיים ביותר לתוכנות עיצוב. על כל מקש מופיעה האות שבאותו מקום במקלדת עברית.
          </p>
        </div>
        <div role="group" aria-label="מערכת הפעלה" className="flex gap-2">
          {[
            ['mac', 'macOS'],
            ['win', 'Windows'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={platform === id}
              onClick={() => changePlatform(id)}
              className={cn(
                'min-h-11 px-4 py-2 font-jersey text-base border-2 border-off-black',
                'transition-all duration-200',
                platform === id
                  ? 'bg-tetris-blue text-off-black shadow-none translate-x-[2px] translate-y-[2px]'
                  : 'bg-off-white shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Stat label="רצף" value={progress.streak} />
        <Stat label="שיא" value={progress.bestStreak} />
        <Stat label="דיוק" value={`${accuracy}%`} />
        <Stat label="ימים" value={dayStreak(progress.days)} />
      </div>

      {freshBadges.length > 0 && (
        <div role="status" className="mb-4 p-4 bg-tetris-yellow border-3 border-off-black shadow-brutalist flex flex-wrap items-center justify-between gap-3">
          <p className="font-headline font-bold text-off-black">
            הישג חדש: {freshBadges.map((badge) => badge.label).join(' · ')}
          </p>
          <button
            type="button"
            onClick={() => setFreshBadges([])}
            className="min-h-11 px-3 font-headline font-bold border-2 border-off-black bg-off-white"
          >
            סגירה
          </button>
        </div>
      )}

      <div role="tablist" aria-label="מצב המקלדת" className="flex gap-2 overflow-x-auto mb-4">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            onClick={() => {
              setMode(item.id);
              if (item.id === 'practice' && !practiceId) dealPractice();
            }}
            className={cn(
              'min-h-11 px-4 py-2 font-headline font-bold border-2 border-off-black whitespace-nowrap',
              'transition-all duration-200',
              mode === item.id
                ? 'bg-tetris-purple text-off-white shadow-none translate-x-[2px] translate-y-[2px]'
                : 'bg-off-white text-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">{announcement}</p>

      {mode === 'browse' && (
        <div className="flex flex-col gap-4">
          <AppPicker appId={appId} onChange={setAppId} />
          <div className="grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-4">
            <div className="min-w-0 order-2 lg:order-1">
            <label className="block mb-3">
              <span className="sr-only">חיפוש קיצור</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="חיפוש קיצור או מקש..."
                dir="rtl"
                className="w-full min-h-11 px-4 py-3 bg-off-white text-off-black font-headline text-right border-3 border-off-black shadow-brutalist-xs outline-none focus:shadow-brutalist"
              />
            </label>
            <div className="max-h-[70vh] overflow-y-auto flex flex-col gap-4">
              {groups.length === 0 ? (
                <p className="font-ibm text-dark-gray text-right">לא נמצאו קיצורים</p>
              ) : groups.map((group) => (
                <div key={group.key}>
                  <h3 className="font-headline font-bold text-sm text-dark-gray mb-2 text-right">
                    {appId === 'all' ? `${appById[group.app].he} · ` : ''}{group.category}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        id={`search-item-keyboard-${item.id}`}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        onMouseEnter={() => setHoverId(item.id)}
                        onMouseLeave={() => setHoverId(null)}
                        onFocus={() => setHoverId(item.id)}
                        onBlur={() => setHoverId(null)}
                        className={cn(
                          'min-h-11 w-full p-3 text-right border-2 border-off-black',
                          'transition-all duration-200',
                          selectedId === item.id
                            ? 'bg-tetris-yellow shadow-none translate-x-[2px] translate-y-[2px]'
                            : 'bg-off-white shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                        )}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-headline font-bold text-off-black">
                            {item.label}
                            {progress.mastered[item.id] && (
                              <span className="ms-2 font-ibm text-xs font-normal text-dark-gray">נלמד</span>
                            )}
                          </span>
                          <span dir="ltr" className="font-jersey text-sm text-off-black shrink-0">
                            {comboText(item[platform], platform)}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 order-1 lg:order-2">
            <KeyboardBoard
              platform={platform}
              highlighted={highlighted}
              pressedKey={mode === 'browse' ? pressedKey : null}
              onKey={pressKey}
            />
            {highlightedItem && (
              <article className="mt-4 p-4 bg-off-white border-3 border-off-black shadow-brutalist text-right">
                <p className="font-jersey text-sm text-dark-gray">{appById[highlightedItem.app].name}</p>
                <h3 className="font-headline text-2xl font-bold mt-1">{highlightedItem.label}</h3>
                <p dir="ltr" className="font-jersey text-2xl mt-3 text-right">{comboText(highlightedItem[platform], platform)}</p>
                <p dir="ltr" className="font-headline text-base mt-1 text-right text-dark-gray">
                  {comboText(highlightedItem[platform], platform, 'he')}
                </p>
              </article>
            )}
            </div>
          </div>
        </div>
      )}

      {(mode === 'practice' || (mode === 'quiz' && quiz && !quiz.finished)) && (
        <div className="grid lg:grid-cols-2 gap-4">
          <QuestionCard
            mode={mode}
            platform={platform}
            item={SHORTCUTS.find((entry) => entry.id === (mode === 'practice' ? practiceId : quiz?.itemId))}
            options={mode === 'practice' ? practiceOptions : quiz?.options || []}
            feedback={mode === 'practice' ? practiceFeedback : quiz?.feedback}
            remaining={remaining}
            onAnswer={mode === 'practice' ? answerPractice : answerQuiz}
            onNext={mode === 'practice' ? () => {
              answering.current = false;
              dealPractice(practiceId);
            } : continueQuiz}
            onStart={mode === 'practice' ? () => dealPractice(practiceId) : startQuiz}
          />
          <KeyboardBoard
            platform={platform}
            highlighted={highlighted}
            pressedKey={mode === 'browse' ? pressedKey : null}
            onKey={pressKey}
          />
        </div>
      )}

      {mode === 'quiz' && !quiz && (
        <div className="p-6 bg-off-white border-3 border-off-black shadow-brutalist text-right">
          <h3 className="font-headline text-2xl font-bold mb-2">חידון של 60 שניות</h3>
          <p className="font-ibm text-dark-gray mb-4">
            בוחרים את הצירוף הנכון. הרצף נשמר גם אם עוצרים באמצע.
          </p>
          <button
            type="button"
            onClick={startQuiz}
            className="min-h-11 px-6 py-3 bg-tetris-purple text-off-white font-headline font-bold border-3 border-off-black shadow-brutalist hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-200"
          >
            התחלת חידון
          </button>
        </div>
      )}

      {mode === 'quiz' && quiz?.finished && (
        <div className="p-6 bg-tetris-yellow border-3 border-off-black shadow-brutalist text-right">
          <h3 className="font-headline text-3xl font-bold mb-2">החידון נגמר</h3>
          <p className="font-ibm text-lg mb-4">
            {quiz.answered === 0
              ? 'הזמן נגמר לפני התשובה הראשונה.'
              : `עניתם נכון על ${quiz.correct} מתוך ${quiz.answered}.`}
          </p>
          <button
            type="button"
            onClick={startQuiz}
            className="min-h-11 px-6 py-3 bg-off-black text-off-white font-headline font-bold border-3 border-off-black shadow-brutalist hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-200"
          >
            עוד חידון
          </button>
        </div>
      )}

      {mode === 'achievements' && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
          <div className="p-4 bg-off-white border-3 border-off-black shadow-brutalist">
            <h3 className="font-headline text-2xl font-bold text-right mb-4">שליטה לפי תוכנה</h3>
            <div className="flex flex-col gap-3">
              {APPS.map((app) => {
                const score = mastery[app.id] || { done: 0, total: 0 };
                const width = score.total ? (score.done / score.total) * 100 : 0;
                return (
                  <div key={app.id}>
                    <div className="flex justify-between gap-3 mb-1">
                      <span className="font-jersey text-sm">{score.done}/{score.total}</span>
                      <span className="font-headline font-bold">{app.he}</span>
                    </div>
                    <div
                      role="meter"
                      aria-label={app.he}
                      aria-valuemin={0}
                      aria-valuemax={score.total}
                      aria-valuenow={score.done}
                      className="h-4 border-2 border-off-black bg-light-gray"
                    >
                      <div className={cn('h-full', app.bg)} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 bg-off-white border-3 border-off-black shadow-brutalist">
            <div className="flex items-center justify-between gap-3 mb-4">
              <button
                type="button"
                onClick={resetProgress}
                className="min-h-11 px-3 font-headline font-bold border-2 border-off-black bg-light-gray shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
              >
                איפוס
              </button>
              <h3 className="font-headline text-2xl font-bold">הישגים {badges.length}/{BADGES.length}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BadgeList progress={progress} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const Stat = ({ label, value }) => (
  <div className="p-3 bg-light-gray border-2 border-off-black text-right">
    <div className="font-jersey text-2xl leading-none text-off-black">{value}</div>
    <div className="font-headline text-sm text-dark-gray mt-1">{label}</div>
  </div>
);

const AppPicker = ({ appId, onChange }) => (
  <div className="flex w-full min-w-0 flex-wrap gap-2" role="group" aria-label="בחירת תוכנה">
    <PickerChip active={appId === 'all'} onClick={() => onChange('all')} label="הכול" />
    {APPS.map((app) => (
      <PickerChip
        key={app.id}
        active={appId === app.id}
        onClick={() => onChange(app.id)}
        label={app.name}
        english
        activeClass={app.bg}
        activeText={app.text}
      />
    ))}
  </div>
);

const PickerChip = ({ active, onClick, label, english = false, activeClass = 'bg-tetris-yellow', activeText = 'text-off-black' }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'shrink-0 min-h-11 px-3 py-2 border-2 border-off-black whitespace-nowrap',
      english ? 'font-jersey' : 'font-headline font-bold',
      'transition-all duration-200',
      active
        ? [activeClass, activeText, 'shadow-none translate-x-[2px] translate-y-[2px]']
        : 'bg-off-white text-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
    )}
  >
    {label}
  </button>
);

const KeyboardBoard = ({ platform, highlighted, pressedKey, onKey }) => (
  <>
    <p className="lg:hidden p-4 bg-light-gray border-3 border-off-black shadow-brutalist font-headline font-bold text-off-black text-right">
      זמין רק דרך המחשב
    </p>
    <div className="hidden lg:block min-w-0 overflow-x-auto p-3 bg-light-gray border-3 border-off-black shadow-brutalist">
      <div className="flex items-end gap-3 min-w-[860px]" dir="ltr">
        <div className="flex-1">
          {KEYBOARD[platform].map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 mb-1">
              {row.map((key, index) => (
                key === 'gap'
                  ? <span key={`gap-${index}`} className="w-3 shrink-0" />
                  : (
                    <Keycap
                      key={`${key}-${index}`}
                      id={key}
                      platform={platform}
                      active={highlighted.has(key)}
                      pressed={pressedKey === key}
                      onClick={onKey}
                    />
                  )
              ))}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1 w-[8.75rem] shrink-0 mb-1">
          <span />
          <Keycap id="up" platform={platform} active={highlighted.has('up')} pressed={pressedKey === 'up'} onClick={onKey} fixed />
          <span />
          {['left', 'down', 'right'].map((key) => (
            <Keycap
              key={key}
              id={key}
              platform={platform}
              active={highlighted.has(key)}
              pressed={pressedKey === key}
              onClick={onKey}
              fixed
            />
          ))}
        </div>
      </div>
    </div>
  </>
);

const Keycap = ({ id, platform, active, pressed = false, fixed = false, onClick }) => {
  const face = keyFace(id, platform);
  const showHe = face.he && face.he !== face.en;
  const lit = active || pressed;
  return (
    <button
      type="button"
      title={showHe ? `${face.en} · ${face.he}` : face.en}
      aria-label={showHe ? `${face.en} ${face.he}` : face.en}
      aria-pressed={pressed}
      onClick={() => onClick?.(id)}
      className={cn(
        'min-h-11 px-1 py-1 flex flex-col items-center justify-center text-center',
        'border-2 border-off-black cursor-pointer',
        'transition-all duration-150',
        fixed ? 'w-11' : 'min-w-11',
        lit
          ? 'bg-tetris-yellow shadow-none translate-x-[2px] translate-y-[2px]'
          : 'bg-off-white shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:bg-tetris-yellow active:shadow-none active:translate-x-[2px] active:translate-y-[2px]'
      )}
      style={fixed ? undefined : { flexGrow: KEY_WIDTH[id] || 1, flexBasis: 0 }}
    >
      <span className="font-jersey text-sm leading-none text-off-black">{face.en}</span>
      {showHe && (
        <span className={cn(
          'leading-none mt-1 text-dark-gray',
          /[\u0590-\u05FF]/.test(face.he) ? 'font-headline text-xs leading-tight' : 'font-jersey text-[10px] whitespace-nowrap'
        )}>
          {face.he}
        </span>
      )}
    </button>
  );
};

const QuestionCard = ({
  mode,
  platform,
  item,
  options,
  feedback,
  remaining,
  onAnswer,
  onNext,
  onStart,
}) => {
  if (!item) {
    return (
      <div className="p-6 bg-off-white border-3 border-off-black shadow-brutalist text-right">
        <button type="button" onClick={onStart} className="min-h-11 px-4 font-headline font-bold border-2 border-off-black bg-tetris-green">
          {mode === 'quiz' ? 'התחלת חידון' : 'התחלת תרגול'}
        </button>
      </div>
    );
  }
  return (
    <div className="p-4 md:p-6 bg-off-white border-3 border-off-black shadow-brutalist text-right">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="font-jersey text-sm">{appById[item.app].name}</span>
        {mode === 'quiz' && (
          <span className="font-headline font-bold tabular-nums" aria-live="off">
            {remaining} שנ׳
          </span>
        )}
      </div>
      <h3 className="font-headline text-2xl md:text-3xl font-bold mb-4">{item.label}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const correct = feedback && option.correct;
          const wrong = feedback && feedback.id === option.id && !option.correct;
          return (
            <button
              key={option.id}
              type="button"
              disabled={Boolean(feedback)}
              onClick={() => onAnswer(option)}
              className={cn(
                'min-h-11 p-3 border-2 border-off-black text-center',
                'transition-all duration-200 disabled:cursor-default',
                correct && 'bg-tetris-green',
                wrong && 'bg-tetris-pink',
                !correct && !wrong && 'bg-light-gray shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
              )}
            >
              <span dir="ltr" className="block font-jersey text-lg text-off-black">
                {comboText(option.keys, platform)}
              </span>
              <span dir="ltr" className="block font-headline text-xs text-dark-gray mt-1">
                {comboText(option.keys, platform, 'he')}
              </span>
            </button>
          );
        })}
      </div>
      {feedback && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onNext}
            className="min-h-11 px-4 py-2 bg-tetris-green font-headline font-bold border-2 border-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
          >
            {mode === 'quiz' ? 'המשך' : 'השאלה הבאה'}
          </button>
          <p className="font-headline font-bold" role="status">
            {feedback.correct ? 'נכון' : 'לא נכון'}
          </p>
        </div>
      )}
    </div>
  );
};

const BadgeList = ({ progress }) => {
  const earned = new Set(earnedBadges(progress).map((badge) => badge.id));
  return BADGES.map((badge) => {
    const owned = earned.has(badge.id);
    return (
      <article
        key={badge.id}
        className={cn(
          'p-3 border-2 border-off-black text-right',
          owned ? 'bg-tetris-yellow' : 'bg-light-gray'
        )}
      >
        <h4 className="font-headline font-bold">{badge.label}</h4>
        <p className="font-ibm text-sm text-dark-gray mt-1">{badge.hint}</p>
        <p className="font-headline text-sm mt-2">{owned ? 'הושג' : 'עדיין לא'}</p>
      </article>
    );
  });
};

export default KeyboardSection;
