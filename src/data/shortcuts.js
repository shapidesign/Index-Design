/**
 * Most-used desktop shortcuts for המקלדת.
 * The English face is the US key. The Hebrew face is the character on that
 * same key in the standard Hebrew layout (K is ל, not קיי).
 * ponytail: curated defaults for a US layout. Versions and custom keymaps differ.
 */

const swapModifiers = (keys) =>
  keys.map((key) => (key === 'cmd' ? 'ctrl' : key === 'opt' ? 'alt' : key));

const shortcut = (id, app, category, label, mac, win = swapModifiers(mac)) => ({
  id,
  app,
  category,
  label,
  mac,
  win,
});

const LETTERS = {
  a: ['A', 'ש'],
  b: ['B', 'נ'],
  c: ['C', 'ב'],
  d: ['D', 'ג'],
  e: ['E', 'ק'],
  f: ['F', 'כ'],
  g: ['G', 'ע'],
  h: ['H', 'י'],
  i: ['I', 'ן'],
  j: ['J', 'ח'],
  k: ['K', 'ל'],
  l: ['L', 'ך'],
  m: ['M', 'צ'],
  n: ['N', 'מ'],
  o: ['O', 'ם'],
  p: ['P', 'פ'],
  q: ['Q', '/'],
  r: ['R', 'ר'],
  s: ['S', 'ד'],
  t: ['T', 'א'],
  u: ['U', 'ו'],
  v: ['V', 'ה'],
  w: ['W', "'"],
  x: ['X', 'ס'],
  y: ['Y', 'ט'],
  z: ['Z', 'ז'],
};

export const KEYS = {
  ...Object.fromEntries(
    Object.entries(LETTERS).map(([id, [en, he]]) => [id, { en, he }])
  ),
  ...Object.fromEntries(
    Array.from({ length: 10 }, (_, index) => [String(index), { en: String(index), he: String(index) }])
  ),
  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => {
      const number = index + 1;
      return [`f${number}`, { en: `F${number}`, he: `F${number}` }];
    })
  ),
  esc: { en: 'Esc', he: 'יציאה' },
  tab: { en: 'Tab', he: 'טאב' },
  caps: { en: 'Caps', he: 'גדולות' },
  shift: { en: 'Shift', he: 'שיפט' },
  ctrl: { en: 'Ctrl', mac: '⌃', he: 'קונטרול' },
  opt: { en: '⌥', he: 'אופציה' },
  alt: { en: 'Alt', he: 'אלט' },
  cmd: { en: '⌘', he: 'פקודה' },
  win: { en: 'Win', he: 'חלונות' },
  space: { en: 'Space', he: 'רווח' },
  enter: { en: 'Enter', he: 'אנטר' },
  backspace: { en: 'Delete', win: 'Backspace', he: 'מחיקה' },
  backtick: { en: '`', he: ';' },
  minus: { en: '-', he: '-' },
  equal: { en: '=', he: '=' },
  bracketleft: { en: '[', he: ']' },
  bracketright: { en: ']', he: '[' },
  backslash: { en: '\\', he: '\\' },
  semicolon: { en: ';', he: 'ף' },
  quote: { en: "'", he: ',' },
  comma: { en: ',', he: 'ת' },
  period: { en: '.', he: 'ץ' },
  slash: { en: '/', he: '.' },
  left: { en: '←', he: 'שמאלה' },
  down: { en: '↓', he: 'למטה' },
  up: { en: '↑', he: 'למעלה' },
  right: { en: '→', he: 'ימינה' },
};

const MAIN_ROWS = [
  ['esc', 'gap', 'f1', 'f2', 'f3', 'f4', 'gap', 'f5', 'f6', 'f7', 'f8', 'gap', 'f9', 'f10', 'f11', 'f12'],
  ['backtick', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'minus', 'equal', 'backspace'],
  ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'bracketleft', 'bracketright', 'backslash'],
  ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'semicolon', 'quote', 'enter'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'comma', 'period', 'slash', 'shift'],
];

export const KEYBOARD = {
  mac: [...MAIN_ROWS, ['ctrl', 'opt', 'cmd', 'space', 'cmd', 'opt']],
  win: [...MAIN_ROWS, ['ctrl', 'win', 'alt', 'space', 'alt', 'ctrl']],
};

