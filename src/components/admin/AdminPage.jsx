import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';
import { bumpVersion, normalizeItems } from '@/data/whatsNew';
import { HEAT_COLS, HEAT_ROWS, binHeat } from '@/lib/analytics-event';

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
            <div className="flex gap-2 mb-6">
              <TabButton active={tab === 'news'} onClick={() => setTab('news')}>מה חדש</TabButton>
              <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')}>אנליטיקס</TabButton>
              <button
                type="button"
                className={cn(buttonClass, 'ms-auto px-3 py-2 bg-off-white text-sm')}
                onClick={() => supabase.auth.signOut()}
              >
                יציאה
              </button>
            </div>
            {tab === 'news' ? <NewsEditor /> : <AnalyticsBoard />}
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
  const [items, setItems] = useState(['']);
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
        setItems(data.items.length ? data.items : ['']);
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
    setItems(nextItems.length ? nextItems : ['']);
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
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <textarea
              value={item}
              rows={2}
              maxLength={400}
              aria-label={`סעיף ${index + 1}`}
              onChange={(event) => {
                const next = items.slice();
                next[index] = event.target.value;
                setItems(next);
              }}
              className={cn(fieldClass, 'min-h-16')}
            />
            <div className="flex flex-col gap-1">
              <button type="button" className={cn(buttonClass, 'px-2 py-1 bg-off-white text-sm')} aria-label="הזזה למעלה" onClick={() => move(index, -1)}>↑</button>
              <button type="button" className={cn(buttonClass, 'px-2 py-1 bg-off-white text-sm')} aria-label="הזזה למטה" onClick={() => move(index, 1)}>↓</button>
              <button type="button" className={cn(buttonClass, 'px-2 py-1 bg-tetris-pink text-sm')} aria-label="מחיקת סעיף" onClick={() => setItems(items.length === 1 ? [''] : items.filter((_, i) => i !== index))}>×</button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={cn(buttonClass, 'px-3 py-2 bg-tetris-yellow text-sm')}
        onClick={() => items.length < 30 && setItems([...items, ''])}
      >
        הוספת סעיף
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
