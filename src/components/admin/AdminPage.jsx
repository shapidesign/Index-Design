import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';
import { HIT_COURSES, HIT_DESIGN_PROFESSORS, HIT_STUDY_YEARS } from '@/data/hitFaculty';
import { bumpVersion, normalizeItems, resizeImageFile } from '@/data/whatsNew';
import { HEAT_COLS, HEAT_ROWS, binHeat } from '@/lib/analytics-event';
import { museumWorkPatch } from '@/lib/museumWork';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-43GN2SH9KR';
const KIND_LABEL = { click: 'קליקים', hover: 'ריחופים', share: 'שיתופים', forward: 'העברות' };
const SECTION_LABEL = {
  home: 'דף הבית',
  toolbox: 'ארגז הכלים',
  museum: 'המוזיאון',
  library: 'הספרייה',
  dictionary: 'מילון',
  keyboard: 'מקלדת',
  map: 'המפה',
  tips: 'טיפים',
  lucky: 'הפתעה',
};

const fieldClass = 'w-full bg-off-white border-2 border-off-black px-3 py-2 font-ibm text-off-black';
const buttonClass = 'border-2 border-off-black font-bold font-headline shadow-brutalist-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200';

const formatWhen = (iso) => new Date(iso).toLocaleString('he-IL', {
  timeZone: 'Asia/Jerusalem',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const AdminPage = () => {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSession, setAdminSession] = useState(null);
  const [tab, setTab] = useState('news');
  const sessionId = session?.user?.id ?? null;
  if (sessionId !== adminSession) {
    setAdminSession(sessionId);
    setIsAdmin(false);
  }

  useEffect(() => {
    let live = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!live) return;
      setSession(data.session ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => {
      live = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionId) return undefined;
    let live = true;
    supabase.rpc('am_i_admin').then(({ data, error }) => {
      if (live) setIsAdmin(!error && data === true);
    });
    return () => { live = false; };
  }, [sessionId]);

  return (
    <div dir="rtl" className="min-h-screen bg-off-white text-off-black font-headline">
      <header className="border-b-3 border-off-black bg-off-black text-off-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">ניהול אינדקס</h1>
          <a href="/" className="text-sm font-ibm underline underline-offset-2">חזרה לאתר</a>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {!ready && <p className="font-ibm">טוען…</p>}
        {ready && !session && <LoginForm />}
        {ready && session && !isAdmin && <NotAllowed email={session.user.email} />}
        {ready && session && isAdmin && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              <TabButton active={tab === 'news'} onClick={() => setTab('news')}>מה חדש</TabButton>
              <TabButton active={tab === 'museum'} onClick={() => setTab('museum')}>המוזיאון</TabButton>
              <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')}>אנליטיקס</TabButton>
              <button
                type="button"
                className={cn(buttonClass, 'ms-auto px-3 py-2 bg-off-white text-sm')}
                onClick={() => supabase.auth.signOut()}
              >
                יציאה
              </button>
            </div>
            {tab === 'news' && <NewsEditor />}
            {tab === 'museum' && <MuseumWorks />}
            {tab === 'analytics' && <AnalyticsBoard />}
          </>
        )}
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(buttonClass, 'px-4 py-2', active ? 'bg-tetris-purple text-off-black' : 'bg-off-white')}
  >
    {children}
  </button>
);