export const ARROW_KEYS = ['left', 'down', 'up', 'right'];

export const KEY_WIDTH = {
  backspace: 1.7,
  tab: 1.45,
  caps: 1.7,
  enter: 1.85,
  shift: 2.15,
  space: 6,
  cmd: 1.35,
  ctrl: 1.25,
  opt: 1.25,
  alt: 1.25,
  win: 1.25,
};

export const APPS = [
  { id: 'photoshop', name: 'Photoshop', he: 'פוטושופ', bg: 'bg-tetris-blue' },
  { id: 'illustrator', name: 'Illustrator', he: 'אילוסטרייטור', bg: 'bg-tetris-orange' },
  { id: 'indesign', name: 'InDesign', he: 'אינדיזיין', bg: 'bg-tetris-pink' },
  { id: 'figma', name: 'Figma', he: 'פיגמה', bg: 'bg-tetris-purple', text: 'text-off-white' },
  { id: 'aftereffects', name: 'After Effects', he: 'אפטר אפקטס', bg: 'bg-tetris-green' },
  { id: 'premiere', name: 'Premiere Pro', he: 'פרימייר', bg: 'bg-tetris-yellow' },
  { id: 'powerpoint', name: 'PowerPoint', he: 'פאוורפוינט', bg: 'bg-tetris-cyan' },
  { id: 'word', name: 'Word', he: 'וורד', bg: 'bg-off-black', text: 'text-off-white' },
];

