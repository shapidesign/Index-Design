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
  userProfile: null,
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

  const userProfile =
    raw.userProfile && typeof raw.userProfile === 'object' && raw.userProfile.name
      ? {
          name: String(raw.userProfile.name).trim(),
          email: String(raw.userProfile.email || '').trim(),
          avatar: String(raw.userProfile.avatar || '').trim(),
          studyYear: String(raw.userProfile.studyYear || 'שנה ב׳').trim(),
          provider: 'google',
          signedInAt: Number(raw.userProfile.signedInAt) || Date.now(),
        }
      : null;

  return {
    version: 1,
    folders,
    items,
    submissions,
    userProfile,
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
      const target = crate.items[key];
      if (!target) return;
      const title = target.snapshot?.titleHe || target.snapshot?.titleEn || 'הפריט';
      triggerUndoToast(`"${title}" הוסר מהמגירה`, crate);
      setCrate((prev) => {
        if (!prev.items[key]) return prev;
        const nextItems = { ...prev.items };
        delete nextItems[key];
        return {
          ...prev,
          items: nextItems,
        };
      });
    },
    [crate, triggerUndoToast]
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

  const createFolder = useCallback(
    (rawName, options = {}) => {
      const clean = String(rawName || '').trim().slice(0, MAX_FOLDER_NAME_LENGTH);
      if (!clean) return { ok: false, error: 'יש להזין שם לתיקייה' };

      const exists = crate.folders.some(
        (f) => f.name.toLowerCase() === clean.toLowerCase()
      );
      if (exists) {
        return { ok: false, error: 'כבר קיימת תיקייה בשם זה' };
      }

      const idx = crate.folders.length;
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

      setCrate((prev) => ({
        ...prev,
        folders: [...prev.folders, newFolder],
      }));
      return { ok: true, folder: newFolder };
    },
    [crate.folders]
  );

  const renameFolder = useCallback(
    (folderId, rawName) => {
      const clean = String(rawName || '').trim().slice(0, MAX_FOLDER_NAME_LENGTH);
      if (!clean) return { ok: false, error: 'שם התיקייה לא יכול להיות ריק' };

      const duplicate = crate.folders.some(
        (f) => f.id !== folderId && f.name.toLowerCase() === clean.toLowerCase()
      );
      if (duplicate) {
        return { ok: false, error: 'כבר קיימת תיקייה בשם זה' };
      }

      setCrate((prev) => ({
        ...prev,
        folders: prev.folders.map((f) => (f.id === folderId ? { ...f, name: clean } : f)),
      }));
      return { ok: true };
    },
    [crate.folders]
  );

  const updateFolderStyle = useCallback((folderId, { color, shape }) => {
    setCrate((prev) => ({
      ...prev,
      folders: prev.folders.map((f) => {
        if (f.id !== folderId) return f;
        return {
          ...f,
          color: TETRIS_COLORS.includes(color) ? color : f.color,
          shape: TETRIS_SHAPES.includes(shape) ? shape : f.shape,
        };
      }),
    }));
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
      const target = crate.folders.find((f) => f.id === folderId);
      if (!target) return;
      triggerUndoToast(
        `התיקייה "${target.name}" נמחקה (הפריטים נשמרו ב"כל השמורים")`,
        crate
      );
      setCrate((prev) => {
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
    [crate, triggerUndoToast]
  );

  const importSharedFolder = useCallback((decoded) => {
    if (!decoded || !decoded.name || !Array.isArray(decoded.items)) return null;
    const newFolderId = `f-${Date.now().toString(36)}-imp`;
    setCrate((prev) => {
      let targetFolder = prev.folders.find(
        (f) => f.name.toLowerCase() === decoded.name.toLowerCase()
      );
      const nextFolders = [...prev.folders];
      if (!targetFolder) {
        targetFolder = {
          id: newFolderId,
          name: decoded.name.slice(0, MAX_FOLDER_NAME_LENGTH),
          color: decoded.color || 'purple',
          shape: decoded.shape || 'T',
          createdAt: Date.now(),
        };
        nextFolders.push(targetFolder);
      }

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
    const existingMatch = crate.folders.find(
      (f) => f.name.toLowerCase() === decoded.name.toLowerCase()
    );
    return existingMatch ? existingMatch.id : newFolderId;
  }, [crate.folders]);

  const signInWithGoogle = useCallback((profileData) => {
    if (!profileData?.name) return;
    setCrate((prev) => ({
      ...prev,
      userProfile: {
        name: String(profileData.name).trim(),
        email: String(profileData.email || '').trim(),
        avatar: String(profileData.avatar || '').trim(),
        studyYear: String(profileData.studyYear || 'שנה ב׳').trim(),
        provider: 'google',
        signedInAt: Date.now(),
      },
    }));
  }, []);

  const signOutProfile = useCallback(() => {
    setCrate((prev) => ({
      ...prev,
      userProfile: null,
    }));
  }, []);

  const addLocalSubmission = useCallback((submission) => {
    if (!submission?.title) return null;
    const newWork = {
      id: `sub-${Date.now()}`,
      title: String(submission.title).trim(),
      studentName: String(submission.studentName || '').trim(),
      studentEmail: String(submission.studentEmail || '').trim(),
      studentAvatar: String(submission.studentAvatar || '').trim(),
      year: String(submission.year || submission.studyYear || 'שנה ב׳'),
      course: String(submission.course || 'טיפוגרפיה א׳'),
      teacher: String(submission.teacher || '').trim(),
      tags: Array.isArray(submission.tags)
        ? submission.tags.filter(Boolean).map((t) => String(t).trim())
        : [],
      link: String(submission.link || submission.projectUrl || '').trim(),
      imageUrl: String(submission.imageUrl || '').trim(),
      description: String(submission.description || '').trim(),
      shape: TETRIS_SHAPES.includes(submission.shape) ? submission.shape : 'T',
      color: TETRIS_COLORS.includes(submission.color) ? submission.color : 'purple',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCrate((prev) => ({
      ...prev,
      submissions: [newWork, ...(prev.submissions || [])],
    }));
    return newWork;
  }, []);

  const deleteLocalSubmission = useCallback((workId) => {
    setCrate((prev) => ({
      ...prev,
      submissions: (prev.submissions || []).filter((s) => s.id !== workId),
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
      userProfile: crate.userProfile || null,
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
      updateFolderStyle,
      cycleFolderStyle,
      deleteFolder,
      importSharedFolder,
      signInWithGoogle,
      signOutProfile,
      addLocalSubmission,
      deleteLocalSubmission,
    }),
    [
      crate.folders,
      crate.items,
      crate.submissions,
      crate.userProfile,
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
      updateFolderStyle,
      cycleFolderStyle,
      deleteFolder,
      importSharedFolder,
      signInWithGoogle,
      signOutProfile,
      addLocalSubmission,
      deleteLocalSubmission,
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