const LoginForm = () => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const credentials = { email: email.trim(), password };
    const { data, error: authError } = mode === 'signup'
      ? await supabase.auth.signUp(credentials)
      : await supabase.auth.signInWithPassword(credentials);
    setBusy(false);
    if (authError) {
      const closed = /signup closed|database error saving new user/i.test(authError.message);
      setError(closed ? 'האימייל הזה לא ברשימת הניהול.' : 'הכניסה נכשלה. בדקו אימייל וסיסמה.');
      return;
    }
    if (mode === 'signup' && !data.session) {
      setError('נשלח מייל לאימות. אשרו אותו ואז התחברו.');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto bg-off-white border-3 border-off-black shadow-brutalist p-6 space-y-4">
      <h2 className="text-xl font-bold">{mode === 'signup' ? 'יצירת חשבון ניהול' : 'כניסת ניהול'}</h2>
      <GoogleSignInButton className="w-full" />
      <label className="block font-ibm text-sm">
        אימייל
        <input
          type="email"
          required
          dir="ltr"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={cn(fieldClass, 'mt-1 text-left')}
        />
      </label>
      <label className="block font-ibm text-sm">
        סיסמה
        <input
          type="password"
          required
          minLength={6}
          dir="ltr"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={cn(fieldClass, 'mt-1 text-left')}
        />
      </label>
      {error && <p role="status" className="font-ibm text-sm text-off-black bg-tetris-pink border-2 border-off-black px-3 py-2">{error}</p>}
      <button type="submit" disabled={busy} className={cn(buttonClass, 'w-full py-2.5 bg-tetris-green disabled:opacity-60')}>
        {busy ? 'רגע…' : mode === 'signup' ? 'יצירת חשבון' : 'כניסה'}
      </button>
      <button
        type="button"
        className="font-ibm text-sm underline underline-offset-2"
        onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}
      >
        {mode === 'signup' ? 'כבר יש חשבון? כניסה' : 'פעם ראשונה? יצירת חשבון'}
      </button>
    </form>
  );
};

const NotAllowed = ({ email }) => (
  <div className="border-3 border-off-black shadow-brutalist p-6 bg-tetris-pink">
    <p className="font-bold mb-2">החשבון הזה לא ברשימת הניהול.</p>
    <p dir="ltr" className="font-ibm text-sm text-left mb-4">{email}</p>
    <button type="button" className={cn(buttonClass, 'px-4 py-2 bg-off-white')} onClick={() => supabase.auth.signOut()}>
      יציאה
    </button>
  </div>
);