export const SHORTCUTS = [
  shortcut('ps-move', 'photoshop', 'כלים', 'כלי הזזה', ['v']),
  shortcut('ps-brush', 'photoshop', 'כלים', 'כלי מברשת', ['b']),
  shortcut('ps-type', 'photoshop', 'כלים', 'כלי טקסט', ['t']),
  shortcut('ps-undo', 'photoshop', 'עריכה', 'ביטול פעולה', ['cmd', 'z']),
  shortcut('ps-transform', 'photoshop', 'עריכה', 'טרנספורמציה חופשית', ['cmd', 't']),
  shortcut('ps-deselect', 'photoshop', 'עריכה', 'ביטול בחירה', ['cmd', 'd']),
  shortcut('ps-duplicate', 'photoshop', 'שכבות', 'שכפול השכבה', ['cmd', 'j']),
  shortcut('ps-new-layer', 'photoshop', 'שכבות', 'שכבה חדשה', ['cmd', 'shift', 'n']),
  shortcut('ps-merge', 'photoshop', 'שכבות', 'מיזוג השכבות הנראות', ['cmd', 'shift', 'e']),
  shortcut('ps-fill', 'photoshop', 'צבע', 'מילוי בצבע החזית', ['opt', 'backspace']),
  shortcut('ps-swap', 'photoshop', 'צבע', 'החלפה בין צבע חזית לרקע', ['x']),
  shortcut('ps-default-colors', 'photoshop', 'צבע', 'חזרה לשחור ולבן', ['d']),
  shortcut('ps-brush-bigger', 'photoshop', 'כלים', 'הגדלת המברשת', ['bracketright']),
  shortcut('ps-save', 'photoshop', 'עריכה', 'שמירה', ['cmd', 's']),
  shortcut('ps-nudge', 'photoshop', 'עריכה', 'הזזה שמאלה בעשרה פיקסלים', ['shift', 'left']),

  shortcut('ai-select', 'illustrator', 'כלים', 'כלי בחירה', ['v']),
  shortcut('ai-direct', 'illustrator', 'כלים', 'בחירה ישירה', ['a']),
  shortcut('ai-pen', 'illustrator', 'כלים', 'כלי עט', ['p']),
  shortcut('ai-type', 'illustrator', 'כלים', 'כלי טקסט', ['t']),
  shortcut('ai-rect', 'illustrator', 'כלים', 'מלבן', ['m']),
  shortcut('ai-undo', 'illustrator', 'עריכה', 'ביטול פעולה', ['cmd', 'z']),
  shortcut('ai-group', 'illustrator', 'עריכה', 'קיבוץ', ['cmd', 'g']),
  shortcut('ai-ungroup', 'illustrator', 'עריכה', 'פירוק קבוצה', ['cmd', 'shift', 'g']),
  shortcut('ai-outline', 'illustrator', 'תצוגה', 'תצוגת קווי מתאר', ['cmd', 'y']),
  shortcut('ai-mask', 'illustrator', 'עריכה', 'יצירת מסכת חיתוך', ['cmd', '7']),
  shortcut('ai-forward', 'illustrator', 'עריכה', 'הבאה צעד אחד קדימה', ['cmd', 'bracketright']),
  shortcut('ai-lock', 'illustrator', 'עריכה', 'נעילת הבחירה', ['cmd', '2']),
  shortcut('ai-swap', 'illustrator', 'צבע', 'החלפה בין מילוי לקו', ['x']),
  shortcut('ai-save', 'illustrator', 'עריכה', 'שמירה', ['cmd', 's']),

  shortcut('id-select', 'indesign', 'כלים', 'כלי בחירה', ['v']),
  shortcut('id-type', 'indesign', 'כלים', 'כלי טקסט', ['t']),
  shortcut('id-place', 'indesign', 'עריכה', 'השמת קובץ', ['cmd', 'd']),
  shortcut('id-export', 'indesign', 'עריכה', 'ייצוא', ['cmd', 'e']),
  shortcut('id-undo', 'indesign', 'עריכה', 'ביטול פעולה', ['cmd', 'z']),
  shortcut('id-bold', 'indesign', 'טקסט', 'הדגשה', ['cmd', 'shift', 'b']),
  shortcut('id-italic', 'indesign', 'טקסט', 'הטיה', ['cmd', 'shift', 'i']),
  shortcut('id-preview', 'indesign', 'תצוגה', 'מעבר לתצוגה מקדימה', ['w']),
  shortcut('id-fit-frame', 'indesign', 'עריכה', 'התאמת המסגרת לתוכן', ['cmd', 'opt', 'c']),
  shortcut('id-fill-frame', 'indesign', 'עריכה', 'מילוי המסגרת באופן יחסי', ['cmd', 'opt', 'shift', 'c']),
  shortcut('id-bigger-type', 'indesign', 'טקסט', 'הגדלת גופן', ['cmd', 'shift', 'period']),
  shortcut('id-character', 'indesign', 'טקסט', 'פתיחת חלונית התו', ['cmd', 't']),
  shortcut('id-save', 'indesign', 'עריכה', 'שמירה', ['cmd', 's']),
  shortcut('id-zoom-fit', 'indesign', 'תצוגה', 'התאמה לחלון', ['cmd', '0']),

  shortcut('fg-move', 'figma', 'כלים', 'כלי הזזה', ['v']),
  shortcut('fg-frame', 'figma', 'כלים', 'כלי מסגרת', ['f']),
  shortcut('fg-pen', 'figma', 'כלים', 'כלי עט', ['p']),
  shortcut('fg-text', 'figma', 'כלים', 'כלי טקסט', ['t']),
  shortcut('fg-rect', 'figma', 'כלים', 'מלבן', ['r']),
  shortcut('fg-undo', 'figma', 'עריכה', 'ביטול פעולה', ['cmd', 'z']),
  shortcut('fg-group', 'figma', 'עריכה', 'קיבוץ', ['cmd', 'g']),
  shortcut('fg-duplicate', 'figma', 'עריכה', 'שכפול', ['cmd', 'd']),
  shortcut('fg-ui', 'figma', 'תצוגה', 'הצגה או הסתרה של הממשק', ['cmd', 'backslash']),
  shortcut('fg-fit', 'figma', 'תצוגה', 'התאמה למסך', ['shift', '1']),
  shortcut('fg-selection-zoom', 'figma', 'תצוגה', 'זום לבחירה', ['shift', '2']),
  shortcut('fg-component', 'figma', 'עריכה', 'יצירת קומפוננטה', ['cmd', 'opt', 'k']),
  shortcut('fg-autolayout', 'figma', 'עריכה', 'הוספת אוטו לייאאוט', ['shift', 'a']),
  shortcut('fg-actions', 'figma', 'עריכה', 'תפריט פעולות', ['cmd', 'k']),

  shortcut('ae-play', 'aftereffects', 'ציר זמן', 'ניגון או עצירה', ['space']),
  shortcut('ae-position', 'aftereffects', 'ציר זמן', 'הצגת מיקום', ['p']),
  shortcut('ae-scale', 'aftereffects', 'ציר זמן', 'הצגת קנה מידה', ['s']),
  shortcut('ae-rotation', 'aftereffects', 'ציר זמן', 'הצגת סיבוב', ['r']),
  shortcut('ae-opacity', 'aftereffects', 'ציר זמן', 'הצגת אטימות', ['t']),
  shortcut('ae-anchor', 'aftereffects', 'ציר זמן', 'הצגת נקודת עיגון', ['a']),
  shortcut('ae-easy', 'aftereffects', 'ציר זמן', 'האטה רכה לקיפריים', ['f9']),
  shortcut('ae-precomp', 'aftereffects', 'עריכה', 'קימפוז מראש', ['cmd', 'shift', 'c']),
  shortcut('ae-split', 'aftereffects', 'ציר זמן', 'פיצול שכבה', ['cmd', 'shift', 'd']),
  shortcut('ae-duplicate', 'aftereffects', 'עריכה', 'שכפול', ['cmd', 'd']),
  shortcut('ae-undo', 'aftereffects', 'עריכה', 'ביטול פעולה', ['cmd', 'z']),
  shortcut('ae-in', 'aftereffects', 'ציר זמן', 'הזזת תחילת השכבה לזמן הנוכחי', ['bracketleft']),
  shortcut('ae-out', 'aftereffects', 'ציר זמן', 'הזזת סוף השכבה לזמן הנוכחי', ['bracketright']),
  shortcut('ae-save', 'aftereffects', 'עריכה', 'שמירה', ['cmd', 's']),

  shortcut('pr-in', 'premiere', 'עריכת וידאו', 'סימון נקודת כניסה', ['i']),
  shortcut('pr-out', 'premiere', 'עריכת וידאו', 'סימון נקודת יציאה', ['o']),
  shortcut('pr-go-in', 'premiere', 'עריכת וידאו', 'קפיצה לנקודת הכניסה', ['shift', 'i']),
  shortcut('pr-razor', 'premiere', 'כלים', 'כלי חיתוך', ['c']),
  shortcut('pr-select', 'premiere', 'כלים', 'כלי בחירה', ['v']),
  shortcut('pr-ripple-prev', 'premiere', 'עריכת וידאו', 'חיתוך אדווה עד ראש הנגן', ['q']),
  shortcut('pr-ripple-next', 'premiere', 'עריכת וידאו', 'חיתוך אדווה מראש הנגן', ['w']),
  shortcut('pr-edit', 'premiere', 'עריכת וידאו', 'חיתוך במסילה', ['cmd', 'k']),
  shortcut('pr-insert', 'premiere', 'עריכת וידאו', 'עריכת הוספה', ['comma']),
  shortcut('pr-overwrite', 'premiere', 'עריכת וידאו', 'עריכת דריסה', ['period']),
  shortcut('pr-play', 'premiere', 'ציר זמן', 'ניגון או עצירה', ['space']),
  shortcut('pr-export', 'premiere', 'עריכה', 'ייצוא', ['cmd', 'm']),
  shortcut('pr-undo', 'premiere', 'עריכה', 'ביטול פעולה', ['cmd', 'z']),
  shortcut('pr-marker', 'premiere', 'ציר זמן', 'הוספת מרקר', ['m']),

  shortcut('pp-new-slide', 'powerpoint', 'מצגת', 'שקופית חדשה', ['cmd', 'm']),
  shortcut('pp-duplicate', 'powerpoint', 'מצגת', 'שכפול', ['cmd', 'd']),
  shortcut('pp-start', 'powerpoint', 'מצגת', 'הצגה מההתחלה', ['f5']),
  shortcut('pp-current', 'powerpoint', 'מצגת', 'הצגה מהשקופית הנוכחית', ['shift', 'f5']),
  shortcut('pp-esc', 'powerpoint', 'מצגת', 'יציאה מההצגה', ['esc']),
  shortcut('pp-bold', 'powerpoint', 'טקסט', 'הדגשה', ['cmd', 'b']),
  shortcut('pp-italic', 'powerpoint', 'טקסט', 'הטיה', ['cmd', 'i']),
  shortcut('pp-underline', 'powerpoint', 'טקסט', 'קו תחתון', ['cmd', 'u']),
  shortcut('pp-undo', 'powerpoint', 'עריכה', 'ביטול פעולה', ['cmd', 'z']),
  shortcut('pp-group', 'powerpoint', 'עריכה', 'קיבוץ אובייקטים', ['cmd', 'opt', 'g'], ['ctrl', 'g']),
  shortcut('pp-center', 'powerpoint', 'טקסט', 'יישור למרכז', ['cmd', 'e']),
  shortcut('pp-save', 'powerpoint', 'עריכה', 'שמירה', ['cmd', 's']),
  shortcut('pp-link', 'powerpoint', 'עריכה', 'הוספת קישור', ['cmd', 'k']),
  shortcut('pp-print', 'powerpoint', 'עריכה', 'הדפסה', ['cmd', 'p']),

  shortcut('wd-bold', 'word', 'טקסט', 'הדגשה', ['cmd', 'b']),
  shortcut('wd-italic', 'word', 'טקסט', 'הטיה', ['cmd', 'i']),
  shortcut('wd-underline', 'word', 'טקסט', 'קו תחתון', ['cmd', 'u']),
  shortcut('wd-undo', 'word', 'עריכה', 'ביטול פעולה', ['cmd', 'z']),
  shortcut('wd-find', 'word', 'מסמך', 'חיפוש', ['cmd', 'f']),
  shortcut('wd-replace', 'word', 'מסמך', 'החלפה', ['cmd', 'h']),
  shortcut('wd-all', 'word', 'עריכה', 'בחירת הכול', ['cmd', 'a']),
  shortcut('wd-save', 'word', 'מסמך', 'שמירה', ['cmd', 's']),
  shortcut('wd-center', 'word', 'טקסט', 'יישור למרכז', ['cmd', 'e']),
  shortcut('wd-justify', 'word', 'טקסט', 'יישור לשני הצדדים', ['cmd', 'j']),
  shortcut('wd-h1', 'word', 'טקסט', 'סגנון כותרת 1', ['cmd', 'opt', '1']),
  shortcut('wd-break', 'word', 'מסמך', 'מעבר עמוד', ['cmd', 'enter']),
  shortcut('wd-link', 'word', 'מסמך', 'הוספת קישור', ['cmd', 'k']),
  shortcut('wd-bigger', 'word', 'טקסט', 'הגדלת גופן', ['cmd', 'shift', 'period']),
];

