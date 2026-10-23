import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'index-personal-crate-v1';

export const TETRIS_SHAPES = ['T', 'L', 'I', 'Z', 'J', 'O', 'S'];
export const TETRIS_COLORS = ['purple', 'orange', 'blue', 'yellow', 'cyan', 'green', 'pink'];
export const MAX_FOLDER_NAME_LENGTH = 24;

// ponytail: localStorage stores lightweight snapshots + folder IDs so saved cards render instantly without waiting for all 4 Notion APIs
const defaultFolders = [
  { id: 'f-typo', name: 'טיפוגרפיה', color: 'purple', shape: 'T', createdAt: 1760000000000 },
  { id: 'f-inspo', name: 'השראה להגשה', color: 'orange', shape: 'L', createdAt: 1760000001000 },
];

const emptyCrate = () => ({
  version: 1,
  folders: defaultFolders,
  items: {},
  submissions: [],
});

export const makeSavedKey = (sectionId, itemId) =>
  `${String(sectionId || 'item')}:${String(itemId || '')}`;

export const sanitizeCrate = (raw) => {
  if (!raw || typeof raw !== 'object') return emptyCrate();
  const folders = Array.isArray(raw.folders)
    ? raw.folders
        .filter((f) => f && typeof f.id === 'string' && f.id.trim() && typeof f.name === 'string' && f.name.trim())
        .map((f, idx) => ({
          id: f.id,
          name: f.name.trim().slice(0, MAX_FOLDER_NAME_LENGTH),
          color: TETRIS_COLORS.includes(f.color) ? f.color : TETRIS_COLORS[idx % TETRIS_COLORS.length],
          shape: TETRIS_SHAPES.includes(f.shape) ? f.shape : TETRIS_SHAPES[idx % TETRIS_SHAPES.length],
          createdAt: Number(f.createdAt) || Date.now(),
        }))
    : defaultFolders;

  const validFolderIds = new Set(folders.map((f) => f.id));
  const items = {};
  if (raw.items && typeof raw.items === 'object') {
    for (const val of Object.values(raw.items)) {
      if (!val || typeof val !== 'object' || !val.sectionId || !val.itemId) continue;
      const key = makeSavedKey(val.sectionId, val.itemId);
      const folderIds = Array.isArray(val.folderIds)
        ? val.folderIds.filter((fid) => validFolderIds.has(fid))
        : [];
      items[key] = {
        key,
        sectionId: String(val.sectionId),
        itemId: String(val.itemId),
        folderIds,
        note: typeof val.note === 'string' ? val.note.slice(0, 140) : '',
        savedAt: Number(val.savedAt) || Date.now(),
        snapshot: {
          titleHe: String(val.snapshot?.titleHe || ''),
          titleEn: String(val.snapshot?.titleEn || ''),
          description: String(val.snapshot?.description || ''),
          link: String(val.snapshot?.link || ''),
          image: String(val.snapshot?.image || ''),
          tags: Array.isArray(val.snapshot?.tags) ? val.snapshot.tags.slice(0, 6).map(String) : [],
          badge: String(val.snapshot?.badge || ''),
        },
      };
    }
  }

  const submissions = Array.isArray(raw.submissions)
    ? raw.submissions.filter((s) => s && typeof s === 'object' && s.title)
    : [];

  return {
    version: 1,
    folders,
    items,
    submissions,
  };
};

/** Encode a folder + its items into a URL-safe base64 payload for sharing */
export const encodeSharedFolder = (folder, folderItems) => {
  try {
    const payload = {
      v: 1,
      f: {
        n: (folder?.name || 'תיקייה משותפת').slice(0, MAX_FOLDER_NAME_LENGTH),
        c: folder?.color || 'purple',
        s: folder?.shape || 'T',
      },
      i: (folderItems || []).slice(0, 50).map((item) => ({
        sec: item.sectionId,
        id: item.itemId,
        nt: item.note || '',
        sn: {
          th: item.snapshot?.titleHe || '',
          te: item.snapshot?.titleEn || '',
          d: (item.snapshot?.description || '').slice(0, 140),
          l: item.snapshot?.link || '',
          im: item.snapshot?.image || '',
          tg: (item.snapshot?.tags || []).slice(0, 4),
          b: item.snapshot?.badge || '',
        },
      })),
    };
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
};

export const decodeSharedFolder = (encoded) => {
  try {
    if (!encoded || typeof encoded !== 'string') return null;
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || !parsed.f || !Array.isArray(parsed.i)) return null;
    return {
      name: String(parsed.f.n || 'תיקייה משותפת').trim().slice(0, MAX_FOLDER_NAME_LENGTH),
      color: TETRIS_COLORS.includes(parsed.f.c) ? parsed.f.c : 'purple',
      shape: TETRIS_SHAPES.includes(parsed.f.s) ? parsed.f.s : 'T',
      items: parsed.i
        .filter((it) => it && it.sec && it.id)
        .map((it) => ({
          sectionId: String(it.sec),
          itemId: String(it.id),
          note: String(it.nt || '').slice(0, 140),
          snapshot: {
            titleHe: String(it.sn?.th || ''),
            titleEn: String(it.sn?.te || ''),
            description: String(it.sn?.d || ''),
            link: String(it.sn?.l || ''),
            image: String(it.sn?.im || ''),
            tags: Array.isArray(it.sn?.tg) ? it.sn.tg.map(String) : [],
            badge: String(it.sn?.b || ''),
          },
        })),
    };
  } catch {
    return null;
  }
};

