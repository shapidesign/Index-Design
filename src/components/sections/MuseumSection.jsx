import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import TetrisShape from '@/components/tetris/TetrisShape';
import SaveItemButton from '@/components/ui/SaveItemButton';
import FilterToggle from '@/components/ui/FilterToggle';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';
import useSavedItems from '@/hooks/useSavedItems';
import { getTagColor, getTagTextClass } from '@/lib/tagColors';
import {
  HIT_DESIGN_PROFESSORS,
  HIT_COURSES,
  HIT_STUDY_YEARS,
  SUGGESTED_WORK_TAGS,
  SEED_STUDENT_WORKS,
} from '@/data/hitFaculty';
import {
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Search,
  ExternalLink,
  Upload,
  User,
  Plus,
  Trash2,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test((text || '').trim());

const getLinkThumbnail = (url) => {
  if (!url || !url.startsWith('http')) return null;
  if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url)) return url;
  return null;
};

/**
 * SearchableDropdown - Multi-select filter dropdown with internal search
 */
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
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 w-full h-11',
          'px-3',
          'bg-off-white',
          'border-2 border-off-black',
          'shadow-brutalist-xs',
          'font-headline text-sm text-right leading-normal',
          'transition-all duration-200 cursor-pointer',
          'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
          open && 'shadow-none translate-x-[2px] translate-y-[2px]',
          selected.length > 0 && 'border-tetris-purple bg-tetris-purple/10 font-bold'
        )}
      >
        <ChevronDown
          size={14}
          className={cn('shrink-0 transition-transform', open && 'rotate-180')}
        />
        <span className="flex-1 truncate">
          {selected.length > 0 ? `${label} (${selected.length})` : label}
        </span>
        {selected.length > 0 && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onClear();
              }
            }}
            className="shrink-0 p-0.5 hover:bg-tetris-pink/50"
          >
            <X size={12} />
          </span>
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
          <div className="p-2 border-b-2 border-off-black/20">
            <div className="flex items-center gap-2 px-2 py-1 bg-light-gray border border-off-black/30">
              <Search size={12} className="text-mid-gray shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש..."
                className="w-full bg-transparent text-xs font-headline outline-none text-right"
                dir="rtl"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-mid-gray text-center py-3 font-ibm">
                לא נמצאו תוצאות
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onToggle(opt)}
                  className={cn(
                    'w-full text-right px-3 py-1.5',
                    'text-xs font-headline cursor-pointer',
                    'hover:bg-light-gray transition-colors',
                    selected.includes(opt) && 'bg-tetris-yellow/40 font-bold'
                  )}
                >
                  <span className="flex items-center gap-2 justify-between">
                    <span className="truncate">{opt}</span>
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

/**
 * StudentWorkModal - Full detail modal for a student work
 */