export const keyFace = (id, platform) => {
  const key = KEYS[id];
  if (!key) return { en: id, he: id };
  const en = platform === 'win' && key.win
    ? key.win
    : platform === 'mac' && key.mac
      ? key.mac
      : key.en;
  return { en, he: key.he };
};

export const comboText = (keys, platform, part = 'en') =>
  keys.map((key) => keyFace(key, platform)[part]).join(' + ');

const comboId = (keys) => keys.join('+');

export const quizChoices = (item, platform, shortcuts = SHORTCUTS, random = Math.random) => {
  const correctCombo = comboId(item[platform]);
  const unique = [];
  shortcuts.forEach((candidate) => {
    const combo = comboId(candidate[platform]);
    if (candidate.id === item.id || combo === correctCombo) return;
    if (unique.some((choice) => comboId(choice[platform]) === combo)) return;
    unique.push(candidate);
  });
  const sameApp = unique.filter((candidate) => candidate.app === item.app);
  const pool = sameApp.length >= 3 ? sameApp : unique;
  const bag = [...pool];
  const picked = [];
  while (picked.length < 3 && bag.length > 0) {
    const index = Math.floor(random() * bag.length);
    picked.push(bag.splice(index, 1)[0]);
  }
  const options = [
    { id: item.id, keys: item[platform], correct: true },
    ...picked.map((candidate) => ({
      id: candidate.id,
      keys: candidate[platform],
      correct: false,
    })),
  ];
  for (let index = options.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [options[index], options[swap]] = [options[swap], options[index]];
  }
  return options;
};