const NewsEditor = () => {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([{ text: '', imageUrl: '' }]);
  const [enabled, setEnabled] = useState(true);
  const [version, setVersion] = useState('v6');
  const [reshow, setReshow] = useState(true);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    supabase.from('whats_new').select('version,title,items,enabled').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (!live) return;
        if (error || !data) {
          setStatus('לא הצלחנו לטעון את מה חדש');
          return;
        }
        setTitle(data.title);
        const slides = normalizeItems(data.items);
        setItems(slides.length ? slides : [{ text: '', imageUrl: '' }]);
        setEnabled(data.enabled);
        setVersion(data.version);
      });
    return () => { live = false; };
  }, []);

  const move = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = items.slice();
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setItems(next);
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    const nextVersion = reshow ? bumpVersion(version) : version;
    const nextItems = normalizeItems(items);
    const { error } = await supabase.from('whats_new').update({
      title: title.trim().slice(0, 80) || 'מה חדש אצלנו?',
      items: nextItems,
      enabled,
      version: nextVersion,
    }).eq('id', 1);
    setBusy(false);
    if (error) {
      setStatus('השמירה נכשלה');
      return;
    }
    setVersion(nextVersion);
    setItems(nextItems.length ? nextItems : [{ text: '', imageUrl: '' }]);
    setStatus(reshow ? `נשמר. מבקרים שסגרו את החלון יראו את ${nextVersion}` : 'נשמר בלי להציג מחדש');
  };

  return (
    <form onSubmit={save} className="border-3 border-off-black shadow-brutalist p-4 md:p-6 space-y-4 bg-off-white">
      <p className="font-ibm text-sm text-dark-gray">גרסה נוכחית: {version}. מי שסימן "אל תראה שוב" לא יראה אותה שוב עד שמעלים גרסה.</p>
      <label className="flex items-center gap-2 font-ibm">
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
        החלון מוצג באתר
      </label>
      <label className="block font-ibm text-sm">
        כותרת
        <input value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} className={cn(fieldClass, 'mt-1')} />
      </label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="border-2 border-off-black p-3 space-y-2">
            <div className="flex gap-2 items-start">
              <textarea
                value={item.text}
                rows={2}
                maxLength={400}
                aria-label={`טקסט שקופית ${index + 1}`}
                onChange={(event) => {
                  const next = items.slice();
                  next[index] = { ...item, text: event.target.value };
                  setItems(next);
                }}
                className={cn(fieldClass, 'min-h-16')}
              />
              <div className="flex flex-col gap-1">
                <button type="button" className={cn(buttonClass, 'px-2 py-1 bg-off-white text-sm')} aria-label="הזזה למעלה" onClick={() => move(index, -1)}>↑</button>
                <button type="button" className={cn(buttonClass, 'px-2 py-1 bg-off-white text-sm')} aria-label="הזזה למטה" onClick={() => move(index, 1)}>↓</button>
                <button type="button" className={cn(buttonClass, 'px-2 py-1 bg-tetris-pink text-sm')} aria-label="מחיקת שקופית" onClick={() => setItems(items.length === 1 ? [{ text: '', imageUrl: '' }] : items.filter((_, i) => i !== index))}>×</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="url"
                value={String(item.imageUrl || '').startsWith('data:') ? '' : item.imageUrl || ''}
                placeholder="קישור לתמונה (לא חובה)"
                dir="ltr"
                aria-label={`תמונת שקופית ${index + 1}`}
                onChange={(event) => {
                  const next = items.slice();
                  next[index] = { ...item, imageUrl: event.target.value };
                  setItems(next);
                }}
                className={cn(fieldClass, 'flex-1 min-w-[180px]')}
              />
              <label className={cn(buttonClass, 'px-3 py-2 bg-tetris-yellow text-sm cursor-pointer')}>
                קובץ תמונה
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (!file) return;
                    try {
                      const imageUrl = await resizeImageFile(file);
                      if (!imageUrl) return;
                      setItems((prev) => prev.map((slide, slideIndex) => (
                        slideIndex === index ? { ...slide, imageUrl } : slide
                      )));
                    } catch {
                      setStatus('לא הצלחנו לקרוא את התמונה');
                    }
                  }}
                />
              </label>
              {item.imageUrl && (
                <button
                  type="button"
                  className={cn(buttonClass, 'px-3 py-2 bg-off-white text-sm')}
                  onClick={() => {
                    const next = items.slice();
                    next[index] = { ...item, imageUrl: '' };
                    setItems(next);
                  }}
                >
                  הסר תמונה
                </button>
              )}
            </div>
            {item.imageUrl && (
              <img src={item.imageUrl} alt="" className="max-h-28 border-2 border-off-black" />
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className={cn(buttonClass, 'px-3 py-2 bg-tetris-yellow text-sm')}
        onClick={() => items.length < 12 && setItems([...items, { text: '', imageUrl: '' }])}
      >
        הוספת שקופית
      </button>
      <label className="flex items-center gap-2 font-ibm text-sm">
        <input type="checkbox" checked={reshow} onChange={(event) => setReshow(event.target.checked)} />
        הצג שוב למי שכבר סגר את החלון
      </label>
      {status && <p role="status" className="font-ibm text-sm">{status}</p>}
      <button type="submit" disabled={busy} className={cn(buttonClass, 'px-6 py-2.5 bg-tetris-green disabled:opacity-60')}>
        {busy ? 'שומר…' : 'שמירה'}
      </button>
    </form>
  );
};

const withCurrent = (options, current) => (
  current && !options.includes(current) ? [current, ...options] : options
);

const draftFromWork = (work) => ({
  title: work.title || '',
  student_name: work.student_name || '',
  course: work.course || HIT_COURSES[0],
  study_year: work.study_year || HIT_STUDY_YEARS[0],
  teacher: work.teacher || '',
  description: work.description || '',
  tags: Array.isArray(work.tags) ? work.tags.join(', ') : '',
  link: work.link || '',
  image_url: work.image_url || '',
});