const SavedItemsContext = createContext(null);

export const SavedItemsProvider = ({ children }) => {
  const [crate, setCrate] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? sanitizeCrate(JSON.parse(saved)) : emptyCrate();
    } catch {
      return emptyCrate();
    }
  });

  const [undoState, setUndoState] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(crate));
    } catch {
      /* localStorage unavailable or quota exceeded */
    }
  }, [crate]);

  useEffect(() => {
    if (!undoState) return undefined;
    const timer = window.setTimeout(() => {
      setUndoState(null);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [undoState]);

  const triggerUndoToast = useCallback((label, previousCrate) => {
    setUndoState({ label, previousCrate, ts: Date.now() });
  }, []);

  const handleUndo = useCallback(() => {
    if (!undoState?.previousCrate) return;
    setCrate(undoState.previousCrate);
    setUndoState(null);
  }, [undoState]);

  const dismissUndo = useCallback(() => {
    setUndoState(null);
  }, []);

  const isItemSaved = useCallback(
    (sectionId, itemId) => Boolean(crate.items[makeSavedKey(sectionId, itemId)]),
    [crate.items]
  );

  const getSavedItem = useCallback(
    (sectionId, itemId) => crate.items[makeSavedKey(sectionId, itemId)] || null,
    [crate.items]
  );

  const saveItem = useCallback((sectionId, itemId, snapshot = {}, initialFolderId = null) => {
    const key = makeSavedKey(sectionId, itemId);
    setCrate((prev) => {
      const existing = prev.items[key];
      const folderIds = existing ? [...existing.folderIds] : [];
      if (initialFolderId && !folderIds.includes(initialFolderId)) {
        folderIds.push(initialFolderId);
      }
      return {
        ...prev,
        items: {
          ...prev.items,
          [key]: {
            key,
            sectionId: String(sectionId),
            itemId: String(itemId),
            folderIds,
            note: existing?.note || '',
            savedAt: existing?.savedAt || Date.now(),
            snapshot: {
              titleHe: String(snapshot.titleHe ?? existing?.snapshot?.titleHe ?? ''),
              titleEn: String(snapshot.titleEn ?? existing?.snapshot?.titleEn ?? ''),
              description: String(snapshot.description ?? existing?.snapshot?.description ?? ''),
              link: String(snapshot.link ?? existing?.snapshot?.link ?? ''),
              image: String(snapshot.image ?? existing?.snapshot?.image ?? ''),
              tags: Array.isArray(snapshot.tags)
                ? snapshot.tags.slice(0, 6).map(String)
                : existing?.snapshot?.tags || [],
              badge: String(snapshot.badge ?? existing?.snapshot?.badge ?? ''),
            },
          },
        },
      };
    });
  }, []);

  const removeItem = useCallback(
    (sectionId, itemId) => {
      const key = makeSavedKey(sectionId, itemId);
      setCrate((prev) => {
        const target = prev.items[key];
        if (!target) return prev;
        const nextItems = { ...prev.items };
        delete nextItems[key];
        const title = target.snapshot?.titleHe || target.snapshot?.titleEn || 'הפריט';
        triggerUndoToast(`"${title}" הוסר מהמגירה`, prev);
        return {
          ...prev,
          items: nextItems,
        };
      });
    },
    [triggerUndoToast]
  );

  const toggleSaveItem = useCallback(
    (sectionId, itemId, snapshot = {}) => {
      const key = makeSavedKey(sectionId, itemId);
      if (crate.items[key]) {
        removeItem(sectionId, itemId);
        return false;
      }
      saveItem(sectionId, itemId, snapshot);
      return true;
    },
    [crate.items, removeItem, saveItem]
  );

  const toggleItemFolder = useCallback((sectionId, itemId, folderId, snapshot = {}) => {
    const key = makeSavedKey(sectionId, itemId);
    setCrate((prev) => {
      const existing = prev.items[key];
      const currentFolders = existing?.folderIds || [];
      const hasFolder = currentFolders.includes(folderId);
      const nextFolders = hasFolder
        ? currentFolders.filter((id) => id !== folderId)
        : [...currentFolders, folderId];

      return {
        ...prev,
        items: {
          ...prev.items,
          [key]: {
            key,
            sectionId: String(sectionId),
            itemId: String(itemId),
            folderIds: nextFolders,
            note: existing?.note || '',
            savedAt: existing?.savedAt || Date.now(),
            snapshot: {
              titleHe: String(snapshot.titleHe ?? existing?.snapshot?.titleHe ?? ''),
              titleEn: String(snapshot.titleEn ?? existing?.snapshot?.titleEn ?? ''),
              description: String(snapshot.description ?? existing?.snapshot?.description ?? ''),
              link: String(snapshot.link ?? existing?.snapshot?.link ?? ''),
              image: String(snapshot.image ?? existing?.snapshot?.image ?? ''),
              tags: Array.isArray(snapshot.tags)
                ? snapshot.tags.slice(0, 6).map(String)
                : existing?.snapshot?.tags || [],
              badge: String(snapshot.badge ?? existing?.snapshot?.badge ?? ''),
            },
          },
        },
      };
    });
  }, []);

  const updateItemNote = useCallback((sectionId, itemId, note) => {
    const key = makeSavedKey(sectionId, itemId);
    setCrate((prev) => {
      const existing = prev.items[key];
      if (!existing) return prev;
      return {
        ...prev,
        items: {
          ...prev.items,
          [key]: {
            ...existing,
            note: String(note || '').slice(0, 140),
          },
        },
      };
    });
  }, []);

  const createFolder = useCallback((rawName, options = {}) => {
    const clean = String(rawName || '').trim().slice(0, MAX_FOLDER_NAME_LENGTH);
    if (!clean) return { ok: false, error: 'יש להזין שם לתיקייה' };

    let result = { ok: false, folder: null, error: null };
    setCrate((prev) => {
      const exists = prev.folders.some(
        (f) => f.name.toLowerCase() === clean.toLowerCase()
      );
      if (exists) {
        result = { ok: false, error: 'כבר קיימת תיקייה בשם זה' };
        return prev;
      }
      const idx = prev.folders.length;
      const newFolder = {
        id: `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        name: clean,
        color: TETRIS_COLORS.includes(options.color)
          ? options.color
          : TETRIS_COLORS[idx % TETRIS_COLORS.length],
        shape: TETRIS_SHAPES.includes(options.shape)
          ? options.shape
          : TETRIS_SHAPES[idx % TETRIS_SHAPES.length],
        createdAt: Date.now(),
      };
      result = { ok: true, folder: newFolder };
      return {
        ...prev,
        folders: [...prev.folders, newFolder],
      };
    });
    return result;
  }, []);

  const renameFolder = useCallback((folderId, rawName) => {
    const clean = String(rawName || '').trim().slice(0, MAX_FOLDER_NAME_LENGTH);
    if (!clean) return { ok: false, error: 'שם התיקייה לא יכול להיות ריק' };

    let result = { ok: true };
    setCrate((prev) => {
      const duplicate = prev.folders.some(
        (f) => f.id !== folderId && f.name.toLowerCase() === clean.toLowerCase()
      );
      if (duplicate) {
        result = { ok: false, error: 'כבר קיימת תיקייה בשם זה' };
        return prev;
      }
      return {
        ...prev,
        folders: prev.folders.map((f) => (f.id === folderId ? { ...f, name: clean } : f)),
      };
    });
    return result;
  }, []);

  const cycleFolderStyle = useCallback((folderId) => {
    setCrate((prev) => ({
      ...prev,
      folders: prev.folders.map((f) => {
        if (f.id !== folderId) return f;
        const cIdx = (TETRIS_COLORS.indexOf(f.color) + 1) % TETRIS_COLORS.length;
        const sIdx = (TETRIS_SHAPES.indexOf(f.shape) + 1) % TETRIS_SHAPES.length;
        return {
          ...f,
          color: TETRIS_COLORS[cIdx],
          shape: TETRIS_SHAPES[sIdx],
        };
      }),
    }));
  }, []);

  const deleteFolder = useCallback(
    (folderId) => {
      setCrate((prev) => {
        const target = prev.folders.find((f) => f.id === folderId);
        if (!target) return prev;
        triggerUndoToast(`התיקייה "${target.name}" נמחקה (הפריטים נשמרו ב"כל השמורים")`, prev);

        const nextItems = {};
        for (const [k, item] of Object.entries(prev.items)) {
          nextItems[k] = {
            ...item,
            folderIds: item.folderIds.filter((id) => id !== folderId),
          };
        }
        return {
          ...prev,
          folders: prev.folders.filter((f) => f.id !== folderId),
          items: nextItems,
        };
      });
    },
    [triggerUndoToast]
  );

  const importSharedFolder = useCallback((decoded) => {
    if (!decoded || !decoded.name || !Array.isArray(decoded.items)) return null;
    let importedFolderId = null;
    setCrate((prev) => {
      let targetFolder = prev.folders.find(
        (f) => f.name.toLowerCase() === decoded.name.toLowerCase()
      );
      const nextFolders = [...prev.folders];
      if (!targetFolder) {
        targetFolder = {
          id: `f-${Date.now().toString(36)}-imp`,
          name: decoded.name.slice(0, MAX_FOLDER_NAME_LENGTH),
          color: decoded.color || 'purple',
          shape: decoded.shape || 'T',
          createdAt: Date.now(),
        };
        nextFolders.push(targetFolder);
      }
      importedFolderId = targetFolder.id;

      const nextItems = { ...prev.items };
      for (const item of decoded.items) {
        const key = makeSavedKey(item.sectionId, item.itemId);
        const existing = nextItems[key];
        const folderIds = existing ? [...existing.folderIds] : [];
        if (!folderIds.includes(targetFolder.id)) {
          folderIds.push(targetFolder.id);
        }
        nextItems[key] = {
          key,
          sectionId: item.sectionId,
          itemId: item.itemId,
          folderIds,
          note: existing?.note || item.note || '',
          savedAt: existing?.savedAt || Date.now(),
          snapshot: {
            titleHe: item.snapshot?.titleHe || existing?.snapshot?.titleHe || '',
            titleEn: item.snapshot?.titleEn || existing?.snapshot?.titleEn || '',
            description: item.snapshot?.description || existing?.snapshot?.description || '',
            link: item.snapshot?.link || existing?.snapshot?.link || '',
            image: item.snapshot?.image || existing?.snapshot?.image || '',
            tags: item.snapshot?.tags?.length ? item.snapshot.tags : existing?.snapshot?.tags || [],
            badge: item.snapshot?.badge || existing?.snapshot?.badge || '',
          },
        };
      }

      return {
        ...prev,
        folders: nextFolders,
        items: nextItems,
      };
    });
    return importedFolderId;
  }, []);

  const addLocalSubmission = useCallback((submission) => {
    if (!submission?.title) return;
    setCrate((prev) => ({
      ...prev,
      submissions: [
        {
          id: `sub-${Date.now()}`,
          title: String(submission.title).trim(),
          studentName: String(submission.studentName || '').trim(),
          studyYear: String(submission.studyYear || 'שנה א׳'),
          course: String(submission.course || 'פרויקט אישי'),
          projectUrl: String(submission.projectUrl || '').trim(),
          imageUrl: String(submission.imageUrl || '').trim(),
          description: String(submission.description || '').trim(),
          status: 'ממתין לאישור במערכת',
          createdAt: Date.now(),
        },
        ...(prev.submissions || []),
      ],
    }));
  }, []);

  const savedItemsList = useMemo(
    () => Object.values(crate.items).sort((a, b) => b.savedAt - a.savedAt),
    [crate.items]
  );

  const value = useMemo(
    () => ({
      folders: crate.folders,
      itemsMap: crate.items,
      savedItemsList,
      savedCount: savedItemsList.length,
      submissions: crate.submissions || [],
      undoState,
      handleUndo,
      dismissUndo,
      isItemSaved,
      getSavedItem,
      saveItem,
      removeItem,
      toggleSaveItem,
      toggleItemFolder,
      updateItemNote,
      createFolder,
      renameFolder,
      cycleFolderStyle,
      deleteFolder,
      importSharedFolder,
      addLocalSubmission,
    }),
    [
      crate.folders,
      crate.items,
      crate.submissions,
      savedItemsList,
      undoState,
      handleUndo,
      dismissUndo,
      isItemSaved,
      getSavedItem,
      saveItem,
      removeItem,
      toggleSaveItem,
      toggleItemFolder,
      updateItemNote,
      createFolder,
      renameFolder,
      cycleFolderStyle,
      deleteFolder,
      importSharedFolder,
      addLocalSubmission,
    ]
  );

  return React.createElement(SavedItemsContext.Provider, { value }, children);
};

export const useSavedItems = () => {
  const ctx = useContext(SavedItemsContext);
  if (!ctx) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return ctx;
};

export default useSavedItems;