export const emptyProgress = () => ({
  attempts: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  days: [],
  mastered: {},
  platformUses: { mac: 0, win: 0 },
  quizzes: 0,
  perfectQuizzes: 0,
});

const whole = (value) => (Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0);

export const sanitizeProgress = (value) => {
  const base = emptyProgress();
  if (!value || typeof value !== 'object') return base;
  const mastered = value.mastered && typeof value.mastered === 'object' ? value.mastered : {};
  return {
    attempts: whole(value.attempts),
    correct: whole(value.correct),
    streak: whole(value.streak),
    bestStreak: whole(value.bestStreak),
    days: Array.isArray(value.days) ? value.days.filter((day) => typeof day === 'string') : [],
    mastered: Object.fromEntries(Object.entries(mastered).filter(([, known]) => known === true)),
    platformUses: {
      mac: whole(value.platformUses?.mac),
      win: whole(value.platformUses?.win),
    },
    quizzes: whole(value.quizzes),
    perfectQuizzes: whole(value.perfectQuizzes),
  };
};

export const todayKey = (date = new Date()) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const applyAnswer = (progress, { shortcutId, correct, platform, date = new Date() }) => {
  const day = todayKey(date);
  const streak = correct ? progress.streak + 1 : 0;
  return {
    ...progress,
    attempts: progress.attempts + 1,
    correct: progress.correct + (correct ? 1 : 0),
    streak,
    bestStreak: Math.max(progress.bestStreak, streak),
    days: progress.days.includes(day) ? progress.days : [...progress.days, day],
    mastered: correct ? { ...progress.mastered, [shortcutId]: true } : progress.mastered,
    platformUses: {
      ...progress.platformUses,
      [platform]: (progress.platformUses[platform] || 0) + 1,
    },
  };
};

