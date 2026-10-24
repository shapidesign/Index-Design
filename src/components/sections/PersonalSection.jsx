import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import useSavedItems, {
  MAX_FOLDER_NAME_LENGTH,
  TETRIS_SHAPES,
  TETRIS_COLORS,
  encodeSharedFolder,
  decodeSharedFolder,
} from '@/hooks/useSavedItems';
import TetrisShape from '@/components/tetris/TetrisShape';
import GoogleEmailAuthPanel from '@/components/ui/GoogleEmailAuthPanel';
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
  LayoutGrid,
  List,
  Search,
  User,
  LogOut,
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

const COLOR_SWATCH_MAP = {
  purple: { bg: 'bg-tetris-purple', label: 'סגול' },
  orange: { bg: 'bg-tetris-orange', label: 'כתום' },
  blue: { bg: 'bg-tetris-blue', label: 'כחול' },
  yellow: { bg: 'bg-tetris-yellow', label: 'צהוב' },
  cyan: { bg: 'bg-tetris-cyan', label: 'תכלת' },
  green: { bg: 'bg-tetris-green', label: 'ירוק' },
  pink: { bg: 'bg-tetris-pink', label: 'ורוד' },
};

const makeOriginalTargetId = (sectionId, itemId) =>
  `search-item-${sectionId}-${String(itemId || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

/**
 * Shape & Color Mix-and-Match Picker for Folder Creation / Customization
 */
const FolderStylePicker = ({ selectedShape, selectedColor, onSelectShape, onSelectColor }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
    {/* Shape Picker */}
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-headline text-xs font-bold text-off-black shrink-0">צורת טטריס:</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {TETRIS_SHAPES.map((shape) => {
          const isSelected = selectedShape === shape;
          return (
            <button
              key={shape}
              type="button"
              onClick={() => onSelectShape(shape)}
              aria-label={`בחר צורת ${shape}`}
              title={`צורת ${shape}`}
              className={cn(
                'w-9 h-9 flex items-center justify-center border-2 border-off-black transition-all cursor-pointer',
                isSelected
                  ? 'bg-tetris-yellow shadow-none translate-x-[1px] translate-y-[1px] ring-2 ring-off-black'
                  : 'bg-off-white shadow-brutalist-xs hover:bg-light-gray'
              )}
            >
              <TetrisShape type={shape} color={selectedColor} size={5} />
            </button>
          );
        })}
      </div>
    </div>

    {/* Color Picker */}
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-headline text-xs font-bold text-off-black shrink-0">צבע תיקייה:</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {TETRIS_COLORS.map((color) => {
          const isSelected = selectedColor === color;
          const swatch = COLOR_SWATCH_MAP[color];
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              aria-label={`בחר צבע ${swatch.label}`}
              title={swatch.label}
              className={cn(
                'w-7 h-7 border-2 border-off-black flex items-center justify-center transition-all cursor-pointer',
                swatch.bg,
                isSelected
                  ? 'ring-2 ring-off-black scale-110 shadow-none'
                  : 'opacity-80 hover:opacity-100 shadow-brutalist-xs'
              )}
            >
              {isSelected && (
                <Check
                  size={13}
                  className={color === 'purple' ? 'text-off-white' : 'text-off-black'}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

/**
 * PersonalNoteForm - Explicit note input + Submit button with saved confirmation
 */
const PersonalNoteForm = ({ item, onSaveNote }) => {
  const [draft, setDraft] = useState(item.note || '');
  const [lastSyncedNote, setLastSyncedNote] = useState(item.note || '');
  const [justSaved, setJustSaved] = useState(false);

  if ((item.note || '') !== lastSyncedNote) {
    setLastSyncedNote(item.note || '');
    setDraft(item.note || '');
  }

  const isDirty = draft.trim() !== (item.note || '').trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveNote(item.sectionId, item.itemId, draft.trim());
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2200);
  };

  return (
    <div className="mb-3 pt-2 border-t border-off-black/15">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-headline font-bold text-dark-gray">
          הערה אישית:
        </span>
        {justSaved && (
          <span className="text-[11px] font-headline font-bold text-off-black bg-tetris-green px-1.5 py-0.2 border border-off-black">
            ההערה נשמרה ✓
          </span>
        )}
      </div>

      {item.note && !isDirty && (
        <p className="text-xs font-ibm text-off-black bg-tetris-yellow/35 border border-off-black px-2.5 py-1.5 mb-2">
          {item.note}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="הוסף הערה אישית (למשל: להשתמש להגשה ביום ג׳)..."
          dir="rtl"
          className={cn(
            'flex-1 min-w-0 h-9 px-2.5',
            'bg-off-white focus:bg-tetris-yellow/20',
            'border-2 border-off-black',
            'text-xs font-ibm text-off-black placeholder:text-mid-gray outline-none'
          )}
        />
        <button
          type="submit"
          className={cn(
            'h-9 px-3 shrink-0 inline-flex items-center justify-center',
            'font-headline text-xs font-bold border-2 border-off-black transition-all cursor-pointer',
            justSaved
              ? 'bg-tetris-green text-off-black'
              : isDirty
                ? 'bg-tetris-purple text-off-white shadow-brutalist-xs hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]'
                : 'bg-tetris-yellow text-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]'
          )}
        >
          {justSaved ? 'נשמר ✓' : 'שמור הערה'}
        </button>
      </form>
    </div>
  );
};

const PersonalSection = ({ onNavigateToItem, onBrowseSection }) => {
  const {
    folders,
    savedItemsList,
    savedCount,
    submissions,
    userProfile,
    undoState,
    handleUndo,
    dismissUndo,
    removeItem,
    toggleItemFolder,
    updateItemNote,
    createFolder,
    renameFolder,
    updateFolderStyle,
    deleteFolder,
    importSharedFolder,
    signOutProfile,
    cloudSyncing,
  } = useSavedItems();

  const [selectedFolderId, setSelectedFolderId] = useState('all'); // 'all' | 'unfiled' | folder.id
  const [viewMode, setViewMode] = useState('gallery');
  const [searchQuery, setSearchQuery] = useState('');

  // Folder creation & editing state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderShape, setNewFolderShape] = useState('T');
  const [newFolderColor, setNewFolderColor] = useState('purple');
  const [folderError, setFolderError] = useState('');

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isCustomizingStyle, setIsCustomizingStyle] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [importBanner, setImportBanner] = useState('');

  // Google / Verified Email Profile Drawer state
  const [isGoogleSignInOpen, setIsGoogleSignInOpen] = useState(false);

  // Check if URL contains a shared folder payload (?import=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('import');
    if (!encoded) return undefined;

    const decoded = decodeSharedFolder(encoded);
    if (!decoded) return undefined;

    const timer = window.setTimeout(() => {
      const folderId = importSharedFolder(decoded);
      if (folderId) {
        setSelectedFolderId(folderId);
        setImportBanner(`התיקייה "${decoded.name}" יובאה בהצלחה למגירה שלך!`);
        window.history.replaceState(null, '', '/saved');
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
    const res = createFolder(newFolderName, {
      shape: newFolderShape,
      color: newFolderColor,
    });
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

  const handleDeleteActiveFolder = () => {
    if (!activeFolder) return;
    const folderIdToDelete = activeFolder.id;
    setSelectedFolderId('all');
    setIsRenaming(false);
    setIsCustomizingStyle(false);
    deleteFolder(folderIdToDelete);
  };

  const handleShareFolder = async () => {
    const folderToShare = activeFolder || {
      name: 'המומלצים שלי באינדקס',
      color: 'purple',
      shape: 'T',
    };
    const encoded = encodeSharedFolder(folderToShare, visibleItems);
    if (!encoded) return;
    const shareUrl = `${window.location.origin}/saved?import=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback('קישור לתיקייה הועתק ללוח!');
    } catch {
      setShareFeedback(shareUrl);
    }
    window.setTimeout(() => setShareFeedback(''), 3500);
  };

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

      {/* ===== PROFILE CARD & HEADER ===== */}
      <div className="mb-8 p-5 md:p-6 bg-off-white border-3 border-off-black shadow-brutalist flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-tetris-pink border-3 border-off-black shadow-brutalist-xs flex items-center justify-center shrink-0 text-2xl font-bold font-headline text-off-black">
            {userProfile?.name ? userProfile.name.charAt(0) : <User size={26} />}
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-tetris-yellow border-2 border-off-black text-xs font-headline font-bold mb-1.5">
              <Bookmark size={12} className="fill-off-black" />
              <span>אזור אישי · המגירה שלי</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-off-black font-headline leading-tight">
              {userProfile ? `המגירה של ${userProfile.name}` : 'המגירה שלי'}
            </h2>
            <p className="text-sm text-dark-gray font-ibm mt-1">
              {userProfile
                ? `${userProfile.email} · ${userProfile.studyYear} · חשבון מאומת בענן${cloudSyncing ? ' (מסנכרן...)' : ' ✓'}`
                : 'שמרו כלים, פונטים, ספרים והשראות בתיקיות אישיות. התחברו ואמתו את המייל עם Google כדי לשמור את המגירה שלכם בענן מכל מכשיר.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {userProfile ? (
            <>
              <button
                type="button"
                onClick={() => onBrowseSection?.('museum')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-tetris-orange text-off-black font-headline text-xs md:text-sm font-bold border-2 border-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
              >
                <Sparkles size={15} />
                <span>העלאת עבודה למוזיאון ({submissions.filter((s) => s.userId === userProfile.id).length})</span>
              </button>
              <button
                type="button"
                onClick={signOutProfile}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-light-gray text-off-black font-headline text-xs border-2 border-off-black hover:bg-tetris-pink transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>התנתק</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsGoogleSignInOpen((p) => !p)}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-off-white text-off-black font-headline text-xs md:text-sm font-bold border-3 border-off-black shadow-brutalist-sm hover:bg-tetris-yellow hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>התחבר עם Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Verified Google / Email Sign-In Panel */}
      {isGoogleSignInOpen && !userProfile && (
        <div className="mb-8">
          <GoogleEmailAuthPanel
            title="התחברות עם Google / אימות אימייל אישי"
            onSuccess={() => setIsGoogleSignInOpen(false)}
            onClose={() => setIsGoogleSignInOpen(false)}
          />
        </div>
      )}

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

        {/* Inline New Folder Form with Mix-and-Match Tetris Shape + Color Picker */}
        {isCreatingFolder && (
          <form
            onSubmit={handleCreateFolderSubmit}
            className="mb-4 p-4 bg-light-gray border-2 border-off-black flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-11 h-11 bg-off-white border-2 border-off-black flex items-center justify-center shrink-0">
                <TetrisShape type={newFolderShape} color={newFolderColor} size={6} />
              </div>
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
                className="flex-1 min-w-[200px] h-11 px-3 bg-off-white border-2 border-off-black font-headline text-sm text-off-black outline-none"
              />
              <button
                type="submit"
                className="h-11 px-4 bg-tetris-purple text-off-white font-headline text-xs font-bold border-2 border-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer inline-flex items-center justify-center"
              >
                צור תיקייה
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setFolderError('');
                }}
                className="h-11 px-3 bg-off-white text-off-black font-headline text-xs border-2 border-off-black cursor-pointer inline-flex items-center justify-center"
              >
                ביטול
              </button>
            </div>

            <FolderStylePicker
              selectedShape={newFolderShape}
              selectedColor={newFolderColor}
              onSelectShape={setNewFolderShape}
              onSelectColor={setNewFolderColor}
            />

            {folderError && (
              <p className="w-full text-xs font-ibm text-red-700 mt-1">{folderError}</p>
            )}
          </form>
        )}

        {/* Folder Tabs Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* All Saved Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedFolderId('all');
              setIsRenaming(false);
              setIsCustomizingStyle(false);
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
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (effectiveFolderId === folder.id) {
                      setSelectedFolderId('all');
                      setIsRenaming(false);
                      setIsCustomizingStyle(false);
                    }
                    deleteFolder(folder.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      if (effectiveFolderId === folder.id) {
                        setSelectedFolderId('all');
                      }
                      deleteFolder(folder.id);
                    }
                  }}
                  aria-label={`מחק תיקיית ${folder.name}`}
                  title={`מחק תיקיית "${folder.name}"`}
                  className="p-0.5 hover:bg-tetris-pink hover:text-off-black transition-colors"
                >
                  <X size={13} />
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
                setIsCustomizingStyle(false);
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

        {/* Active Custom Folder Toolbar (Rename / Mix & Match Shape & Color / Delete) */}
        {activeFolder && (
          <div className="mt-4 pt-3 border-t-2 border-off-black/15">
            <div className="flex flex-wrap items-center justify-between gap-3">
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
                      className="h-9 px-2.5 bg-off-white border-2 border-off-black font-headline text-xs text-off-black outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="שמור שם תיקייה"
                      className="h-9 w-9 inline-flex items-center justify-center bg-tetris-green border-2 border-off-black cursor-pointer"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRenaming(false)}
                      aria-label="בטל שינוי שם"
                      className="h-9 w-9 inline-flex items-center justify-center bg-light-gray border-2 border-off-black cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </form>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsCustomizingStyle((prev) => !prev)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 border-2 border-off-black font-headline text-xs text-off-black transition-colors cursor-pointer',
                    isCustomizingStyle ? 'bg-tetris-yellow font-bold' : 'bg-light-gray hover:bg-tetris-yellow'
                  )}
                >
                  <Palette size={13} />
                  <span>בחירת צורה וצבע</span>
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
                  onClick={handleDeleteActiveFolder}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-tetris-pink/70 border-2 border-off-black font-headline text-xs font-bold text-off-black hover:bg-tetris-pink transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>מחק תיקייה</span>
                </button>
              </div>
            </div>

            {isCustomizingStyle && (
              <div className="mt-3 p-3 bg-light-gray border-2 border-off-black">
                <FolderStylePicker
                  selectedShape={activeFolder.shape}
                  selectedColor={activeFolder.color}
                  onSelectShape={(shape) =>
                    updateFolderStyle(activeFolder.id, { shape, color: activeFolder.color })
                  }
                  onSelectColor={(color) =>
                    updateFolderStyle(activeFolder.id, { shape: activeFolder.shape, color })
                  }
                />
              </div>
            )}
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
              className="w-full h-11 px-3 ps-3 pe-9 bg-off-white border-2 border-off-black font-headline text-sm text-off-black outline-none focus:shadow-brutalist-xs"
            />
          </div>

          <div className="flex border-2 border-off-black h-11">
            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              className={cn(
                'px-3 h-full inline-flex items-center justify-center transition-colors cursor-pointer',
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
                'px-3 h-full inline-flex items-center justify-center border-r-2 border-off-black transition-colors cursor-pointer',
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
              { id: 'museum', label: 'למוזיאון עבודות סטודנטים', bg: 'bg-tetris-orange text-off-black' },
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

                  {/* Personal Sticky Note Form with Explicit Submit Button */}
                  <PersonalNoteForm item={item} onSaveNote={updateItemNote} />
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
    </section>
  );
};

export default PersonalSection;
