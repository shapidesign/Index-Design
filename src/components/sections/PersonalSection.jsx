import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import useSavedItems, {
  MAX_FOLDER_NAME_LENGTH,
  encodeSharedFolder,
  decodeSharedFolder,
} from '@/hooks/useSavedItems';
import TetrisShape from '@/components/tetris/TetrisShape';
import { getTagColor, getTagTextClass } from '@/lib/tagColors';
import {
  Bookmark,
  FolderPlus,
  Share2,
  Trash2,
  Edit3,
  Palette,
  ExternalLink,
  ArrowUpLeft,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Upload,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react';

const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test((text || '').trim());

const SECTION_META = {
  toolbox: { label: 'ארגז הכלים', bg: 'bg-tetris-purple', text: 'text-off-white' },
  museum: { label: 'המוזיאון', bg: 'bg-tetris-orange', text: 'text-off-black' },
  library: { label: 'הספרייה', bg: 'bg-tetris-blue', text: 'text-off-black' },
  dictionary: { label: 'מילון', bg: 'bg-tetris-yellow', text: 'text-off-black' },
  keyboard: { label: 'מקלדת', bg: 'bg-tetris-cyan', text: 'text-off-black' },
  map: { label: 'המפה', bg: 'bg-tetris-green', text: 'text-off-black' },
  tips: { label: 'טיפים', bg: 'bg-tetris-pink', text: 'text-off-black' },
};

const FOLDER_BG_MAP = {
  purple: 'bg-tetris-purple text-off-white',
  orange: 'bg-tetris-orange text-off-black',
  blue: 'bg-tetris-blue text-off-black',
  yellow: 'bg-tetris-yellow text-off-black',
  cyan: 'bg-tetris-cyan text-off-black',
  green: 'bg-tetris-green text-off-black',
  pink: 'bg-tetris-pink text-off-black',
};

const STUDY_YEARS = ['שנה א׳', 'שנה ב׳', 'שנה ג׳', 'שנה ד׳', 'בוגר/ת'];
const COURSES = [
  'טיפוגרפיה',
  'מיתוג וזהות',
  'איור',
  'אינטראקטיב / UI',
  'מושן ווידאו',
  'פרויקט גמר',
  'פרויקט אישי',
];

const SEED_STUDENT_SHOWCASE = [
  {
    id: 'demo-1',
    title: 'אותיות בתנועה — כרזה טיפוגרפית אינטראקטיבית',
    studentName: 'נועה לוי',
    studyYear: 'שנה ב׳',
    course: 'טיפוגרפיה',
    description: 'מחקר צורני של אותיות עבריות גיאומטריות בהשראת באוהאוס ומשחקי ארקייד.',
    projectUrl: 'https://www.hit.ac.il/academic/design/visual-communications/',
    shape: 'T',
    color: 'purple',
  },
  {
    id: 'demo-2',
    title: 'מיתוג מחדש לשוק הפשפשים',
    studentName: 'עידו כהן',
    studyYear: 'שנה ג׳',
    course: 'מיתוג וזהות',
    description: 'שפה חזותית ברוטליסטית המשלבת דפוס רשת ידני עם מערכת אייקונים מודולרית.',
    projectUrl: 'https://www.hit.ac.il/academic/design/visual-communications/',
    shape: 'L',
    color: 'orange',
  },
  {
    id: 'demo-3',
    title: 'ארכיון הרחוב הישראלי — זין מאויר',
    studentName: 'מאיה שפירא',
    studyYear: 'שנה א׳',
    course: 'איור',
    description: 'תיעוד מאויר של שלטי מלאכה ישנים בתל אביב וחולון בדפוס ריזוגרף דו-צבעוני.',
    projectUrl: 'https://www.hit.ac.il/academic/design/visual-communications/',
    shape: 'Z',
    color: 'green',
  },
];

const makeOriginalTargetId = (sectionId, itemId) =>
  `search-item-${sectionId}-${String(itemId || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

const PersonalSection = ({ onNavigateToItem, onBrowseSection }) => {
  const {
    folders,
    savedItemsList,
    savedCount,
    submissions,
    undoState,
    handleUndo,
    dismissUndo,
    removeItem,
    toggleItemFolder,
    updateItemNote,
    createFolder,
    renameFolder,
    cycleFolderStyle,
    deleteFolder,
    importSharedFolder,
    addLocalSubmission,
  } = useSavedItems();

  const [activeTab, setActiveTab] = useState('crate'); // 'crate' | 'showcase'
  const [selectedFolderId, setSelectedFolderId] = useState('all'); // 'all' | 'unfiled' | folder.id
  const [viewMode, setViewMode] = useState('gallery');
  const [searchQuery, setSearchQuery] = useState('');

  // Folder creation & editing state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const [importBanner, setImportBanner] = useState('');

  // Phase 2 Showcase state
  const [courseFilter, setCourseFilter] = useState('הכל');
  const [isSubmitWorkOpen, setIsSubmitWorkOpen] = useState(false);
  const [workForm, setWorkForm] = useState({
    title: '',
    studentName: '',
    studyYear: 'שנה א׳',
    course: 'טיפוגרפיה',
    projectUrl: '',
    imageUrl: '',
    description: '',
  });
  const [workFormError, setWorkFormError] = useState('');
  const [workFormSuccess, setWorkFormSuccess] = useState('');

  // Check if URL contains a shared folder payload (?import=...)
  useEffect(() => {
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return undefined;
    const params = new URLSearchParams(hash.slice(qIndex + 1));
    const encoded = params.get('import');
    if (!encoded) return undefined;

    const decoded = decodeSharedFolder(encoded);
    if (!decoded) return undefined;

    const timer = window.setTimeout(() => {
      const folderId = importSharedFolder(decoded);
      if (folderId) {
        setSelectedFolderId(folderId);
        setImportBanner(`התיקייה "${decoded.name}" יובאה בהצלחה למגירה שלך!`);
        window.history.replaceState(null, '', '#/saved');
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [importSharedFolder]);

  const effectiveFolderId = useMemo(() => {
    if (selectedFolderId === 'all' || selectedFolderId === 'unfiled') return selectedFolderId;
    return folders.some((f) => f.id === selectedFolderId) ? selectedFolderId : 'all';
  }, [folders, selectedFolderId]);

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === effectiveFolderId) || null,
    [folders, effectiveFolderId]
  );

  // Per-folder item counts
  const folderCounts = useMemo(() => {
    const counts = { all: savedItemsList.length, unfiled: 0 };
    for (const f of folders) counts[f.id] = 0;
    for (const item of savedItemsList) {
      if (!item.folderIds || item.folderIds.length === 0) {
        counts.unfiled += 1;
      } else {
        for (const fid of item.folderIds) {
          if (counts[fid] !== undefined) counts[fid] += 1;
        }
      }
    }
    return counts;
  }, [folders, savedItemsList]);

  // Filtered saved items for current folder + search query
  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return savedItemsList.filter((item) => {
      if (effectiveFolderId === 'unfiled') {
        if (item.folderIds && item.folderIds.length === 0) return true;
        return false;
      } else if (effectiveFolderId !== 'all') {
        if (!item.folderIds?.includes(effectiveFolderId)) return false;
      }

      if (!q) return true;
      const hay = [
        item.snapshot?.titleHe,
        item.snapshot?.titleEn,
        item.snapshot?.description,
        item.note,
        ...(item.snapshot?.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [savedItemsList, effectiveFolderId, searchQuery]);

  const handleCreateFolderSubmit = (e) => {
    e.preventDefault();
    const res = createFolder(newFolderName);
    if (!res.ok) {
      setFolderError(res.error || 'שגיאה ביצירת תיקייה');
      return;
    }
    setNewFolderName('');
    setFolderError('');
    setIsCreatingFolder(false);
    if (res.folder) {
      setSelectedFolderId(res.folder.id);
    }
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!activeFolder) return;
    const res = renameFolder(activeFolder.id, renameValue);
    if (!res.ok) {
      setFolderError(res.error || 'שגיאה בשינוי השם');
      return;
    }
    setIsRenaming(false);
    setFolderError('');
  };

  const handleShareFolder = async () => {
    const folderToShare = activeFolder || {
      name: 'המומלצים שלי באינדקס',
      color: 'purple',
      shape: 'T',
    };
    const encoded = encodeSharedFolder(folderToShare, visibleItems);
    if (!encoded) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#/saved?import=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback('קישור לתיקייה הועתק ללוח!');
    } catch {
      setShareFeedback(shareUrl);
    }
    window.setTimeout(() => setShareFeedback(''), 3500);
  };

  const handleWorkSubmit = (e) => {
    e.preventDefault();
    if (!workForm.title.trim()) {
      setWorkFormError('יש להזין כותרת לעבודה');
      return;
    }
    if (!workForm.studentName.trim()) {
      setWorkFormError('יש להזין שם סטודנט/ית');
      return;
    }
    addLocalSubmission(workForm);
    setWorkForm({
      title: '',
      studentName: '',
      studyYear: 'שנה א׳',
      course: 'טיפוגרפיה',
      projectUrl: '',
      imageUrl: '',
      description: '',
    });
    setWorkFormError('');
    setWorkFormSuccess('העבודה נשמרה במגירה שלך ומוצגת בתערוכה!');
    setIsSubmitWorkOpen(false);
    window.setTimeout(() => setWorkFormSuccess(''), 4000);
  };

  const allShowcaseWorks = useMemo(() => {
    const userFormatted = submissions.map((s, i) => ({
      ...s,
      shape: ['T', 'L', 'I', 'Z', 'J', 'O', 'S'][i % 7],
      color: ['pink', 'cyan', 'yellow', 'purple', 'green', 'orange', 'blue'][i % 7],
      isPersonal: true,
    }));
    const combined = [...userFormatted, ...SEED_STUDENT_SHOWCASE];
    if (courseFilter === 'הכל') return combined;
    return combined.filter((w) => w.course === courseFilter);
  }, [submissions, courseFilter]);

  return (
    <section dir="rtl" className="animate-tetris-stack">
      {/* ===== UNDO TOAST (Norman Error Recovery) ===== */}
      {undoState && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'mb-6 p-3 px-4',
            'bg-tetris-yellow text-off-black',
            'border-3 border-off-black shadow-brutalist-sm',
            'flex flex-wrap items-center justify-between gap-3'
          )}
        >
          <span className="font-headline text-sm font-bold">{undoState.label}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1',
                'bg-off-black text-off-white font-headline text-xs font-bold',
                'border-2 border-off-black cursor-pointer hover:bg-tetris-purple transition-colors'
              )}
            >
              <RotateCcw size={13} />
              <span>בטל מחיקה</span>
            </button>
            <button
              type="button"
              onClick={dismissUndo}
              aria-label="סגור הודעה"
              className="p-1 text-off-black hover:bg-off-black/10 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {importBanner && (
        <div className="mb-6 p-3 px-4 bg-tetris-green text-off-black border-3 border-off-black shadow-brutalist-sm flex items-center justify-between gap-3">
          <span className="font-headline text-sm font-bold">{importBanner}</span>
          <button
            type="button"
            onClick={() => setImportBanner('')}
            className="p-1 hover:bg-off-black/10 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ===== HEADER & MODE SWITCHER ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-tetris-yellow border-2 border-off-black shadow-brutalist-xs mb-3">
            <Bookmark size={14} className="fill-off-black" />
            <span className="font-headline text-xs font-bold text-off-black">
              אזור אישי · נשמר אוטומטית בדפדפן
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-off-black font-headline leading-tight">
            המגירה שלי
          </h2>
          <p className="text-sm md:text-base text-dark-gray font-ibm mt-1 max-w-2xl">
            כל הכלים, הפונטים, הספרים וההשראות ששמרתם מהאתר — מסודרים בתיקיות אישיות לפי קורס או פרויקט.
          </p>
        </div>

        {/* Mode Switcher: Saved Crate vs Student Works Showcase */}
        <div className="flex border-3 border-off-black bg-off-white shadow-brutalist-sm self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('crate')}
            className={cn(
              'px-4 py-2.5 font-headline text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer',
              activeTab === 'crate'
                ? 'bg-tetris-purple text-off-white'
                : 'bg-off-white text-off-black hover:bg-light-gray'
            )}
          >
            <Bookmark size={15} className={activeTab === 'crate' ? 'fill-off-white' : ''} />
            <span>שמורים ותיקיות ({savedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={cn(
              'px-4 py-2.5 font-headline text-sm font-bold border-r-3 border-off-black flex items-center gap-2 transition-colors cursor-pointer',
              activeTab === 'showcase'
                ? 'bg-tetris-orange text-off-black'
                : 'bg-off-white text-off-black hover:bg-light-gray'
            )}
          >
            <Sparkles size={15} />
            <span>תערוכת סטודנטים</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-tetris-yellow border border-off-black text-off-black">
              בקרוב / בטא
            </span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PERSONAL CRATE & FOLDERS                                     */}
      {/* =================================================================== */}
      {activeTab === 'crate' && (
        <>
          {/* ===== FOLDER TABS STRIP ===== */}
          <div className="mb-6 p-4 bg-off-white border-3 border-off-black shadow-brutalist-sm">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <span className="font-headline text-sm font-bold text-off-black">
                תיקיות במגירה ({folders.length})
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {visibleItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleShareFolder}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5',
                      'bg-tetris-cyan text-off-black font-headline text-xs font-bold',
                      'border-2 border-off-black shadow-brutalist-xs',
                      'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                      'transition-all duration-150 cursor-pointer'
                    )}
                  >
                    <Share2 size={13} />
                    <span>{activeFolder ? `שתף תיקיית "${activeFolder.name}"` : 'שתף שמורים כקישור'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder((prev) => !prev);
                    setFolderError('');
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5',
                    'bg-tetris-green text-off-black font-headline text-xs font-bold',
                    'border-2 border-off-black shadow-brutalist-xs',
                    'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                    'transition-all duration-150 cursor-pointer'
                  )}
                >
                  <FolderPlus size={14} />
                  <span>+ תיקייה חדשה</span>
                </button>
              </div>
            </div>

            {shareFeedback && (
              <div className="mb-3 px-3 py-2 bg-tetris-yellow border-2 border-off-black text-xs font-headline font-bold text-off-black">
                {shareFeedback}
              </div>
            )}

            {/* Inline New Folder Form */}
            {isCreatingFolder && (
              <form
                onSubmit={handleCreateFolderSubmit}
                className="mb-4 p-3 bg-light-gray border-2 border-off-black flex flex-wrap items-center gap-2"
              >
                <input
                  type="text"
                  value={newFolderName}
                  maxLength={MAX_FOLDER_NAME_LENGTH}
                  onChange={(e) => {
                    setNewFolderName(e.target.value);
                    if (folderError) setFolderError('');
                  }}
                  placeholder="שם התיקייה (למשל: פרויקט גמר, פונטים לכרזה)..."
                  dir="rtl"
                  autoFocus
                  className="flex-1 min-w-[200px] px-3 py-1.5 bg-off-white border-2 border-off-black font-headline text-sm text-off-black outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-tetris-purple text-off-white font-headline text-xs font-bold border-2 border-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                >
                  צור תיקייה
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setFolderError('');
                  }}
                  className="px-3 py-1.5 bg-off-white text-off-black font-headline text-xs border-2 border-off-black cursor-pointer"
                >
                  ביטול
                </button>
                {folderError && (
                  <p className="w-full text-xs font-ibm text-red-700 mt-1">{folderError}</p>
                )}
              </form>
            )}

            {/* Folder Tabs Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:flex-wrap">
              {/* All Saved Tab */}
              <button
                type="button"
                onClick={() => {
                  setSelectedFolderId('all');
                  setIsRenaming(false);
                }}
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-2 shrink-0',
                  'border-2 border-off-black font-headline text-xs md:text-sm font-bold',
                  'transition-all duration-150 cursor-pointer',
                  effectiveFolderId === 'all'
                    ? 'bg-off-black text-off-white shadow-none translate-x-[2px] translate-y-[2px]'
                    : 'bg-light-gray text-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                )}
              >
                <span>כל השמורים</span>
                <span className="px-1.5 py-0.2 text-xs font-jersey border border-current">
                  {folderCounts.all}
                </span>
              </button>

              {/* Custom Folders */}
              {folders.map((folder) => {
                const isSelected = effectiveFolderId === folder.id;
                const activeColorClasses = FOLDER_BG_MAP[folder.color] || 'bg-tetris-purple text-off-white';
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      setSelectedFolderId(folder.id);
                      setIsRenaming(false);
                      setFolderError('');
                    }}
                    className={cn(
                      'inline-flex items-center gap-2 px-3.5 py-2 shrink-0',
                      'border-2 border-off-black font-headline text-xs md:text-sm font-bold',
                      'transition-all duration-150 cursor-pointer',
                      isSelected
                        ? `${activeColorClasses} shadow-none translate-x-[2px] translate-y-[2px]`
                        : 'bg-off-white text-off-black shadow-brutalist-xs hover:bg-light-gray hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                    )}
                  >
                    <TetrisShape type={folder.shape} color={folder.color} size={7} />
                    <span>{folder.name}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 text-xs font-jersey border',
                        isSelected ? 'border-current' : 'border-off-black bg-light-gray'
                      )}
                    >
                      {folderCounts[folder.id] || 0}
                    </span>
                  </button>
                );
              })}

              {/* Unfiled Tab (if any unfiled items exist) */}
              {folderCounts.unfiled > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFolderId('unfiled');
                    setIsRenaming(false);
                  }}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 shrink-0',
                    'border-2 border-off-black font-headline text-xs md:text-sm',
                    'transition-all duration-150 cursor-pointer',
                    effectiveFolderId === 'unfiled'
                      ? 'bg-tetris-yellow text-off-black font-bold shadow-none translate-x-[2px] translate-y-[2px]'
                      : 'bg-light-gray/70 text-dark-gray shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                  )}
                >
                  <span>ללא תיקייה</span>
                  <span className="px-1.5 text-xs font-jersey border border-off-black">
                    {folderCounts.unfiled}
                  </span>
                </button>
              )}
            </div>

            {/* Active Custom Folder Toolbar (Rename / Cycle Block Style / Delete) */}
            {activeFolder && (
              <div className="mt-4 pt-3 border-t-2 border-off-black/15 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TetrisShape type={activeFolder.shape} color={activeFolder.color} size={10} />
                  {!isRenaming ? (
                    <span className="font-headline text-base font-bold text-off-black">
                      תיקייה: {activeFolder.name}
                    </span>
                  ) : (
                    <form onSubmit={handleRenameSubmit} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={renameValue}
                        maxLength={MAX_FOLDER_NAME_LENGTH}
                        onChange={(e) => setRenameValue(e.target.value)}
                        dir="rtl"
                        autoFocus
                        className="px-2 py-1 bg-off-white border-2 border-off-black font-headline text-xs text-off-black outline-none"
                      />
                      <button
                        type="submit"
                        aria-label="שמור שם תיקייה"
                        className="p-1.5 bg-tetris-green border-2 border-off-black cursor-pointer"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRenaming(false)}
                        aria-label="בטל שינוי שם"
                        className="p-1.5 bg-light-gray border-2 border-off-black cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </form>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => cycleFolderStyle(activeFolder.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-light-gray border-2 border-off-black font-headline text-xs text-off-black hover:bg-tetris-yellow transition-colors cursor-pointer"
                  >
                    <Palette size={13} />
                    <span>החלף צבע/צורה</span>
                  </button>
                  {!isRenaming && (
                    <button
                      type="button"
                      onClick={() => {
                        setRenameValue(activeFolder.name);
                        setIsRenaming(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-light-gray border-2 border-off-black font-headline text-xs text-off-black hover:bg-tetris-cyan transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>שנה שם</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteFolder(activeFolder.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-tetris-pink/70 border-2 border-off-black font-headline text-xs font-bold text-off-black hover:bg-tetris-pink transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>מחק תיקייה</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===== SEARCH & VIEW CONTROLS FOR SAVED ITEMS ===== */}
          {savedCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש בתוך השמורים והערות אישיות..."
                  dir="rtl"
                  className="w-full px-3 py-2 ps-3 pe-9 bg-off-white border-2 border-off-black font-headline text-sm text-off-black outline-none focus:shadow-brutalist-xs"
                />
              </div>

              <div className="flex border-2 border-off-black">
                <button
                  type="button"
                  onClick={() => setViewMode('gallery')}
                  className={cn(
                    'p-2 transition-colors cursor-pointer',
                    viewMode === 'gallery'
                      ? 'bg-tetris-purple text-off-white'
                      : 'bg-off-white text-off-black hover:bg-light-gray'
                  )}
                  aria-label="תצוגת גלריה"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 border-r-2 border-off-black transition-colors cursor-pointer',
                    viewMode === 'list'
                      ? 'bg-tetris-purple text-off-white'
                      : 'bg-off-white text-off-black hover:bg-light-gray'
                  )}
                  aria-label="תצוגת רשימה"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ===== SAVED ITEMS GRID OR EMPTY STATE ===== */}
          {visibleItems.length === 0 ? (
            <div className="p-10 md:p-16 bg-off-white border-3 border-off-black shadow-brutalist text-center flex flex-col items-center">
              <TetrisShape
                type={activeFolder?.shape || 'T'}
                color={activeFolder?.color || 'yellow'}
                size={24}
                className="mb-5"
              />
              <h3 className="text-2xl font-bold font-headline text-off-black mb-2">
                {savedCount === 0
                  ? 'המגירה שלך עדיין ריקה'
                  : activeFolder
                    ? `אין עדיין פריטים בתיקייה "${activeFolder.name}"`
                    : 'לא נמצאו פריטים תואמים לחיפוש'}
              </h3>
              <p className="text-sm md:text-base font-ibm text-dark-gray max-w-md mb-6 leading-relaxed">
                {savedCount === 0
                  ? 'לחצו על אייקון הסימנייה בכרטיסים בארגז הכלים, במילון הפונטים, בספרייה, במוזיאון או בטיפים כדי לאסוף אותם לכאן ולמיין לתיקיות.'
                  : 'אפשר לשייך כל פריט שמור לתיקייה זו בלחיצה על תגית התיקייה שעל הכרטיס.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { id: 'toolbox', label: 'לארגז הכלים', bg: 'bg-tetris-purple text-off-white' },
                  { id: 'dictionary', label: 'למילון הפונטים', bg: 'bg-tetris-yellow text-off-black' },
                  { id: 'library', label: 'לספרייה', bg: 'bg-tetris-blue text-off-black' },
                  { id: 'museum', label: 'למוזיאון', bg: 'bg-tetris-orange text-off-black' },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => onBrowseSection?.(btn.id)}
                    className={cn(
                      'px-4 py-2 font-headline text-xs md:text-sm font-bold',
                      btn.bg,
                      'border-2 border-off-black shadow-brutalist-xs',
                      'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                      'transition-all duration-150 cursor-pointer'
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                viewMode === 'gallery'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-3'
              )}
            >
              {visibleItems.map((item) => {
                const secMeta = SECTION_META[item.sectionId] || {
                  label: item.sectionId,
                  bg: 'bg-light-gray',
                  text: 'text-off-black',
                };
                const title = item.snapshot?.titleHe || item.snapshot?.titleEn || 'פריט שמור';
                const subtitle =
                  item.snapshot?.titleEn && item.snapshot?.titleEn !== title
                    ? item.snapshot.titleEn
                    : '';
                const href = item.snapshot?.link
                  ? item.snapshot.link.startsWith('http')
                    ? item.snapshot.link
                    : `https://${item.snapshot.link}`
                  : '';

                return (
                  <article
                    key={item.key}
                    className={cn(
                      'bg-off-white border-3 border-off-black',
                      viewMode === 'gallery'
                        ? 'shadow-brutalist flex flex-col justify-between p-5'
                        : 'shadow-brutalist-xs flex flex-col md:flex-row md:items-center justify-between gap-4 p-4'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Top row: section badge + remove button */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 text-xs font-headline font-bold border border-off-black shadow-brutalist-xs',
                            secMeta.bg,
                            secMeta.text
                          )}
                        >
                          {secMeta.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.sectionId, item.itemId)}
                          aria-label={`הסר את ${title} מהמגירה`}
                          title="הסר מהמגירה"
                          className="p-1.5 bg-light-gray border border-off-black text-dark-gray hover:bg-tetris-pink hover:text-off-black transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Title & Subtitle */}
                      <h3
                        className={cn(
                          'text-xl font-bold text-off-black text-right leading-tight mb-1',
                          isEnglish(title) ? 'font-jersey' : 'font-headline'
                        )}
                      >
                        {title}
                      </h3>
                      {subtitle && (
                        <p className="text-xs font-jersey text-mid-gray mb-2">{subtitle}</p>
                      )}

                      {item.snapshot?.description && (
                        <p className="text-sm font-ibm text-dark-gray leading-relaxed line-clamp-2 mb-3">
                          {item.snapshot.description}
                        </p>
                      )}

                      {/* Original tags */}
                      {item.snapshot?.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {item.snapshot.tags.slice(0, 4).map((tag) => {
                            const bg = getTagColor(tag);
                            return (
                              <span
                                key={`${item.key}-${tag}`}
                                className={cn(
                                  'px-2 py-0.5 text-xs border border-off-black',
                                  isEnglish(tag) ? 'font-jersey' : 'font-headline',
                                  bg,
                                  getTagTextClass(bg)
                                )}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Folder assignment pills */}
                      {folders.length > 0 && (
                        <div className="mb-3 pt-2 border-t border-off-black/15">
                          <span className="block text-[11px] font-headline text-mid-gray mb-1.5">
                            שיוך לתיקיות:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {folders.map((f) => {
                              const active = item.folderIds?.includes(f.id);
                              return (
                                <button
                                  key={`${item.key}-f-${f.id}`}
                                  type="button"
                                  onClick={() =>
                                    toggleItemFolder(item.sectionId, item.itemId, f.id, item.snapshot)
                                  }
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-headline border border-off-black transition-all cursor-pointer',
                                    active
                                      ? 'bg-tetris-yellow font-bold text-off-black'
                                      : 'bg-light-gray/70 text-dark-gray hover:bg-off-white'
                                  )}
                                >
                                  <TetrisShape type={f.shape} color={f.color} size={4} />
                                  <span>{f.name}</span>
                                  {active && <Check size={10} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Personal Sticky Note Input */}
                      <div className="mb-3">
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) =>
                            updateItemNote(item.sectionId, item.itemId, e.target.value)
                          }
                          placeholder="הוסף הערה אישית (למשל: להשתמש להגשה ביום ג׳)..."
                          dir="rtl"
                          className={cn(
                            'w-full px-2.5 py-1.5',
                            'bg-tetris-yellow/20 focus:bg-tetris-yellow/40',
                            'border border-off-black/40 focus:border-off-black',
                            'text-xs font-ibm text-off-black placeholder:text-mid-gray outline-none'
                          )}
                        />
                      </div>
                    </div>

                    {/* Footer actions: External link + Jump to card in section */}
                    <div className="pt-3 border-t-2 border-off-black/10 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onNavigateToItem?.({
                            sectionId: item.sectionId,
                            targetId: makeOriginalTargetId(item.sectionId, item.itemId),
                          })
                        }
                        className={cn(
                          'inline-flex items-center gap-1 px-3 py-1.5',
                          'bg-light-gray text-off-black font-headline text-xs font-bold',
                          'border-2 border-off-black shadow-brutalist-xs',
                          'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                          'transition-all duration-150 cursor-pointer'
                        )}
                      >
                        <span>במדור המקורי</span>
                        <ArrowUpLeft size={13} />
                      </button>

                      {href && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5',
                            'bg-tetris-cyan text-off-black font-headline text-xs font-bold',
                            'border-2 border-off-black shadow-brutalist-xs',
                            'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                            'transition-all duration-150'
                          )}
                        >
                          <span>לאתר</span>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* =================================================================== */}
      {/* TAB 2: PHASE 2 STUDENT WORKS SHOWCASE ("תערוכת סטודנטים")            */}
      {/* =================================================================== */}
      {activeTab === 'showcase' && (
        <div className="animate-tetris-stack">
          {/* Banner explaining Phase 2 + Upload CTA */}
          <div className="mb-8 p-6 bg-tetris-orange/25 border-3 border-off-black shadow-brutalist flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-tetris-yellow border-2 border-off-black text-xs font-headline font-bold mb-2">
                <span>קיר הסטודנטים · תצוגה מקדימה</span>
              </div>
              <h3 className="text-2xl font-bold font-headline text-off-black mb-1">
                תערוכת עבודות סטודנטים ופרויקטים אישיים
              </h3>
              <p className="text-sm font-ibm text-dark-gray max-w-2xl leading-relaxed">
                מקום להציג פרויקטים מקורסי המחלקה (טיפוגרפיה, מיתוג, איור, אינטראקטיב) או עבודות אישיות. הגישו עבודה כדי לשמור אותה במגירה שלכם ולהציג אותה בקיר הסטודנטים.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSubmitWorkOpen((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-3 shrink-0',
                'bg-tetris-purple text-off-white font-headline text-sm font-bold',
                'border-3 border-off-black shadow-brutalist-sm',
                'hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]',
                'transition-all duration-150 cursor-pointer'
              )}
            >
              <Upload size={16} />
              <span>העלאת עבודה חדשה</span>
            </button>
          </div>

          {workFormSuccess && (
            <div className="mb-6 p-3 px-4 bg-tetris-green border-3 border-off-black shadow-brutalist-sm font-headline text-sm font-bold text-off-black">
              {workFormSuccess}
            </div>
          )}

          {/* Student Work Submission Form */}
          {isSubmitWorkOpen && (
            <form
              onSubmit={handleWorkSubmit}
              className="mb-8 p-6 bg-off-white border-3 border-off-black shadow-brutalist"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-off-black">
                <h4 className="text-xl font-bold font-headline text-off-black">
                  הגשת עבודת סטודנט/ית לתערוכה
                </h4>
                <button
                  type="button"
                  onClick={() => setIsSubmitWorkOpen(false)}
                  className="p-1 text-dark-gray hover:text-off-black cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-headline text-xs font-bold text-off-black mb-1">
                    שם הפרויקט / העבודה *
                  </label>
                  <input
                    type="text"
                    value={workForm.title}
                    onChange={(e) => setWorkForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="למשל: עיצוב פונט רשת תלת-ממדי"
                    dir="rtl"
                    className="w-full px-3 py-2 bg-light-gray border-2 border-off-black font-headline text-sm outline-none focus:bg-off-white"
                  />
                </div>
                <div>
                  <label className="block font-headline text-xs font-bold text-off-black mb-1">
                    שם הסטודנט/ית *
                  </label>
                  <input
                    type="text"
                    value={workForm.studentName}
                    onChange={(e) => setWorkForm((p) => ({ ...p, studentName: e.target.value }))}
                    placeholder="שם מלא"
                    dir="rtl"
                    className="w-full px-3 py-2 bg-light-gray border-2 border-off-black font-headline text-sm outline-none focus:bg-off-white"
                  />
                </div>
                <div>
                  <label className="block font-headline text-xs font-bold text-off-black mb-1">
                    קורס / תחום
                  </label>
                  <select
                    value={workForm.course}
                    onChange={(e) => setWorkForm((p) => ({ ...p, course: e.target.value }))}
                    className="w-full px-3 py-2 bg-light-gray border-2 border-off-black font-headline text-sm outline-none cursor-pointer"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-headline text-xs font-bold text-off-black mb-1">
                    שנת לימודים
                  </label>
                  <select
                    value={workForm.studyYear}
                    onChange={(e) => setWorkForm((p) => ({ ...p, studyYear: e.target.value }))}
                    className="w-full px-3 py-2 bg-light-gray border-2 border-off-black font-headline text-sm outline-none cursor-pointer"
                  >
                    {STUDY_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-headline text-xs font-bold text-off-black mb-1">
                    קישור לפרויקט (Behance / Figma / Instagram)
                  </label>
                  <input
                    type="url"
                    value={workForm.projectUrl}
                    onChange={(e) => setWorkForm((p) => ({ ...p, projectUrl: e.target.value }))}
                    placeholder="https://..."
                    dir="ltr"
                    className="w-full px-3 py-2 bg-light-gray border-2 border-off-black font-jersey text-sm outline-none focus:bg-off-white"
                  />
                </div>
                <div>
                  <label className="block font-headline text-xs font-bold text-off-black mb-1">
                    קישור לתמונה מציגה (אופציונלי)
                  </label>
                  <input
                    type="url"
                    value={workForm.imageUrl}
                    onChange={(e) => setWorkForm((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    dir="ltr"
                    className="w-full px-3 py-2 bg-light-gray border-2 border-off-black font-jersey text-sm outline-none focus:bg-off-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-headline text-xs font-bold text-off-black mb-1">
                  תיאור קצר על העבודה והתהליך
                </label>
                <textarea
                  rows={3}
                  value={workForm.description}
                  onChange={(e) => setWorkForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="ספרו בקצרה על הבריף, הכלים או הפונטים שבהם השתמשתם..."
                  dir="rtl"
                  className="w-full px-3 py-2 bg-light-gray border-2 border-off-black font-ibm text-sm outline-none focus:bg-off-white"
                />
              </div>

              {workFormError && (
                <p className="text-xs font-ibm text-red-700 mb-3">{workFormError}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitWorkOpen(false)}
                  className="px-4 py-2 bg-light-gray border-2 border-off-black font-headline text-xs font-bold cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-tetris-green border-2 border-off-black shadow-brutalist-xs font-headline text-xs font-bold cursor-pointer"
                >
                  שמור והצג בתערוכה
                </button>
              </div>
            </form>
          )}

          {/* Course Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['הכל', ...COURSES].map((course) => (
              <button
                key={course}
                type="button"
                onClick={() => setCourseFilter(course)}
                className={cn(
                  'px-3 py-1.5 font-headline text-xs font-bold border-2 border-off-black transition-all cursor-pointer',
                  courseFilter === course
                    ? 'bg-tetris-purple text-off-white shadow-none translate-x-[2px] translate-y-[2px]'
                    : 'bg-off-white text-off-black shadow-brutalist-xs hover:bg-light-gray'
                )}
              >
                {course}
              </button>
            ))}
          </div>

          {/* Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allShowcaseWorks.map((work) => (
              <article
                key={work.id}
                className="bg-off-white border-3 border-off-black shadow-brutalist flex flex-col overflow-hidden"
              >
                <div className="h-44 border-b-3 border-off-black bg-light-gray relative flex items-center justify-center overflow-hidden">
                  {work.imageUrl ? (
                    <img
                      src={work.imageUrl}
                      alt={work.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <TetrisShape type={work.shape || 'T'} color={work.color || 'purple'} size={28} />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <span className="px-2 py-0.5 bg-tetris-yellow border-2 border-off-black font-headline text-xs font-bold text-off-black">
                      {work.course}
                    </span>
                    <span className="px-2 py-0.5 bg-off-white border-2 border-off-black font-headline text-xs text-off-black">
                      {work.studyYear}
                    </span>
                  </div>
                  {work.isPersonal && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-tetris-green border border-off-black font-headline text-[11px] font-bold text-off-black">
                      העבודה שלי
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="text-xl font-bold font-headline text-off-black mb-1">
                    {work.title}
                  </h4>
                  <p className="text-xs font-headline text-tetris-purple font-bold mb-3">
                    מאת: {work.studentName}
                  </p>
                  {work.description && (
                    <p className="text-sm font-ibm text-dark-gray leading-relaxed mb-4 flex-1">
                      {work.description}
                    </p>
                  )}

                  {work.projectUrl && (
                    <div className="pt-3 border-t-2 border-off-black/10 flex justify-end">
                      <a
                        href={work.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tetris-cyan border-2 border-off-black shadow-brutalist-xs font-headline text-xs font-bold text-off-black hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        <span>לצפייה בפרויקט</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PersonalSection;