const StudentWorkModal = ({ work, onClose }) => {
  useEffect(() => {
    if (!work) return undefined;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [work, onClose]);

  useEffect(() => {
    if (!work) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [work]);

  if (!work) return null;

  const displayImage = work.imageUrl || getLinkThumbnail(work.link);

  return createPortal(
    <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-off-black/80 dark:bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full max-w-4xl',
          'bg-off-white border-3 border-off-black shadow-brutalist',
          'max-h-[90vh] overflow-y-auto'
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="סגור"
          className="absolute top-3 left-3 p-2 bg-tetris-pink border-2 border-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Preview / Artwork Column */}
          <div className="w-full md:w-2/5 h-60 md:h-auto md:min-h-[380px] bg-light-gray border-b-3 md:border-b-0 md:border-l-3 border-off-black relative flex items-center justify-center overflow-hidden">
            {displayImage ? (
              <img
                src={displayImage}
                alt={work.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <TetrisShape
                type={work.shape || 'T'}
                color={work.color || 'purple'}
                size={42}
              />
            )}
            <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 bg-tetris-yellow border-2 border-off-black shadow-brutalist-xs font-headline text-xs font-bold text-off-black">
                {work.course}
              </span>
              <span className="px-2.5 py-1 bg-off-white border-2 border-off-black shadow-brutalist-xs font-headline text-xs text-off-black">
                {work.year}
              </span>
            </div>
          </div>

          {/* Info Column */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-headline text-off-black mb-2">
                {work.title}
              </h2>

              <div className="flex flex-col gap-1.5 mb-5 p-3 bg-light-gray border-2 border-off-black">
                <div className="flex items-center gap-2 text-sm font-headline">
                  <User size={15} className="text-tetris-purple shrink-0" />
                  <span className="font-bold text-off-black">סטודנט/ית:</span>
                  <span className="text-dark-gray">{work.studentName}</span>
                </div>
                {work.teacher && (
                  <div className="flex items-center gap-2 text-sm font-headline">
                    <GraduationCap size={15} className="text-tetris-orange shrink-0" />
                    <span className="font-bold text-off-black">מרצה מנחה:</span>
                    <span className="text-dark-gray">{work.teacher}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm font-headline">
                  <BookOpen size={15} className="text-tetris-blue shrink-0" />
                  <span className="font-bold text-off-black">קורס ושנה:</span>
                  <span className="text-dark-gray">
                    {work.course} · {work.year}
                  </span>
                </div>
              </div>

              {work.description && (
                <div className="mb-5">
                  <h4 className="text-sm font-bold font-headline text-off-black mb-1">
                    על הפרויקט
                  </h4>
                  <p className="text-sm text-dark-gray font-ibm leading-relaxed">
                    {work.description}
                  </p>
                </div>
              )}

              {work.tags?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold font-headline text-off-black mb-2">
                    תגיות
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {work.tags.map((tag) => {
                      const bg = getTagColor(tag);
                      return (
                        <span
                          key={tag}
                          className={cn(
                            'px-2.5 py-0.5 text-xs border border-off-black shadow-brutalist-xs',
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
                </div>
              )}
            </div>

            {work.link && (
              <div className="pt-4 border-t-2 border-off-black/15 flex justify-end">
                <a
                  href={work.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-off-black text-off-white font-headline text-sm font-bold border-2 border-off-black hover:bg-tetris-purple transition-colors"
                >
                  <span>לצפייה בפרויקט המלא</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

/**
 * MuseumSection - מוזיאון עבודות סטודנטים (HIT)
 * Categorized and filtered by course, study year, lecturer (from HIT phonebook), and tags.
 * Students with a connected Google profile can upload and tag their works.
 */
const MuseumSection = ({ pendingNavigation }) => {
  const {
    submissions,
    userProfile,
    addLocalSubmission,
    deleteLocalSubmission,
  } = useSavedItems();

  const [viewMode, setViewMode] = useState('gallery');
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);

  // Upload & Google Auth Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    course: HIT_COURSES[0],
    year: userProfile?.studyYear || 'שנה ב׳',
    teacher: HIT_DESIGN_PROFESSORS[0],
    customTeacher: '',
    description: '',
    link: '',
    imageUrl: '',
    tags: ['טיפוגרפיה'],
    customTagInput: '',
    shape: 'T',
    color: 'purple',
  });
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadingWork, setUploadingWork] = useState(false);

  // Combine user-uploaded works + seeded HIT student works
  const allWorks = useMemo(() => {
    const userWorks = (submissions || []).map((s) => ({
      ...s,
      year: s.year || s.studyYear || 'שנה ב׳',
      course: s.course || 'פרויקט אישי',
      teacher: s.teacher || 'ארז בכר (ראש המחלקה לתקשורת חזותית)',
      tags: Array.isArray(s.tags) ? s.tags : [],
      link: s.link || s.projectUrl || '',
      isUserSubmission: true,
    }));
    return [...userWorks, ...SEED_STUDENT_WORKS];
  }, [submissions]);

  // All available filter options (combining HIT lists + dynamic values)
  const courseOptions = useMemo(() => {
    const set = new Set([...HIT_COURSES, ...allWorks.map((w) => w.course).filter(Boolean)]);
    return Array.from(set);
  }, [allWorks]);

  const yearOptions = useMemo(() => {
    const set = new Set([...HIT_STUDY_YEARS, ...allWorks.map((w) => w.year).filter(Boolean)]);
    return Array.from(set);
  }, [allWorks]);

  const teacherOptions = useMemo(() => {
    const set = new Set([
      ...HIT_DESIGN_PROFESSORS,
      ...allWorks.map((w) => w.teacher).filter(Boolean),
    ]);
    return Array.from(set);
  }, [allWorks]);

  const tagOptions = useMemo(() => {
    const set = new Set([
      ...SUGGESTED_WORK_TAGS,
      ...allWorks.flatMap((w) => w.tags || []).filter(Boolean),
    ]);
    return Array.from(set);
  }, [allWorks]);

  const toggleItem = (setter) => (val) => {
    setter((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  };

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setSelectedCourses([]);
    setSelectedYears([]);
    setSelectedTeachers([]);
    setSelectedTags([]);
  }, []);

  // Reset filters if navigated from global search
  const [lastNavTarget, setLastNavTarget] = useState(null);
  if (pendingNavigation?.targetId && pendingNavigation.targetId !== lastNavTarget) {
    setLastNavTarget(pendingNavigation.targetId);
    setSearchQuery('');
    setSelectedCourses([]);
    setSelectedYears([]);
    setSelectedTeachers([]);
    setSelectedTags([]);
  }

  const activeFilterCount =
    selectedCourses.length +
    selectedYears.length +
    selectedTeachers.length +
    selectedTags.length;

  const hasActiveFilters = Boolean(searchQuery.trim()) || activeFilterCount > 0;

  const filteredWorks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allWorks.filter((work) => {
      if (selectedCourses.length > 0 && !selectedCourses.includes(work.course)) return false;
      if (selectedYears.length > 0 && !selectedYears.includes(work.year)) return false;
      if (selectedTeachers.length > 0 && !selectedTeachers.includes(work.teacher)) return false;
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((t) => (work.tags || []).includes(t))
      ) {
        return false;
      }

      if (!q) return true;
      const hay = [
        work.title,
        work.studentName,
        work.course,
        work.year,
        work.teacher,
        work.description,
        ...(work.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [
    allWorks,
    searchQuery,
    selectedCourses,
    selectedYears,
    selectedTeachers,
    selectedTags,
  ]);

  const handleToggleUploadTag = (tag) => {
    setUploadForm((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  const handleAddCustomTag = () => {
    const clean = uploadForm.customTagInput.trim();
    if (!clean) return;
    setUploadForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(clean) ? prev.tags : [...prev.tags, clean],
      customTagInput: '',
    }));
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadForm((prev) => ({ ...prev, imageUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!userProfile) {
      setUploadError('יש להתחבר ולאמת חשבון לפני העלאת עבודה');
      return;
    }
    if (!uploadForm.title.trim()) {
      setUploadError('יש להזין את שם העבודה / הפרויקט');
      return;
    }
    const finalTeacher =
      uploadForm.teacher === '__custom__'
        ? uploadForm.customTeacher.trim() || 'מרצה בפקולטה לעיצוב'
        : uploadForm.teacher;

    setUploadingWork(true);
    setUploadError('');
    try {
      const created = await addLocalSubmission({
        title: uploadForm.title,
        studentName: userProfile.name,
        studentEmail: userProfile.email,
        course: uploadForm.course,
        year: uploadForm.year,
        teacher: finalTeacher,
        tags: uploadForm.tags,
        link: uploadForm.link,
        imageUrl: uploadForm.imageUrl,
        description: uploadForm.description,
        shape: uploadForm.shape,
        color: uploadForm.color,
      });

      if (!created) {
        setUploadError('שמירת העבודה בענן נכשלה. נסו שוב.');
        return;
      }

      setUploadForm({
        title: '',
        course: HIT_COURSES[0],
        year: userProfile.studyYear || 'שנה ב׳',
        teacher: HIT_DESIGN_PROFESSORS[0],
        customTeacher: '',
        description: '',
        link: '',
        imageUrl: '',
        tags: ['טיפוגרפיה'],
        customTagInput: '',
        shape: 'T',
        color: 'purple',
      });
      setIsUploadOpen(false);
      setUploadSuccess('העבודה נשמרה בענן והועלתה בהצלחה למוזיאון הסטודנטים!');
      window.setTimeout(() => setUploadSuccess(''), 4000);
    } finally {
      setUploadingWork(false);
    }
  };

  return (
    <section dir="rtl" className="animate-tetris-stack">
      {selectedWork && (
        <StudentWorkModal work={selectedWork} onClose={() => setSelectedWork(null)} />
      )}

      {/* ===== HEADER + UPLOAD CTA ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-tetris-orange border-2 border-off-black shadow-brutalist-xs mb-2">
            <GraduationCap size={15} />
            <span className="font-headline text-xs font-bold text-off-black">
              הפקולטה לעיצוב · HIT מכון טכנולוגי חולון
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl md:text-5xl font-bold text-off-black font-headline">
              המוזיאון — עבודות סטודנטים
            </h2>
            <span className="font-headline text-sm text-dark-gray">
              {filteredWorks.length} עבודות
              {hasActiveFilters && ` (מסוננות מתוך ${allWorks.length})`}
            </span>
          </div>
          <p className="text-sm md:text-base text-dark-gray font-ibm mt-1 max-w-2xl">
            תערוכת פרויקטים של סטודנטים וסטודנטיות לתקשורת חזותית ועיצוב ב-HIT — מסווגים לפי קורס, שנת לימודים, מרצה מנחה ותגיות.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {userProfile ? (
            <button
              type="button"
              onClick={() => {
                setIsUploadOpen((prev) => !prev);
                if (!isUploadOpen && HIT_STUDY_YEARS.includes(userProfile?.studyYear)) {
                  setUploadForm((form) => ({ ...form, year: userProfile.studyYear }));
                }
              }}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5',
                'bg-tetris-purple text-off-white font-headline text-xs md:text-sm font-bold',
                'border-3 border-off-black shadow-brutalist-sm',
                'hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]',
                'transition-all duration-150 cursor-pointer'
              )}
            >
              <Upload size={16} />
              <span>העלאת עבודה חדשה</span>
            </button>
          ) : (
            <GoogleSignInButton
              className="bg-tetris-purple text-off-white hover:bg-tetris-yellow hover:text-off-black"
              label="התחבר עם Google והעלה עבודה"
            />
          )}

          <FilterToggle
            isOpen={showFilters}
            onToggle={() => setShowFilters((prev) => !prev)}
            activeCount={activeFilterCount}
          />

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
      </div>

      {uploadSuccess && (
        <div className="mb-6 p-3 px-4 bg-tetris-green border-3 border-off-black shadow-brutalist-sm font-headline text-sm font-bold text-off-black">
          {uploadSuccess}
        </div>
      )}

      {isUploadOpen && userProfile && (
        <div className="mb-8 p-6 bg-off-white border-3 border-off-black shadow-brutalist">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-off-black">
            <h3 className="text-xl font-bold font-headline text-off-black">
              {`העלאת עבודה למוזיאון (${userProfile.name} · ${userProfile.email})`}
            </h3>
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="p-1 text-dark-gray hover:text-off-black cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="flex flex-col">
                  <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                    <span>שם העבודה / הפרויקט *</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="למשל: עיצוב גופן רשת מודולרי"
                    dir="rtl"
                    className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-headline text-sm outline-none focus:bg-off-white"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                    <span>קורס *</span>
                  </label>
                  <select
                    value={uploadForm.course}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, course: e.target.value }))
                    }
                    className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-headline text-sm outline-none cursor-pointer"
                  >
                    {HIT_COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                    <span>שנת לימודים *</span>
                  </label>
                  <select
                    value={uploadForm.year}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, year: e.target.value }))
                    }
                    className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-headline text-sm outline-none cursor-pointer"
                  >
                    {HIT_STUDY_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                    <span>מרצה מנחה ב-HIT *</span>
                  </label>
                  <select
                    value={uploadForm.teacher}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, teacher: e.target.value }))
                    }
                    className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-headline text-sm outline-none cursor-pointer"
                  >
                    {HIT_DESIGN_PROFESSORS.map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                    <option value="__custom__">אחר (הזנה ידנית)...</option>
                  </select>
                  {uploadForm.teacher === '__custom__' && (
                    <input
                      type="text"
                      value={uploadForm.customTeacher}
                      onChange={(e) =>
                        setUploadForm((p) => ({ ...p, customTeacher: e.target.value }))
                      }
                      placeholder="הזינו שם מרצה..."
                      dir="rtl"
                      className="form-control-uniform w-full mt-2 px-3 bg-off-white border-2 border-off-black font-headline text-xs"
                    />
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                    <span>קישור לפרויקט (Behance / Figma / אתר)</span>
                  </label>
                  <input
                    type="url"
                    value={uploadForm.link}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, link: e.target.value }))
                    }
                    placeholder="https://..."
                    dir="ltr"
                    className="form-control-uniform w-full px-3 bg-light-gray border-2 border-off-black font-jersey text-sm outline-none focus:bg-off-white"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="form-label-uniform font-headline text-xs font-bold text-off-black">
                    <span>העלאת תמונה מהמחשב או קישור לתמונה</span>
                  </label>
                  <div className="flex items-stretch gap-2">
                    <input
                      type="url"
                      value={uploadForm.imageUrl.startsWith('data:') ? '' : uploadForm.imageUrl}
                      onChange={(e) =>
                        setUploadForm((p) => ({ ...p, imageUrl: e.target.value }))
                      }
                      placeholder="https://... או בחרו קובץ"
                      dir="ltr"
                      className="form-control-uniform flex-1 min-w-0 px-3 bg-light-gray border-2 border-off-black font-jersey text-sm outline-none focus:bg-off-white"
                    />
                    <label className="form-control-uniform px-3 bg-tetris-yellow border-2 border-off-black font-headline text-xs font-bold cursor-pointer shrink-0 inline-flex items-center justify-center">
                      <span>קובץ תמונה</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags selection + custom tag */}
              <div>
                <label className="block font-headline text-xs font-bold text-off-black mb-1.5">
                  תגיות (בחרו או הוסיפו תגית חדשה)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SUGGESTED_WORK_TAGS.map((tag) => {
                    const active = uploadForm.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleUploadTag(tag)}
                        className={cn(
                          'px-2.5 py-1 text-xs font-headline border border-off-black transition-all cursor-pointer',
                          active
                            ? 'bg-tetris-purple text-off-white font-bold'
                            : 'bg-light-gray text-off-black hover:bg-tetris-yellow/40'
                        )}
                      >
                        {tag} {active && '✓'}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-stretch gap-2 max-w-sm">
                  <input
                    type="text"
                    value={uploadForm.customTagInput}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, customTagInput: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="תגית נוספת..."
                    dir="rtl"
                    className="form-control-uniform flex-1 px-3 bg-light-gray border-2 border-off-black font-headline text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="form-control-uniform px-3 bg-off-black text-off-white font-headline text-xs font-bold border-2 border-off-black cursor-pointer inline-flex items-center justify-center gap-1 shrink-0"
                  >
                    <Plus size={12} />
                    <span>הוסף תגית</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center h-6 font-headline text-xs font-bold text-off-black mb-1.5 leading-none">
                  <span>תיאור קצר של הפרויקט והתהליך</span>
                </label>
                <textarea
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="ספרו על הבריף בקורס, ההשראה והכלים שבהם השתמשתם..."
                  dir="rtl"
                  className="w-full px-3 py-2 bg-light-gray border-2 border-off-black font-ibm text-sm outline-none focus:bg-off-white"
                />
              </div>

              {uploadError && (
                <p className="text-xs font-ibm text-red-700">{uploadError}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="h-11 px-4 bg-light-gray border-2 border-off-black font-headline text-xs font-bold cursor-pointer inline-flex items-center justify-center"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={uploadingWork}
                  className="h-11 px-6 bg-tetris-green border-2 border-off-black shadow-brutalist-xs font-headline text-xs font-bold text-off-black cursor-pointer inline-flex items-center justify-center disabled:opacity-60"
                >
                  {uploadingWork ? 'שומר בענן...' : 'פרסם עבודה במוזיאון'}
                </button>
              </div>
            </form>
        </div>
      )}

      {/* ===== FILTER BAR (Course, Year, Lecturer, Tags + Search) ===== */}
      <div className="p-4 mb-8 bg-off-white border-3 border-off-black shadow-brutalist-sm">
        {/* Search Input */}
        <div className="relative mb-4">
          <div className="flex items-center gap-2 h-11 px-3 bg-light-gray border-2 border-off-black">
            <Search size={14} className="text-tetris-purple shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי שם פרויקט, סטודנט/ית, קורס, מרצה מנחה או תגית..."
              className="w-full h-full bg-transparent text-sm font-headline outline-none text-right"
              dir="rtl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="shrink-0 cursor-pointer"
              >
                <X size={14} className="text-dark-gray hover:text-off-black" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Filter Dropdowns: Course, Year, Teacher Name, Tags */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SearchableDropdown
              label="קורס"
              options={courseOptions}
              selected={selectedCourses}
              onToggle={toggleItem(setSelectedCourses)}
              onClear={() => setSelectedCourses([])}
            />
            <SearchableDropdown
              label="שנת לימודים"
              options={yearOptions}
              selected={selectedYears}
              onToggle={toggleItem(setSelectedYears)}
              onClear={() => setSelectedYears([])}
            />
            <SearchableDropdown
              label="מרצה מנחה (HIT)"
              options={teacherOptions}
              selected={selectedTeachers}
              onToggle={toggleItem(setSelectedTeachers)}
              onClear={() => setSelectedTeachers([])}
            />
            <SearchableDropdown
              label="תגיות"
              options={tagOptions}
              selected={selectedTags}
              onToggle={toggleItem(setSelectedTags)}
              onClear={() => setSelectedTags([])}
            />
          </div>
        )}

        {/* Quick Course Chips */}
        <div className="mt-3 pt-3 border-t border-off-black/15 flex items-center gap-1.5 overflow-x-auto pb-1 flex-wrap">
          <span className="text-xs font-headline font-bold text-dark-gray ml-1">
            קורסים בולטים:
          </span>
          {HIT_COURSES.slice(0, 7).map((course) => {
            const active = selectedCourses.includes(course);
            return (
              <button
                key={course}
                type="button"
                onClick={() => toggleItem(setSelectedCourses)(course)}
                className={cn(
                  'px-2.5 py-1 text-xs font-headline border border-off-black transition-all cursor-pointer',
                  active
                    ? 'bg-tetris-orange text-off-black font-bold shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-light-gray text-off-black shadow-brutalist-xs hover:bg-tetris-yellow/40'
                )}
              >
                {course}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="mr-auto px-3 py-1 bg-tetris-pink border-2 border-off-black font-headline text-xs font-bold text-off-black shadow-brutalist-xs hover:shadow-none cursor-pointer"
            >
              נקה סינון ✕
            </button>
          )}
        </div>
      </div>

      {/* ===== STUDENT WORKS GALLERY / LIST ===== */}
      {filteredWorks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-off-white border-3 border-off-black shadow-brutalist">
          <TetrisShape type="L" color="orange" size={32} className="mb-4 opacity-60" />
          <p className="text-lg font-bold text-off-black font-headline mb-1">
            לא נמצאו עבודות סטודנטים תואמות
          </p>
          <p className="text-sm text-dark-gray font-ibm mb-4">
            נסו לשנות את סינון הקורס, המרצה או התגיות, או העלו עבודה חדשה.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="px-4 py-2 bg-tetris-pink border-2 border-off-black font-headline text-sm font-bold shadow-brutalist-xs cursor-pointer"
          >
            נקה סינון
          </button>
        </div>
      ) : viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((work) => {
            const displayImage = work.imageUrl || getLinkThumbnail(work.link);
            const saveSnapshot = {
              titleHe: work.title,
              titleEn: `${work.studentName} · ${work.course}`,
              description: work.description || '',
              link: work.link || '',
              image: displayImage || '',
              tags: [work.course, work.year, ...(work.tags || [])].filter(Boolean),
              badge: work.course,
            };

            return (
              <article
                key={work.id}
                id={`search-item-museum-${String(work.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`}
                onClick={() => setSelectedWork(work)}
                className={cn(
                  'group relative flex flex-col h-full',
                  'bg-off-white border-3 border-off-black',
                  'shadow-brutalist hover:shadow-brutalist-sm',
                  'transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px]',
                  'overflow-hidden cursor-pointer'
                )}
              >
                {/* Artwork / Preview Area */}
                <div className="relative h-48 border-b-3 border-off-black overflow-hidden bg-light-gray flex items-center justify-center">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={work.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <TetrisShape
                      type={work.shape || 'T'}
                      color={work.color || 'purple'}
                      size={30}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                  )}

                  {/* Course & Year Badges (Top Right in RTL) */}
                  <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[75%] z-10">
                    <span className="px-2 py-0.5 bg-tetris-yellow border-2 border-off-black shadow-brutalist-xs font-headline text-xs font-bold text-off-black">
                      {work.course}
                    </span>
                    <span className="px-2 py-0.5 bg-off-white border-2 border-off-black shadow-brutalist-xs font-headline text-xs text-off-black">
                      {work.year}
                    </span>
                  </div>

                  {/* Save to Drawer Button (Top Left in RTL) */}
                  <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
                    <SaveItemButton
                      sectionId="museum"
                      itemId={work.id}
                      snapshot={saveSnapshot}
                      size="sm"
                    />
                    {work.isUserSubmission && userProfile?.id && work.userId === userProfile.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLocalSubmission(work.id);
                        }}
                        aria-label="מחק עבודה"
                        title="מחק עבודה זו"
                        className="p-1.5 bg-tetris-pink border-2 border-off-black shadow-brutalist-xs text-off-black hover:bg-red-300 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-4 flex flex-col">
                  <h3 className="text-xl font-bold font-headline leading-tight text-off-black group-hover:text-tetris-purple transition-colors mb-1">
                    {work.title}
                  </h3>

                  <p className="text-xs font-headline font-bold text-tetris-purple mb-1">
                    סטודנט/ית: {work.studentName}
                  </p>
                  {work.teacher && (
                    <p className="text-xs font-ibm text-dark-gray mb-3">
                      מרצה מנחה: <span className="font-bold">{work.teacher}</span>
                    </p>
                  )}

                  {work.description && (
                    <p className="text-sm text-dark-gray font-ibm line-clamp-3 mb-4 flex-1">
                      {work.description}
                    </p>
                  )}

                  {/* Work Tags */}
                  {work.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {work.tags.map((tag) => {
                        const bg = getTagColor(tag);
                        return (
                          <span
                            key={`${work.id}-${tag}`}
                            className={cn(
                              'px-2 py-0.5 text-xs border border-off-black shadow-brutalist-xs',
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

                  <div className="mt-auto pt-3 border-t-2 border-off-black/10 flex justify-between items-center">
                    <span className="text-xs font-headline text-mid-gray">
                      לחצו לפרטים מלאים
                    </span>
                    {work.link && (
                      <a
                        href={work.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-off-black text-off-white text-xs font-bold font-headline hover:bg-tetris-purple transition-colors"
                      >
                        <span>לפרויקט</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredWorks.map((work) => {
            const displayImage = work.imageUrl || getLinkThumbnail(work.link);
            const saveSnapshot = {
              titleHe: work.title,
              titleEn: `${work.studentName} · ${work.course}`,
              description: work.description || '',
              link: work.link || '',
              image: displayImage || '',
              tags: [work.course, work.year, ...(work.tags || [])].filter(Boolean),
              badge: work.course,
            };

            return (
              <div
                key={work.id}
                onClick={() => setSelectedWork(work)}
                className="flex items-center justify-between gap-4 p-4 bg-off-white border-3 border-off-black shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-tetris-yellow border border-off-black font-headline text-xs font-bold">
                      {work.course}
                    </span>
                    <span className="px-2 py-0.5 bg-light-gray border border-off-black font-headline text-xs">
                      {work.year}
                    </span>
                    <span className="text-xs font-ibm text-dark-gray">
                      מרצה: <strong>{work.teacher}</strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-headline text-off-black">
                    {work.title} — <span className="text-tetris-purple">{work.studentName}</span>
                  </h3>
                  {work.description && (
                    <p className="text-sm font-ibm text-dark-gray line-clamp-1 mt-0.5">
                      {work.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <SaveItemButton
                    sectionId="museum"
                    itemId={work.id}
                    snapshot={saveSnapshot}
                    size="sm"
                  />
                  {work.link && (
                    <a
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-tetris-purple text-off-white border-2 border-off-black"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MuseumSection;