const MuseumWorks = () => {
  const [works, setWorks] = useState(null);
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let live = true;
    supabase.from('student_works')
      .select('id,title,student_name,course,study_year,teacher,description,tags,link,image_url,created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!live) return;
        if (error) {
          setWorks([]);
          setStatus('לא הצלחנו לטעון את עבודות המוזיאון');
          return;
        }
        setWorks(data || []);
        setStatus('');
      });
    return () => { live = false; };
  }, []);

  const setField = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const save = async (work) => {
    const patch = museumWorkPatch(draft);
    if (!patch.ok) {
      setStatus(patch.error);
      return;
    }
    setBusyId(work.id);
    setStatus('');
    const { data, error } = await supabase.from('student_works')
      .update(patch.row)
      .eq('id', work.id)
      .select('id,title,student_name,course,study_year,teacher,description,tags,link,image_url,created_at')
      .single();
    setBusyId(null);
    if (error || !data) {
      setStatus('השמירה נכשלה');
      return;
    }
    setWorks((prev) => prev.map((row) => (row.id === work.id ? data : row)));
    setEditingId(null);
    setDraft(null);
    setStatus('נשמר');
  };

  const remove = async (work) => {
    if (!window.confirm(`למחוק את "${work.title}" מהמוזיאון?`)) return;
    setBusyId(work.id);
    setStatus('');
    const { data, error } = await supabase.from('student_works').delete().eq('id', work.id).select('id');
    setBusyId(null);
    if (error || !data?.length) {
      setStatus('המחיקה נכשלה');
      return;
    }
    setWorks((prev) => prev.filter((row) => row.id !== work.id));
    if (editingId === work.id) {
      setEditingId(null);
      setDraft(null);
    }
    setStatus('העבודה הוסרה מהמוזיאון');
  };

  if (!works) return <p className="font-ibm">טוען…</p>;

  return (
    <div className="space-y-4">
      {status && <p role="status" className="font-ibm text-sm">{status}</p>}
      {works.length === 0 && !status && (
        <p className="font-ibm text-sm border-3 border-off-black bg-off-white p-4">עדיין אין עבודות סטודנטים.</p>
      )}
      {works.map((work) => {
        const editing = editingId === work.id;
        const busy = busyId === work.id;
        return (
          <article key={work.id} className="border-3 border-off-black shadow-brutalist-xs bg-off-white p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg">{work.title}</h2>
                <p className="font-ibm text-sm text-dark-gray">
                  {work.student_name} · {work.course} · {work.study_year} · {work.teacher || 'ללא מרצה'}
                </p>
                <p className="font-ibm text-xs text-dark-gray">{formatWhen(work.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={cn(buttonClass, 'px-3 py-1.5 text-sm bg-tetris-yellow')}
                  onClick={() => {
                    setStatus('');
                    if (editing) {
                      setEditingId(null);
                      setDraft(null);
                      return;
                    }
                    setEditingId(work.id);
                    setDraft(draftFromWork(work));
                  }}
                >
                  {editing ? 'סגירה' : 'עריכה'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className={cn(buttonClass, 'px-3 py-1.5 text-sm bg-tetris-pink disabled:opacity-60')}
                  onClick={() => remove(work)}
                >
                  מחיקה
                </button>
              </div>
            </div>
            {editing && draft && (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  save(work);
                }}
              >
                <label className="block font-ibm text-sm">
                  שם העבודה
                  <input value={draft.title} maxLength={160} onChange={(event) => setField('title', event.target.value)} className={cn(fieldClass, 'mt-1')} />
                </label>
                <label className="block font-ibm text-sm">
                  שם הסטודנט
                  <input value={draft.student_name} maxLength={120} onChange={(event) => setField('student_name', event.target.value)} className={cn(fieldClass, 'mt-1')} />
                </label>
                <label className="block font-ibm text-sm">
                  קורס
                  <select value={draft.course} onChange={(event) => setField('course', event.target.value)} className={cn(fieldClass, 'mt-1')}>
                    {withCurrent(HIT_COURSES, draft.course).map((course) => <option key={course} value={course}>{course}</option>)}
                  </select>
                </label>
                <label className="block font-ibm text-sm">
                  שנת לימודים
                  <select value={draft.study_year} onChange={(event) => setField('study_year', event.target.value)} className={cn(fieldClass, 'mt-1')}>
                    {withCurrent(HIT_STUDY_YEARS, draft.study_year).map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </label>
                <label className="block font-ibm text-sm">
                  מרצה
                  <select value={draft.teacher} onChange={(event) => setField('teacher', event.target.value)} className={cn(fieldClass, 'mt-1')}>
                    <option value="">ללא מרצה</option>
                    {withCurrent(HIT_DESIGN_PROFESSORS, draft.teacher).map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}
                  </select>
                </label>
                <label className="block font-ibm text-sm">
                  תיאור
                  <textarea value={draft.description} rows={3} onChange={(event) => setField('description', event.target.value)} className={cn(fieldClass, 'mt-1')} />
                </label>
                <label className="block font-ibm text-sm">
                  תגיות, מופרדות בפסיק
                  <input value={draft.tags} onChange={(event) => setField('tags', event.target.value)} className={cn(fieldClass, 'mt-1')} />
                </label>
                <label className="block font-ibm text-sm">
                  קישור
                  <input dir="ltr" value={draft.link} onChange={(event) => setField('link', event.target.value)} className={cn(fieldClass, 'mt-1 text-left')} />
                </label>
                <label className="block font-ibm text-sm">
                  קישור לתמונה
                  <input
                    dir="ltr"
                    value={String(draft.image_url).startsWith('data:') ? '' : draft.image_url}
                    placeholder={String(draft.image_url).startsWith('data:') ? 'יש תמונה שמורה' : 'https://'}
                    onChange={(event) => setField('image_url', event.target.value)}
                    className={cn(fieldClass, 'mt-1 text-left')}
                  />
                </label>
                {draft.image_url && (
                  <button type="button" className={cn(buttonClass, 'px-3 py-1.5 text-sm bg-off-white')} onClick={() => setField('image_url', '')}>
                    הסר תמונה
                  </button>
                )}
                <button type="submit" disabled={busy} className={cn(buttonClass, 'px-6 py-2.5 bg-tetris-green disabled:opacity-60')}>
                  {busy ? 'שומר…' : 'שמירה'}
                </button>
              </form>
            )}
          </article>
        );
      })}
    </div>
  );
};

const AnalyticsBoard = () => {
  const [days, setDays] = useState(7);
  const [heat, setHeat] = useState('click');
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('טוען…');
  const [tick, setTick] = useState(0);
  const [requestKey, setRequestKey] = useState('7:0');
  const nextKey = `${days}:${tick}`;
  if (requestKey !== nextKey) {
    setRequestKey(nextKey);
    setStatus('טוען…');
    setEvents([]);
  }

  useEffect(() => {
    let live = true;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    // ponytail: 5000-row cap. Counts under-report after that; move the sum into SQL if traffic grows.
    supabase.from('analytics_events')
      .select('kind,section,label,x,y,created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5000)
      .then(({ data, error }) => {
        if (!live) return;
        if (error) {
          setEvents([]);
          setStatus('לא הצלחנו לטעון אנליטיקס');
          return;
        }
        setEvents(data || []);
        setStatus('');
      });
    return () => { live = false; };
  }, [days, tick]);

  const totals = { click: 0, hover: 0, share: 0, forward: 0 };
  const sections = {};
  for (const event of events) {
    totals[event.kind] = (totals[event.kind] || 0) + 1;
    if (event.kind !== heat) continue;
    const key = event.section || 'home';
    sections[key] = (sections[key] || 0) + 1;
  }
  const heatCells = binHeat(events.filter((event) => event.kind === heat));
  const maxCell = Math.max(1, ...heatCells);
  const sectionRows = Object.entries(sections).sort((a, b) => b[1] - a[1]);
  const sectionMax = Math.max(1, ...sectionRows.map(([, count]) => count));
  const colors = { click: 'bg-tetris-purple', hover: 'bg-tetris-cyan', share: 'bg-tetris-green', forward: 'bg-tetris-orange' };

  return (
    <div className="space-y-4">
      <p className="font-ibm text-sm border-2 border-off-black bg-tetris-yellow px-3 py-2">
        {GA_ID
          ? `אותם אירועים נשלחים גם ל-Google Analytics (${GA_ID}). מפת החום מצוירת כאן, כי ל-GA4 אין דוח מפת חום.`
          : 'מפת החום, הריחופים והשיתופים נשמרים כאן. כדי שאותם אירועים יופיעו גם ב-Google Analytics, הגדירו VITE_GA_MEASUREMENT_ID (מתחיל ב-G-) ובנו מחדש. ל-GA4 אין דוח מפת חום, אז הקואורדינטות נשמרות אצלנו.'}
      </p>
      <div className="flex flex-wrap gap-2">
        {[7, 30].map((value) => (
          <button key={value} type="button" aria-pressed={days === value} className={cn(buttonClass, 'px-3 py-1.5 text-sm', days === value ? 'bg-off-black text-off-white' : 'bg-off-white')} onClick={() => setDays(value)}>
            {value} ימים
          </button>
        ))}
        <button type="button" className={cn(buttonClass, 'px-3 py-1.5 text-sm bg-off-white')} onClick={() => setTick((value) => value + 1)}>רענון</button>
      </div>
      {status && <p role="status" className="font-ibm text-sm">{status}</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.keys(KIND_LABEL).map((kind) => (
          <div key={kind} className={cn('border-3 border-off-black p-3 shadow-brutalist-xs', colors[kind])}>
            <p className="text-sm font-ibm">{KIND_LABEL[kind]}</p>
            <p className="text-3xl font-bold">{totals[kind] || 0}</p>
          </div>
        ))}
      </div>
      <section className="border-3 border-off-black p-4 bg-off-white">
        <div className="flex gap-2 mb-3">
          {['click', 'hover'].map((kind) => (
            <button key={kind} type="button" aria-pressed={heat === kind} className={cn(buttonClass, 'px-3 py-1.5 text-sm', heat === kind ? 'bg-tetris-purple text-off-black' : 'bg-off-white')} onClick={() => setHeat(kind)}>
              מפת חום: {KIND_LABEL[kind]}
            </button>
          ))}
        </div>
        <p className="font-ibm text-xs text-dark-gray mb-2">הרשת משמאל לימין לפי המסך, ומלמעלה למטה לאורך העמוד.</p>
        <div dir="ltr" className="grid gap-1" style={{ gridTemplateColumns: `repeat(${HEAT_COLS}, minmax(0, 1fr))` }}>
          {heatCells.map((count, index) => (
            <div
              key={index}
              title={`${count}`}
              className={cn(
                'aspect-square border-2 border-off-black flex items-center justify-center text-[10px] font-bold',
                count ? 'text-off-black' : 'bg-light-gray text-transparent'
              )}
              style={count ? { background: `rgba(125, 83, 250, ${0.35 + (count / maxCell) * 0.65})` } : undefined}
            >
              {count || ''}
            </div>
          ))}
        </div>
        <p className="font-ibm text-xs text-dark-gray mt-2">{HEAT_COLS}×{HEAT_ROWS} תאים. כהה יותר = יותר {KIND_LABEL[heat]}.</p>
      </section>
      <section className="border-3 border-off-black p-4 space-y-2 bg-off-white">
        <h2 className="font-bold">{KIND_LABEL[heat]} לפי אזור</h2>
        {sectionRows.length === 0 && <p className="font-ibm text-sm">עדיין אין נתונים בטווח הזה.</p>}
        {sectionRows.map(([section, count]) => (
          <div key={section} className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-ibm text-sm">{SECTION_LABEL[section] || section}</span>
            <div className="flex-1 h-4 border-2 border-off-black bg-off-white">
              <div className="h-full bg-tetris-purple" style={{ width: `${(count / sectionMax) * 100}%` }} />
            </div>
            <span className="w-8 text-sm font-ibm">{count}</span>
          </div>
        ))}
      </section>
      <section className="border-3 border-off-black p-4 bg-off-white">
        <h2 className="font-bold mb-2">אחרונים</h2>
        <ul className="space-y-1 font-ibm text-sm">
          {events.slice(0, 8).map((event, index) => (
            <li key={`${event.created_at}-${index}`} className="flex justify-between gap-3 border-b border-off-black/10 py-1">
              <span>{KIND_LABEL[event.kind]} · {SECTION_LABEL[event.section] || event.section} · {event.label || '—'}{event.x == null ? '' : ` · ${event.x}%,${event.y}%`}</span>
              <span className="shrink-0 text-dark-gray">{formatWhen(event.created_at)}</span>
            </li>
          ))}
          {events.length === 0 && <li>עדיין אין אירועים.</li>}
        </ul>
      </section>
    </div>
  );
};

export default AdminPage;