export const recordQuiz = (progress, { answered, correct }) => ({
  ...progress,
  quizzes: progress.quizzes + 1,
  perfectQuizzes: progress.perfectQuizzes + (answered >= 5 && correct === answered ? 1 : 0),
});

export const dayStreak = (days, today = new Date()) => {
  const known = new Set(days);
  const cursor = new Date(today);
  cursor.setHours(12, 0, 0, 0);
  if (!known.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (known.has(todayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
};

export const masteryByApp = (progress, shortcuts = SHORTCUTS) => {
  const totals = {};
  shortcuts.forEach((item) => {
    totals[item.app] ??= { total: 0, done: 0 };
    totals[item.app].total += 1;
    if (progress.mastered[item.id]) totals[item.app].done += 1;
  });
  return totals;
};

export const BADGES = [
  { id: 'first', label: 'קיצור ראשון', hint: 'עונים נכון פעם אחת', test: (progress) => progress.correct >= 1 },
  { id: 'streak5', label: 'רצף של 5', hint: 'חמש תשובות נכונות ברצף', test: (progress) => progress.bestStreak >= 5 },
  { id: 'streak10', label: 'רצף של 10', hint: 'עשר תשובות נכונות ברצף', test: (progress) => progress.bestStreak >= 10 },
  { id: 'ten', label: 'עשרה נכונים', hint: 'עשר תשובות נכונות בסך הכול', test: (progress) => progress.correct >= 10 },
  { id: 'fifty', label: 'חמישים נכונים', hint: 'חמישים תשובות נכונות בסך הכול', test: (progress) => progress.correct >= 50 },
  { id: 'perfect', label: 'חידון מושלם', hint: 'חידון של חמש תשובות לפחות בלי טעות', test: (progress) => progress.perfectQuizzes >= 1 },
  { id: 'both', label: 'שתי מערכות', hint: 'מתרגלים גם ב-macOS וגם ב-Windows', test: (progress) => progress.platformUses.mac > 0 && progress.platformUses.win > 0 },
  { id: 'days3', label: 'שלושה ימים', hint: 'מתרגלים בשלושה ימים שונים', test: (progress) => progress.days.length >= 3 },
  {
    id: 'app',
    label: 'שליטה בתוכנה',
    hint: 'כל קיצורי תוכנה אחת נענו נכון',
    test: (progress, shortcuts) => Object.values(masteryByApp(progress, shortcuts)).some((app) => app.total > 0 && app.done === app.total),
  },
  {
    id: 'all',
    label: 'המקלדת כולה',
    hint: 'כל הקיצורים נענו נכון לפחות פעם אחת',
    test: (progress, shortcuts) => shortcuts.every((item) => progress.mastered[item.id]),
  },
];

export const earnedBadges = (progress, shortcuts = SHORTCUTS) =>
  BADGES.filter((badge) => badge.test(progress, shortcuts));
