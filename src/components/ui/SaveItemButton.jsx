import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Bookmark, Check, FolderPlus, Trash2, X } from 'lucide-react';
import useSavedItems, { MAX_FOLDER_NAME_LENGTH } from '@/hooks/useSavedItems';
import TetrisShape from '@/components/tetris/TetrisShape';

/**
 * SaveItemButton - כפתור שמירה למגירה האישית + שיוך לתיקיות
 * Renders a Neo-Brutalist bookmark toggle button on any card.
 * Clicking saves immediately (<0.1s feedback) and opens a compact folder picker popover.
 */
const SaveItemButton = ({
  sectionId,
  itemId,
  snapshot = {},
  size = 'md',
  className,
  showLabel = false,
}) => {
  const {
    folders,
    isItemSaved,
    getSavedItem,
    saveItem,
    removeItem,
    toggleItemFolder,
    createFolder,
  } = useSavedItems();

  const [open, setOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState('');
  const [popoverCoords, setPopoverCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const popoverRef = useRef(null);

  const saved = isItemSaved(sectionId, itemId);
  const savedRecord = getSavedItem(sectionId, itemId);
  const assignedFolderIds = savedRecord?.folderIds || [];

  const updateCoords = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const popoverWidth = 256;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = rect.left;
    if (left + popoverWidth > viewportW - 12) {
      left = Math.max(12, viewportW - popoverWidth - 12);
    }
    if (left < 12) left = 12;

    let top = rect.bottom + 8;
    if (top + 280 > viewportH && rect.top > 280) {
      top = rect.top - 260;
    }

    setPopoverCoords({ top, left });
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
        setFolderError('');
      }
    };

    const handleScrollOrResize = () => updateCoords();

    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open]);

  const stopCardEvent = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMainClick = (e) => {
    stopCardEvent(e);
    if (!saved) {
      saveItem(sectionId, itemId, snapshot);
      updateCoords();
      setOpen(true);
    } else {
      const nextOpen = !open;
      if (nextOpen) updateCoords();
      setOpen(nextOpen);
    }
  };

  const handleToggleFolder = (e, folderId) => {
    stopCardEvent(e);
    toggleItemFolder(sectionId, itemId, folderId, snapshot);
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newFolderName.trim()) {
      setFolderError('הזינו שם לתיקייה');
      return;
    }
    const res = createFolder(newFolderName);
    if (!res.ok) {
      setFolderError(res.error || 'שגיאה ביצירת תיקייה');
      return;
    }
    if (res.folder) {
      toggleItemFolder(sectionId, itemId, res.folder.id, snapshot);
    }
    setNewFolderName('');
    setFolderError('');
  };

  const handleRemove = (e) => {
    stopCardEvent(e);
    removeItem(sectionId, itemId);
    setOpen(false);
  };

  const sizeClasses =
    size === 'sm'
      ? 'p-1.5 text-xs'
      : 'p-2 text-xs';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleMainClick}
        aria-label={saved ? 'נשמר במגירה - ערוך תיקיות' : 'שמור למגירה האישית'}
        aria-expanded={open}
        title={saved ? 'נשמר במגירה (לחצו לשיוך לתיקייה)' : 'שמור למגירה האישית'}
        className={cn(
          'inline-flex items-center justify-center gap-1.5',
          sizeClasses,
          'border-2 border-off-black',
          'font-headline font-bold',
          'transition-all duration-150 cursor-pointer select-none',
          saved
            ? 'bg-tetris-yellow text-off-black shadow-none translate-x-[1px] translate-y-[1px]'
            : 'bg-off-white text-off-black shadow-brutalist-xs hover:bg-tetris-yellow/60 hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]',
          className
        )}
      >
        <Bookmark
          size={size === 'sm' ? 14 : 16}
          className={cn('shrink-0 transition-transform', saved && 'fill-off-black scale-110')}
        />
        {showLabel && (
          <span>{saved ? 'במגירה' : 'שמור'}</span>
        )}
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            dir="rtl"
            onClick={stopCardEvent}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              width: '256px',
              zIndex: 9999,
            }}
            className={cn(
              'bg-off-white',
              'border-3 border-off-black',
              'shadow-brutalist',
              'p-3',
              'animate-tetris-stack text-right'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b-2 border-off-black">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-tetris-green border border-off-black" />
                <span className="font-headline text-xs font-bold text-off-black">
                  נשמר במגירה! שייך לתיקייה:
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  stopCardEvent(e);
                  setOpen(false);
                }}
                aria-label="סגור חלונית תיקיות"
                className="p-0.5 text-dark-gray hover:text-off-black cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Folders checklist */}
            <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5 mb-2.5">
              {folders.length === 0 ? (
                <p className="text-xs font-ibm text-mid-gray py-1">
                  עדיין אין תיקיות. צרו תיקייה חדשה למטה:
                </p>
              ) : (
                folders.map((folder) => {
                  const isAssigned = assignedFolderIds.includes(folder.id);
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={(e) => handleToggleFolder(e, folder.id)}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 px-2.5 py-1.5',
                        'border-2 border-off-black text-right',
                        'font-headline text-xs transition-all duration-150 cursor-pointer',
                        isAssigned
                          ? 'bg-tetris-yellow font-bold text-off-black'
                          : 'bg-light-gray text-off-black hover:bg-off-white'
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <TetrisShape type={folder.shape} color={folder.color} size={6} />
                        <span className="truncate">{folder.name}</span>
                      </span>
                      <span
                        className={cn(
                          'w-4 h-4 flex items-center justify-center border border-off-black shrink-0',
                          isAssigned ? 'bg-off-black text-off-white' : 'bg-off-white'
                        )}
                      >
                        {isAssigned && <Check size={11} />}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick new folder form */}
            <form onSubmit={handleCreateFolder} className="mb-2">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newFolderName}
                  maxLength={MAX_FOLDER_NAME_LENGTH}
                  onChange={(e) => {
                    setNewFolderName(e.target.value);
                    if (folderError) setFolderError('');
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="תיקייה חדשה..."
                  dir="rtl"
                  className={cn(
                    'flex-1 min-w-0 px-2 py-1',
                    'bg-off-white border-2 border-off-black',
                    'text-xs font-headline text-off-black text-right',
                    'outline-none focus:bg-tetris-yellow/20'
                  )}
                />
                <button
                  type="submit"
                  aria-label="צור תיקייה"
                  className={cn(
                    'px-2 py-1 shrink-0',
                    'bg-tetris-purple text-off-white',
                    'border-2 border-off-black',
                    'font-headline text-xs font-bold',
                    'hover:bg-tetris-orange hover:text-off-black transition-colors cursor-pointer'
                  )}
                >
                  <FolderPlus size={14} />
                </button>
              </div>
              {folderError && (
                <p className="text-[11px] font-ibm text-red-700 mt-1">{folderError}</p>
              )}
            </form>

            {/* Remove from saved */}
            <div className="pt-2 border-t-2 border-off-black/15 flex justify-between items-center">
              <button
                type="button"
                onClick={handleRemove}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1',
                  'text-[11px] font-headline font-bold text-off-black',
                  'bg-tetris-pink/70 hover:bg-tetris-pink border border-off-black',
                  'transition-colors cursor-pointer'
                )}
              >
                <Trash2 size={12} />
                <span>הסר מהמגירה</span>
              </button>
              <span className="text-[11px] font-ibm text-mid-gray">
                {assignedFolderIds.length > 0
                  ? `ב-${assignedFolderIds.length} תיקיות`
                  : 'ב"כל השמורים"'}
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default SaveItemButton;
