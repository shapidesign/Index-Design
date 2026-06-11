import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { getTagColor, getTagTextClass } from "@/lib/tagColors";

const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test((text || "").trim());

const usesWhiteText = (bgClass) => bgClass === "bg-tetris-purple";

const FilterChip = ({ label, isActive, activeBg, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-1.5",
      "text-xs font-bold",
      isEnglish(label) ? "font-jersey" : "font-headline",
      "border-2 border-off-black",
      "whitespace-nowrap",
      "transition-all duration-200",
      isActive
        ? [
            activeBg,
            usesWhiteText(activeBg) ? "text-off-white" : "text-off-black",
            "shadow-none translate-x-[2px] translate-y-[2px]",
          ]
        : [
            "bg-light-gray",
            "text-off-black",
            "shadow-brutalist-xs",
            "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
          ]
    )}
    aria-pressed={isActive}
  >
    {label}
  </button>
);

const FilterGroup = ({ label, children }) => (
  <div className="mb-3 last:mb-0">
    <p className="font-headline text-xs text-dark-gray mb-2">{label}</p>
    <div className="flex flex-wrap gap-2 pb-1 pe-1 overflow-visible">{children}</div>
  </div>
);

const FontTag = ({ label, highlight = false }) => {
  const bg = highlight ? "bg-tetris-green" : getTagColor(label);
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5",
        "text-xs font-normal",
        isEnglish(label) ? "font-jersey" : "font-headline",
        "border border-off-black",
        "shadow-brutalist-xs",
        bg,
        getTagTextClass(bg)
      )}
    >
      {label}
    </span>
  );
};

/* ============================================================
   אינדקס הפונט העברי — Hebrew Type Index
   A filterable index of Hebrew typefaces from independent
   Israeli foundries. Built to be embedded in index-design-hit.
   ------------------------------------------------------------
   DATA NOTES:
   - Verified data comes from the foundries' own sites
     (AAA's font-table, foundry catalogs, font pages).
   - year: null  → year not published / not yet verified.
   - Edit / extend the FONTS array below — that's the whole DB.
   ============================================================ */

const FOUNDRIES = {
  aaa:        { name: "אאא",                color: "#E4572E", site: "alefalefalef.co.il" },
  fontimonim: { name: "פונטימונים",         color: "#3322EA", site: "fontimonim.co.il" },
  hagilda:    { name: "הגילדה",             color: "#0B7A53", site: "hagilda.com" },
  fontef:     { name: "פונטף",              color: "#C2186B", site: "fontef.com" },
  ezer:       { name: "עזר טייפ האוס",      color: "#0E7490", site: "ezertypehouse.com" },
  hafontia:   { name: "הפונטיה",            color: "#A16207", site: "hafontia.com" },
  reisinger:  { name: "ריזינגר × הפונטיה",  color: "#DE6235", site: "reisinger.hafontia.com" },
};

const STYLES = {
  sans:    "סנס",
  serif:   "סריף",
  slab:    "סלאב",
  mono:    "מונוספייס",
  hand:    "כתב־יד / ידני",
  stencil: "סטנסיל",
};

const USES = {
  text:    "טקסט רץ",
  display: "כותרות / ראווה",
  book:    "אות ספר",
  brand:   "מיתוג ולוגו",
};

const TAGS = {
  bilingual:    "דו־לשוני (עב׳–אנ׳)",
  trilingual:   "תלת־לשוני (+ערבית)",
  multilingual: "מולטי־לשוני",
  variable:     "פונט וריאבלי",
  niqqud:       "ניקוד מתוכנת",
  free:         "חינמי",
  narrow:       "צר",
  wide:         "רחב",
  rounded:      "מעוגל",
  nostalgic:    "נוסטלגי",
  classic:      "קלאסי / מקורות",
  revival:      "עיבוד לאות היסטורית",
};


const VIBES = {
  "1936": "1936",
  "Tahoma": "Tahoma",
  "אוורירי": "אוורירי",
  "אופטימי": "אופטימי",
  "אות מקורות": "אות מקורות",
  "אחים שמיר": "אחים שמיר",
  "אייקונים": "אייקונים",
  "אישי": "אישי",
  "אלגנטי": "אלגנטי",
  "אנרגטי": "אנרגטי",
  "אסרטיבי": "אסרטיבי",
  "אקסטרווגנטי": "אקסטרווגנטי",
  "אקספרסיבי": "אקספרסיבי",
  "ארץ ישראלי": "ארץ ישראלי",
  "באוהאוס": "באוהאוס",
  "בלוק": "בלוק",
  "בסיסי": "בסיסי",
  "ברוטליסטי": "ברוטליסטי",
  "גאומטרי": "גאומטרי",
  "גבוה": "גבוה",
  "גוגל פונטס": "גוגל פונטס",
  "גותי": "גותי",
  "גראנג׳": "גראנג׳",
  "גראנג׳ נקי": "גראנג׳ נקי",
  "גרוטסקי": "גרוטסקי",
  "דה סטייל": "דה סטייל",
  "דו לשוני": "דו לשוני",
  "דיגיטלי": "דיגיטלי",
  "דינמי": "דינמי",
  "דפוס": "דפוס",
  "דקיק": "דקיק",
  "דרוגולין": "דרוגולין",
  "הגדה": "הגדה",
  "היברידי": "היברידי",
  "הצבי": "הצבי",
  "הרמוני": "הרמוני",
  "הרצל": "הרצל",
  "וינטג׳": "וינטג׳",
  "זורם": "זורם",
  "חברותי": "חברותי",
  "חגיגי": "חגיגי",
  "חופשי": "חופשי",
  "חידוש": "חידוש",
  "חינני": "חינני",
  "חלול": "חלול",
  "חלוצי": "חלוצי",
  "חקוק": "חקוק",
  "טוש מכחול": "טוש מכחול",
  "טוש מכחול יפני": "טוש מכחול יפני",
  "טכנולוגי": "טכנולוגי",
  "טקסט קצר": "טקסט קצר",
  "טריפגוני": "טריפגוני",
  "טרפז": "טרפז",
  "ידידותי": "ידידותי",
  "ידני": "ידני",
  "יוגנדסטיל": "יוגנדסטיל",
  "יוסף באו": "יוסף באו",
  "יידיש": "יידיש",
  "ילדותי": "ילדותי",
  "ילדים": "ילדים",
  "ירושלמי": "ירושלמי",
  "ישראלי": "ישראלי",
  "כבד": "כבד",
  "כותרות": "כותרות",
  "כיפי": "כיפי",
  "כרזה": "כרזה",
  "כתב אשכנזי": "כתב אשכנזי",
  "כתב יד": "כתב יד",
  "כתיבה תמה": "כתיבה תמה",
  "לוגו שמן": "לוגו שמן",
  "לטיני": "לטיני",
  "לטרינג": "לטרינג",
  "לימודי": "לימודי",
  "מאויר": "מאויר",
  "מגוון": "מגוון",
  "מגזיני": "מגזיני",
  "מדויק": "מדויק",
  "מודעות ישנות": "מודעות ישנות",
  "מודעת אבל": "מודעת אבל",
  "מודרני": "מודרני",
  "מוחצן": "מוחצן",
  "מונוליין": "מונוליין",
  "מונוספייס": "מונוספייס",
  "מוסדי": "מוסדי",
  "מוקצן": "מוקצן",
  "מחוספס": "מחוספס",
  "מיוחד": "מיוחד",
  "מינימלי": "מינימלי",
  "מיקסטייפ": "מיקסטייפ",
  "מכונת כתיבה": "מכונת כתיבה",
  "מכחול": "מכחול",
  "מלא חיים": "מלא חיים",
  "ממלכתי": "ממלכתי",
  "מסורתי": "מסורתי",
  "מעוגל": "מעוגל",
  "מעוטר": "מעוטר",
  "מפתיע": "מפתיע",
  "מקורות": "מקורות",
  "מרובע": "מרובע",
  "משוחרר": "משוחרר",
  "משורבט": "משורבט",
  "משתנה": "משתנה",
  "נאיבי": "נאיבי",
  "נוסטלגי": "נוסטלגי",
  "נועז": "נועז",
  "נטוי": "נטוי",
  "נטוי אחורה": "נטוי אחורה",
  "ניאו קלאסי": "ניאו קלאסי",
  "ניאון": "ניאון",
  "ניטרלי": "ניטרלי",
  "נסיוני": "נסיוני",
  "נע": "נע",
  "נקי": "נקי",
  "סובייטי": "סובייטי",
  "סלאב": "סלאב",
  "סלאב מתומן": "סלאב מתומן",
  "ספונטני": "ספונטני",
  "ספורטיבי": "ספורטיבי",
  "ספרים": "ספרים",
  "סקריפט": "סקריפט",
  "סריף": "סריף",
  "סריף מרובע": "סריף מרובע",
  "סריפי": "סריפי",
  "סריפי מאויר": "סריפי מאויר",
  "עברי מסורתי": "עברי מסורתי",
  "עברי קלאסי": "עברי קלאסי",
  "עגול": "עגול",
  "עיתונות": "עיתונות",
  "עכשווי": "עכשווי",
  "עץ בלט": "עץ בלט",
  "פורץ דרך": "פורץ דרך",
  "פלוני": "פלוני",
  "פסיכדלי": "פסיכדלי",
  "פשוט": "פשוט",
  "צבעוני": "צבעוני",
  "ציוני": "ציוני",
  "צעיר": "צעיר",
  "צר": "צר",
  "קוד": "קוד",
  "קולמוס": "קולמוס",
  "קומיקס": "קומיקס",
  "קונטרסט בינוני": "קונטרסט בינוני",
  "קונטרסט גבוה": "קונטרסט גבוה",
  "קונטרסט הפוך": "קונטרסט הפוך",
  "קונטרסט נמוך": "קונטרסט נמוך",
  "קורסיבי": "קורסיבי",
  "קלאסי": "קלאסי",
  "קליגרפי": "קליגרפי",
  "קצוות אלכסוניים": "קצוות אלכסוניים",
  "קריאות גבוהה": "קריאות גבוהה",
  "קשת": "קשת",
  "רב-משקלים": "רב-משקלים",
  "רבייבל": "רבייבל",
  "רהוט": "רהוט",
  "רוסי": "רוסי",
  "רחב": "רחב",
  "רטרו": "רטרו",
  "ריבועי": "ריבועי",
  "ריבייבל": "ריבייבל",
  "רך": "רך",
  "רש״י": "רש״י",
  "שבלונה": "שבלונה",
  "שובב": "שובב",
  "שילוט": "שילוט",
  "שימושי": "שימושי",
  "שכבות": "שכבות",
  "שמח": "שמח",
  "שמן": "שמן",
  "שמנמן": "שמנמן",
  "שנות 20": "שנות 20",
  "שנות 30": "שנות 30",
  "שנות 50": "שנות 50",
  "שנות 60": "שנות 60",
  "שנות 70": "שנות 70",
  "שנות 80": "שנות 80",
  "תיאטרלי": "תיאטרלי",
  "תל אביב": "תל אביב",
  "תלת לשוני": "תלת לשוני",
  "תעמולה": "תעמולה",
  "תקופת היישוב": "תקופת היישוב",
};

const ERAS = [
  { id: "pre2010", label: "עד 2009",   test: (y) => y !== null && y <= 2009 },
  { id: "e2010",   label: "2010–2014", test: (y) => y !== null && y >= 2010 && y <= 2014 },
  { id: "e2015",   label: "2015–2019", test: (y) => y !== null && y >= 2015 && y <= 2019 },
  { id: "e2020",   label: "+2020",     test: (y) => y !== null && y >= 2020 },
];

// helper: f(name, latin, foundry, designer, year, styles, uses, tags, weights, url)
const f = (n, lat, fo, d, y, st, use, tg, w, url) => ({ n, lat, fo, d, y, st, use, tg, w, url });

const FONTS = [
  /* ---- aaa (37) ---- */
  {n:"אטלס",lat:"Atlas",fo:"aaa",d:"אברהם קורנפלד",y:2009,st:["sans"],use:["display", "text"],tg:["bilingual", "multilingual", "niqqud"],w:6,url:"https://alefalefalef.co.il/font/atlas/",vb:["מודרני"]},
  {n:"סינופסיס",lat:"Synopsis",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["serif"],use:["book", "text", "display"],tg:[],w:5,url:"https://alefalefalef.co.il/font/synopsis/",vb:["אלגנטי", "מגזיני"]},
  {n:"אמביוולנטי נורמל",lat:"Ambivalenti",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans", "slab"],use:["display"],tg:["bilingual", "niqqud"],w:7,url:"https://alefalefalef.co.il/font/ambivalenti/",vb:["מרובע"]},
  {n:"אמביוולנטי צר",lat:"Ambivalenti Tzar",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans", "slab"],use:["display"],tg:["bilingual", "multilingual", "narrow", "niqqud"],w:7,url:"https://alefalefalef.co.il/font/ambivalenti-tzar/",vb:["מרובע"]},
  {n:"אמביוולנטי קומפרסט",lat:"Ambivalenti Compressed",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans", "slab"],use:["display"],tg:["bilingual", "narrow"],w:7,url:"https://alefalefalef.co.il/font/ambivalenti-compressed/",vb:["מרובע"]},
  {n:"אמביוולנטי רחב",lat:"Ambivalenti Wide",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans", "slab"],use:["display"],tg:["bilingual", "wide"],w:7,url:"https://alefalefalef.co.il/font/ambivalenti-wide/",vb:["מרובע"]},
  {n:"נוילנד",lat:"Noyland",fo:"aaa",d:"נוי ניימן",y:2011,st:["sans"],use:["display"],tg:["bilingual", "rounded", "nostalgic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/noyland/",vb:["וינטג׳", "שובב"]},
  {n:"אלמוני",lat:"Almoni",fo:"aaa",d:"אברהם קורנפלד",y:2012,st:["sans"],use:["text", "display"],tg:["bilingual", "multilingual", "niqqud"],w:10,url:"https://alefalefalef.co.il/font/almoni/",vb:["מודרני"]},
  {n:"אלמוני צר",lat:"Almoni Tzar",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans"],use:["display"],tg:["bilingual", "multilingual", "narrow", "niqqud"],w:7,url:"https://alefalefalef.co.il/font/almoni-tzar/",vb:["מודרני"]},
  {n:"מקומי",lat:"Mekomi",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["serif"],use:["text", "display"],tg:["bilingual", "multilingual", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/mekomi/",vb:["מגזיני"]},
  {n:"סטנגה",lat:"Stanga",fo:"aaa",d:"ערן בכרך + אנה חורש",y:2012,st:["sans"],use:["display"],tg:["bilingual", "narrow", "rounded"],w:6,url:"https://alefalefalef.co.il/font/stanga/",vb:["ספורטיבי"]},
  {n:"אסימון דו־לשוני",lat:"Asimon",fo:"aaa",d:"אברהם קורנפלד",y:2012,st:["sans", "serif"],use:["text", "display"],tg:["bilingual", "nostalgic", "niqqud"],w:8,url:"https://alefalefalef.co.il/font/asimon/",vb:["וינטג׳"]},
  {n:"מוגרבי",lat:"Mugrabi",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["serif", "stencil"],use:["display"],tg:["nostalgic", "classic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/mugrabi/",vb:["וינטג׳", "אלגנטי"]},
  {n:"בר־לב",lat:"Barlev",fo:"aaa",d:"נדב ברקן + נוי ניימן",y:2013,st:["sans"],use:["display"],tg:["bilingual", "narrow", "nostalgic", "niqqud"],w:6,url:"https://alefalefalef.co.il/font/barlev/",vb:["וינטג׳"]},
  {n:"פרנק־רי",lat:"Frank-Re",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["serif"],use:["book", "text", "display"],tg:["bilingual", "nostalgic", "classic", "niqqud", "revival"],w:6,url:"https://alefalefalef.co.il/font/frank-re/",vb:["אלגנטי", "מגזיני"]},
  {n:"פרנק־רי צר",lat:"Frank-Re Tzar",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["serif"],use:["book", "text"],tg:["bilingual", "narrow", "classic", "revival"],w:6,url:"https://alefalefalef.co.il/font/frank-re-tzar/",vb:["אלגנטי", "מגזיני"]},
  {n:"פעמון",lat:"Paamon",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["sans", "slab"],use:["display"],tg:["bilingual", "nostalgic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/paamon/",vb:["וינטג׳"]},
  {n:"קרוואן",lat:"Caravan",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["sans", "slab"],use:["display"],tg:["bilingual", "wide", "nostalgic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/caravan/",vb:["וינטג׳", "מרובע"]},
  {n:"תעמולה",lat:"Taamula",fo:"aaa",d:"אברהם קורנפלד",y:2015,st:["sans"],use:["display"],tg:["bilingual", "multilingual", "narrow", "nostalgic", "niqqud"],w:6,url:"https://alefalefalef.co.il/font/taamula/",vb:["וינטג׳"]},
  {n:"מכמורת",lat:"Mikhmoret",fo:"aaa",d:"אברהם קורנפלד",y:2017,st:["sans"],use:["display"],tg:["bilingual", "narrow", "niqqud"],w:4,url:"https://alefalefalef.co.il/font/mikhmoret/",vb:["וינטג׳"]},
  {n:"מכמורת מעוגל",lat:"Mikhmoret Rounded",fo:"aaa",d:"אברהם קורנפלד",y:2017,st:["sans"],use:["display"],tg:["bilingual", "narrow", "rounded", "niqqud"],w:3,url:"https://alefalefalef.co.il/font/mikhmoret-rounded/",vb:["ידידותי"]},
  {n:"שלוק",lat:"Shluk",fo:"aaa",d:"שביט יעקב + אנה חורש",y:2017,st:["hand"],use:["display"],tg:["bilingual", "rounded", "niqqud"],w:1,url:"https://alefalefalef.co.il/font/shluk/",vb:["קליגרפי", "שובב"]},
  {n:"אפק",lat:"Afek",fo:"aaa",d:"אברהם קורנפלד",y:2017,st:["sans"],use:["text", "display"],tg:["bilingual", "niqqud"],w:8,url:"https://alefalefalef.co.il/font/afek/",vb:["מודרני"]},
  {n:"פלוני",lat:"Ploni",fo:"aaa",d:"אברהם קורנפלד",y:2018,st:["sans"],use:["text", "display"],tg:["bilingual", "multilingual", "niqqud"],w:8,url:"https://alefalefalef.co.il/font/ploni/",vb:["מודרני", "ידידותי"]},
  {n:"פלוני יד",lat:"Ploni Yad",fo:"aaa",d:"אברהם קורנפלד",y:2018,st:["hand", "sans"],use:["display"],tg:["niqqud"],w:8,url:"https://alefalefalef.co.il/font/ploni-yad/",vb:["קליגרפי", "ידידותי"]},
  {n:"פלוני מעוגל",lat:"Ploni Round",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans"],use:["text", "display"],tg:["bilingual", "multilingual", "rounded"],w:6,url:"https://alefalefalef.co.il/font/ploni-round/",vb:["ידידותי"]},
  {n:"פלוני צר",lat:"Ploni Tzar",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans"],use:["text", "display"],tg:["bilingual", "narrow"],w:7,url:"https://alefalefalef.co.il/font/ploni-tzar/",vb:["מודרני"]},
  {n:"אנומליה",lat:"Anomalia",fo:"aaa",d:"אברהם קורנפלד",y:2018,st:["sans"],use:["display"],tg:["bilingual", "multilingual", "niqqud"],w:7,url:"https://alefalefalef.co.il/font/anomalia/",vb:["מיוחד", "מודרני"]},
  {n:"קדם סריף",lat:"Kedem Serif",fo:"aaa",d:"אברהם קורנפלד",y:2020,st:["serif"],use:["display"],tg:["bilingual", "multilingual", "wide", "nostalgic", "niqqud"],w:6,url:"https://alefalefalef.co.il/font/kedem-serif/",vb:["וינטג׳", "אלגנטי"]},
  {n:"קדם סנס",lat:"Kedem Sans",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans"],use:["display"],tg:["bilingual", "multilingual", "wide", "nostalgic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/kedem-sans/",vb:["וינטג׳"]},
  {n:"אינדקס",lat:"Index",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans"],use:["display"],tg:["bilingual", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/index/",vb:["טכנולוגי", "מודרני"]},
  {n:"אינדקס מונו",lat:"Index Mono",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans", "mono"],use:["display"],tg:["bilingual", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/index-mono/",vb:["טכנולוגי"]},
  {n:"גלוריה",lat:"Gloria",fo:"aaa",d:null,y:null,st:["sans"],use:["display"],tg:["bilingual", "wide", "niqqud"],w:null,url:"https://alefalefalef.co.il/font/gloria/",vb:["רחב", "מעוגל", "צעיר", "עכשווי"]},
  {n:"לוי",lat:"Levi",fo:"aaa",d:null,y:null,st:["serif"],use:["display"],tg:["bilingual", "classic"],w:null,url:"https://alefalefalef.co.il/font/levi/",vb:["אות מקורות", "כתב אשכנזי", "וינטג׳", "עכשווי"]},
  {n:"אוונטה",lat:"Awanta",fo:"aaa",d:null,y:null,st:["hand"],use:["display"],tg:["bilingual"],w:null,url:"https://alefalefalef.co.il/font/awanta/",vb:["קליגרפי", "שמח", "מודעות ישנות", "וינטג׳"]},
  {n:"פריימריז",lat:"Primaries",fo:"aaa",d:null,y:null,st:["sans"],use:["display"],tg:["bilingual"],w:null,url:"https://alefalefalef.co.il/font/primaries/",vb:["גאומטרי", "נקי", "מודרני"]},
  {n:"קארמה",lat:"Karma",fo:"aaa",d:null,y:null,st:["serif"],use:["display"],tg:["bilingual", "niqqud"],w:null,url:"https://alefalefalef.co.il/font/karma/",vb:["קולמוס", "זורם", "קונטרסט נמוך"]},
  /* ---- fontimonim (73) ---- */
  {n:"אבג",lat:"Obege",fo:"fontimonim",d:"רוני קוך",y:2019,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/obege/",vb:["כתב יד", "שובב", "נוסטלגי", "מודעות ישנות"]},
  {n:"אביגול",lat:"Avigul",fo:"fontimonim",d:"איל באומרט",y:2018,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/avigul/",vb:["קליגרפי", "צר", "כתב יד", "מדויק"]},
  {n:"אגוזים",lat:"Egozim",fo:"fontimonim",d:"מאור אהרון",y:2022,st:["serif"],use:["display"],tg:["rounded"],w:null,url:"https://fontimonim.co.il/font/egozim/",vb:["שובב", "ידידותי", "סריפי מאויר", "קליגרפי", "ספונטני", "עגול"]},
  {n:"אוסקר",lat:"Oscar",fo:"fontimonim",d:null,y:2020,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/oscar/",vb:["מונוליין", "מעוגל", "גאומטרי", "לוגו שמן"]},
  {n:"אוסקר צר",lat:"Oscar Tzar",fo:"fontimonim",d:null,y:null,st:["sans"],use:["display"],tg:["narrow"],w:null,url:"https://fontimonim.co.il/font/oscar-tzar/",vb:["מונוליין", "גאומטרי", "לוגו שמן", "צר"]},
  {n:"אורון צר",lat:"Oron Tzar",fo:"fontimonim",d:"אשר אורון",y:1966,st:["sans"],use:["display"],tg:["narrow", "classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-tzar/",vb:["וינטג׳", "גאומטרי", "עברי קלאסי", "צר", "מרובע"]},
  {n:"אורון קלאסי",lat:"Oron Classic",fo:"fontimonim",d:"אשר אורון",y:1966,st:["sans"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-classic/",vb:["וינטג׳", "גאומטרי", "עברי קלאסי", "פורץ דרך", "מרובע"]},
  {n:"אורון קשת",lat:"Oron Keshet",fo:"fontimonim",d:"אשר אורון",y:null,st:["sans"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-keshet/",vb:["וינטג׳", "גאומטרי", "עברי קלאסי", "קשת"]},
  {n:"אורון רחב",lat:"Oron Wide",fo:"fontimonim",d:"אשר אורון",y:null,st:["sans"],use:["display"],tg:["wide", "classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-wide/",vb:["וינטג׳", "גאומטרי", "עברי קלאסי", "רחב"]},
  {n:"אורון תבנית",lat:"Oron Tavnit",fo:"fontimonim",d:"אשר אורון",y:null,st:["sans", "stencil"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-tavnit/",vb:["וינטג׳", "גאומטרי", "שבלונה"]},
  {n:"אותיותי",lat:"Otiyoti",fo:"fontimonim",d:null,y:null,st:["sans"],use:["display"],tg:["free"],w:null,url:"https://fontimonim.co.il/font/otiyoti/",vb:["מרובע", "ידידותי", "ריבועי", "לימודי", "כתיבה תמה"]},
  {n:"אייקונימונים",lat:"Iconimonim",fo:"fontimonim",d:"אברהם קורנפלד",y:2016,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/iconimonim/",vb:["שובב", "אייקונים", "שימושי"]},
  {n:"איצטרובל",lat:"Itstrubal",fo:"fontimonim",d:null,y:2020,st:["serif"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/itstrubal/",vb:["הצבי", "חלול", "קלאסי", "מיוחד"]},
  {n:"אקסיומה",lat:"Axioma",fo:"fontimonim",d:null,y:2024,st:["sans"],use:["display", "text"],tg:[],w:null,url:"https://fontimonim.co.il/font/axioma/",vb:["גאומטרי", "נועז", "מיוחד", "מפתיע"]},
  {n:"ארצי",lat:"Artzi",fo:"fontimonim",d:"פירמה + שביט יעקב",y:2019,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/artzi/",vb:["וינטג׳", "ישראלי", "ציוני", "מיוחד", "חגיגי"]},
  {n:"אשכוליתה",lat:"Eshkolita",fo:"fontimonim",d:null,y:2020,st:["hand"],use:["display"],tg:["rounded"],w:null,url:"https://fontimonim.co.il/font/eshkolita/",vb:["שובב", "ידידותי", "כתב יד", "נוסטלגי", "נאיבי", "ילדותי"]},
  {n:"באבא",lat:"Baba",fo:"fontimonim",d:null,y:2020,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/baba/",vb:["שובב", "מרובע", "שמנמן", "שכבות"]},
  {n:"בגירה",lat:"Bagira",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/bagira/",vb:["מונוליין", "קליגרפי", "כתב יד", "הרמוני", "אישי"]},
  {n:"בולדר",lat:"Bolder",fo:"fontimonim",d:null,y:2022,st:["serif"],use:["display"],tg:["wide"],w:null,url:"https://fontimonim.co.il/font/bolder/",vb:["מרובע", "סריפי", "כבד", "נועז", "קונטרסט גבוה"]},
  {n:"בומבסטה",lat:"Bombasta",fo:"fontimonim",d:null,y:2021,st:["hand"],use:["display"],tg:["wide"],w:null,url:"https://fontimonim.co.il/font/bombasta/",vb:["מרובע", "כתב יד", "קליגרפי", "מגוון", "חופשי"]},
  {n:"במברגר גראנג׳",lat:"Bamberger Grunge",fo:"fontimonim",d:null,y:2020,st:["hand"],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/bamberger-grunge/",vb:["גראנג׳", "וינטג׳", "מחוספס", "אנרגטי", "ידני"]},
  {n:"במברגר חד",lat:"Bamberger Sharp",fo:"fontimonim",d:null,y:2024,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/bamberger-sharp/",vb:["וינטג׳", "מרובע", "עכשווי", "מדויק", "גראנג׳ נקי"]},
  {n:"בנצ׳מרק",lat:"Benchmark",fo:"fontimonim",d:null,y:2018,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/benchmark/",vb:["כתב יד", "ספורטיבי", "נוסטלגי", "גראנג׳"]},
  {n:"ברונו",lat:"Bruno",fo:"fontimonim",d:null,y:2018,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/bruno/",vb:["ניאון", "ירושלמי", "וינטג׳", "ידני"]},
  {n:"ברנדה",lat:"Brenda",fo:"fontimonim",d:null,y:2018,st:["slab"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/brenda/",vb:["סלאב מתומן", "גאומטרי", "טרפז", "מיוחד"]},
  {n:"ג׳ינג׳ר",lat:"Ginger",fo:"fontimonim",d:null,y:2019,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/ginger/",vb:["שובב", "סקריפט", "גראנג׳", "קומיקס", "צעיר"]},
  {n:"ג׳קלין",lat:"Jacqueline",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/jacqueline/",vb:["אלגנטי", "קלאסי"]},
  {n:"גרמושקה",lat:"Garmoshka",fo:"fontimonim",d:null,y:2022,st:["hand"],use:["display"],tg:["narrow"],w:null,url:"https://fontimonim.co.il/font/garmoshka/",vb:["מיוחד", "כתב יד", "שובב", "אופטימי", "עגול", "רטרו"]},
  {n:"דידה",lat:"Dida",fo:"fontimonim",d:null,y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/dida/",vb:["אות מקורות", "ניאו קלאסי", "יוגנדסטיל", "אלגנטי"]},
  {n:"דמקה",lat:"Damka",fo:"fontimonim",d:null,y:2018,st:["serif"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/damka/",vb:["גאומטרי", "קונטרסט הפוך", "אקסטרווגנטי", "תיאטרלי", "אלגנטי"]},
  {n:"האוזר",lat:"Hauser",fo:"fontimonim",d:null,y:2021,st:["serif"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/hauser/",vb:["סריף", "ממלכתי", "הרצל", "קלאסי"]},
  {n:"הדס באו",lat:"Hadasbau",fo:"fontimonim",d:null,y:2022,st:["serif"],use:["display"],tg:["revival"],w:null,url:"https://fontimonim.co.il/font/hadasbau/",vb:["גאומטרי", "נסיוני", "קליגרפי", "סריפי", "יוסף באו", "ידני", "וינטג׳"]},
  {n:"וארלה אקסטרה",lat:"Varela Extra",fo:"fontimonim",d:null,y:2020,st:["sans"],use:["display"],tg:["rounded"],w:null,url:"https://fontimonim.co.il/font/varela-extra/",vb:["ידידותי", "עגול", "צעיר", "גוגל פונטס", "נקי"]},
  {n:"זבולון",lat:"Zvulun",fo:"fontimonim",d:null,y:2019,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/zvulun/",vb:["היברידי", "רהוט", "נועז", "מיוחד"]},
  {n:"חביבי",lat:"Habibi",fo:"fontimonim",d:null,y:2018,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/habibi/",vb:["ידידותי", "גראנג׳", "חלול", "זורם"]},
  {n:"חיים גראנג׳",lat:"Haim Grunge",fo:"fontimonim",d:null,y:2023,st:["sans"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/haim-grunge/",vb:["גראנג׳", "וינטג׳", "עץ בלט", "אקספרסיבי"]},
  {n:"חיים קלאסי",lat:"Haim Classic",fo:"fontimonim",d:null,y:2017,st:["sans"],use:["display"],tg:["classic", "revival", "niqqud"],w:null,url:"https://fontimonim.co.il/font/haim-classic/",vb:["וינטג׳", "גאומטרי", "מרובע", "בסיסי", "ריבייבל", "עברי קלאסי"]},
  {n:"טוליטון",lat:"Toliton",fo:"fontimonim",d:null,y:2017,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/toliton/",vb:["נוסטלגי", "מודעות ישנות", "נטוי אחורה", "ישראלי"]},
  {n:"טליזמן",lat:"Talizman",fo:"fontimonim",d:null,y:2021,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/talizman/",vb:["מונוספייס", "קונטרסט הפוך", "עגול", "מיוחד"]},
  {n:"טרבלסי",lat:"Trabelsi",fo:"fontimonim",d:null,y:2018,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/trabelsi/",vb:["קליגרפי", "אקספרסיבי", "חינני"]},
  {n:"יו־יו",lat:"Yoyo",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/yoyo/",vb:["שובב", "קליגרפי", "טוש מכחול", "אנרגטי", "מלא חיים"]},
  {n:"יידישקייט",lat:"Yiddishkeit",fo:"fontimonim",d:null,y:2018,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/yiddishkeit/",vb:["וינטג׳", "גראנג׳", "יידיש", "עץ בלט"]},
  {n:"לובלין",lat:"Lublin",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/lublin/",vb:["קליגרפי", "ידידותי", "זורם", "אופטימי", "רך"]},
  {n:"מאוריציוס",lat:"Mauritius",fo:"fontimonim",d:null,y:2017,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/mauritius/",vb:["מאויר", "ילדים", "כיפי", "צבעוני"]},
  {n:"מוזיאון",lat:"Museum",fo:"fontimonim",d:null,y:2012,st:["slab"],use:["display"],tg:["bilingual"],w:null,url:"https://fontimonim.co.il/font/museum/",vb:["אלגנטי", "סלאב", "כיפי", "לטיני", "דו לשוני"]},
  {n:"מוטל׳ה",lat:"Motaleh",fo:"fontimonim",d:null,y:2020,st:["hand"],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/motaleh/",vb:["וינטג׳", "נטוי", "ספורטיבי", "אסרטיבי", "לטרינג"]},
  {n:"מיקסטייפ",lat:"Mixtape",fo:"fontimonim",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/mixtape/",vb:["טכנולוגי", "דיגיטלי", "מיקסטייפ"]},
  {n:"סולומון",lat:"Solomon",fo:"fontimonim",d:null,y:2018,st:["serif"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/solomon/",vb:["מקורות", "נטוי", "אחים שמיר", "וינטג׳"]},
  {n:"סופי סנס",lat:"Sofi Sans",fo:"fontimonim",d:null,y:2022,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/sofi-sans/",vb:["פסיכדלי", "שנות 70", "עגול", "מוקצן"]},
  {n:"סופי סריף",lat:"Sofi Serif",fo:"fontimonim",d:null,y:2022,st:["serif"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/sofi-serif/",vb:["פסיכדלי", "שנות 70", "עגול", "מוקצן"]},
  {n:"ספיר קלאסי",lat:"Sapir Classic",fo:"fontimonim",d:null,y:null,st:["sans"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/sapir-classic/",vb:["אלגנטי", "באוהאוס", "דה סטייל", "גאומטרי", "שנות 30"]},
  {n:"ספקטרום",lat:"Spectrum",fo:"fontimonim",d:null,y:2013,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/spectrum/",vb:["שכבות", "שנות 80", "שילוט", "נוסטלגי"]},
  {n:"עומס",lat:"Omes",fo:"fontimonim",d:null,y:2020,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/omes/",vb:["נסיוני", "ילדותי", "בסיסי", "ספונטני", "פשוט"]},
  {n:"פלמינגו",lat:"Flamingo",fo:"fontimonim",d:null,y:2019,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/flamingo/",vb:["שובב", "מונוליין", "קורסיבי", "ניאון", "שנות 50"]},
  {n:"פלסיבו",lat:"Placebo",fo:"fontimonim",d:null,y:null,st:["sans"],use:["display"],tg:["bilingual"],w:null,url:"https://fontimonim.co.il/font/placebo/",vb:["מיוחד", "מודרני", "מוחצן", "ארץ ישראלי", "חלוצי"]},
  {n:"פרשנדתא",lat:"Parshendata",fo:"fontimonim",d:null,y:2017,st:["hand"],use:["display"],tg:["classic"],w:null,url:"https://fontimonim.co.il/font/parshendata/",vb:["וינטג׳", "רש״י", "קליגרפי", "רהוט", "מסורתי"]},
  {n:"ציפלון",lat:"Tziflon",fo:"fontimonim",d:null,y:2021,st:["hand"],use:["display"],tg:["narrow"],w:null,url:"https://fontimonim.co.il/font/tziflon/",vb:["שובב", "חלול", "צר", "ידני"]},
  {n:"צלילה־באו",lat:"Tslilabau",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:["revival"],w:null,url:"https://fontimonim.co.il/font/tslilabau/",vb:["גאומטרי", "נסיוני", "קליגרפי", "יוסף באו", "שנות 70", "זורם"]},
  {n:"קלוגמן",lat:"Klugman",fo:"fontimonim",d:null,y:2019,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/klugman/",vb:["גראנג׳", "צר", "מכחול", "ידני", "חברותי"]},
  {n:"קלפיון",lat:"Kalpion",fo:"fontimonim",d:"עידו בק",y:2019,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/kalpion/",vb:["מאויר", "גראנג׳", "כרזה", "אקספרסיבי"]},
  {n:"קריספר",lat:"Krisper",fo:"fontimonim",d:null,y:2020,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/krisper/",vb:["נוסטלגי", "כרזה", "שנות 50", "שכבות", "תעמולה"]},
  {n:"רביצקי",lat:"Ravitzky",fo:"fontimonim",d:null,y:2022,st:["slab"],use:["display"],tg:["nostalgic", "classic", "revival"],w:null,url:"https://fontimonim.co.il/font/ravitzky/",vb:["וינטג׳", "סלאב", "תקופת היישוב", "חקוק", "קלאסי"]},
  {n:"רבקה־באו",lat:"Rivkabau",fo:"fontimonim",d:null,y:2013,st:["hand"],use:["display"],tg:["revival"],w:null,url:"https://fontimonim.co.il/font/rivkabau/",vb:["גאומטרי", "נסיוני", "קורסיבי", "יוסף באו", "שנות 60", "זורם"]},
  {n:"רוגטקה",lat:"Rugatka",fo:"fontimonim",d:null,y:2020,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/rugatka/",vb:["שובב", "קליגרפי", "אקספרסיבי", "שנות 60"]},
  {n:"ריטריט",lat:"Retreat",fo:"fontimonim",d:null,y:2022,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/retreat/",vb:["משורבט", "חברותי", "משוחרר", "פלוני"]},
  {n:"רקיע",lat:"Rakia",fo:"fontimonim",d:null,y:2024,st:["serif"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/rakia/",vb:["רבייבל", "רוסי", "חגיגי", "מעוטר"]},
  {n:"שביס",lat:"Shavis",fo:"fontimonim",d:null,y:2019,st:["serif"],use:["display"],tg:["nostalgic", "classic", "revival", "grunge"],w:null,url:"https://fontimonim.co.il/font/shavis/",vb:["וינטג׳", "גראנג׳", "גותי", "דרוגולין", "ריבייבל"]},
  {n:"שיק",lat:"Szyk",fo:"fontimonim",d:null,y:2022,st:["serif"],use:["display"],tg:["nostalgic", "classic", "revival"],w:null,url:"https://fontimonim.co.il/font/szyk/",vb:["וינטג׳", "קולמוס", "הגדה", "קלאסי", "קליגרפי", "1936"]},
  {n:"שירבושקה",lat:"Shirbushka",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/shirbushka/",vb:["קליגרפי", "כתב יד", "קורסיבי"]},
  {n:"שליט״א",lat:"Shlita",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:["classic"],w:null,url:"https://fontimonim.co.il/font/shlita/",vb:["וינטג׳", "עברי מסורתי", "כתב יד"]},
  {n:"שסק",lat:"Shesek",fo:"fontimonim",d:null,y:2019,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/shesek/",vb:["כתב יד", "כתיבה תמה", "עגול", "ילדים"]},
  {n:"שפגאט",lat:"Shpagat",fo:"fontimonim",d:null,y:2024,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/shpagat/",vb:["מיוחד", "קליגרפי", "טוש מכחול יפני", "אופטימי", "שנות 20"]},
  {n:"תאום",lat:"Teom",fo:"fontimonim",d:null,y:2020,st:["sans"],use:["display", "text"],tg:[],w:null,url:"https://fontimonim.co.il/font/teom/",vb:["Tahoma", "ניטרלי", "ידידותי", "בסיסי"]},
  /* ---- hagilda (73) ---- */
  {n:"פרנקריהל Universal",lat:"FrankRuhl Universal",fo:"hagilda",d:"מיכל סהר",y:null,st:["serif"],use:["book", "text"],tg:["bilingual", "classic", "revival"],w:null,url:"https://hagilda.com/frankruhluniversal/",vb:["אלגנטי", "מגזיני"]},
  {n:"סקולו",lat:"Secolo",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/secolo/",vb:["מודרני"]},
  {n:"ראפידה",lat:"Rapida",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["sans"],use:["display"],tg:["trilingual"],w:null,url:"https://hagilda.com/rapidaheblatar/",vb:["ספורטיבי", "מודרני"]},
  {n:"לאבה פרו",lat:"Lava Pro",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual"],w:null,url:"https://hagilda.com/lava-prohl/",vb:["מגזיני"]},
  {n:"רולי חדש",lat:"Roli New",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/roli_new/",vb:["שובב"]},
  {n:"גרטה סריף וריאבל",lat:"Greta Serif Variable",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual", "variable"],w:null,url:"https://hagilda.com/greta-serif-variable/",vb:["ספרים", "דפוס", "קריאות גבוהה"]},
  {n:"פדרה סנס וריאבל",lat:"Fedra Sans Variable",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["sans"],use:["text"],tg:["bilingual", "variable"],w:null,url:"https://hagilda.com/fedra-sans-variable/",vb:["מודרני"]},
  {n:"TheBasics",lat:"TheBasics",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "brand"],tg:["bilingual"],w:null,url:"https://hagilda.com/thebasics/",vb:["מודרני"]},
  {n:"TheBasics Corporate",lat:"TheBasics Corporate",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "brand"],tg:["bilingual"],w:null,url:"https://hagilda.com/thebasicscorporate/",vb:["מודרני"]},
  {n:"אלפא/Bravo",lat:"Alfa/Bravo",fo:"hagilda",d:"מיכל סהר, אורי בן דור",y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/alfabravo/",vb:["קריאות גבוהה", "קליגרפי", "מיוחד"]},
  {n:"אלפא/Bravo מונו",lat:"Alfa/Bravo Mono",fo:"hagilda",d:"מיכל סהר, אורי בן דור",y:null,st:["mono", "sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/alfabravomono/",vb:["מונוספייס", "קריאות גבוהה", "מיוחד"]},
  {n:"רציף 22",lat:"Ratzif 22",fo:"hagilda",d:"מיכל סהר, אמיר אברהם",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/ratzif22/",vb:["וינטג׳"]},
  {n:"רענן Pro",lat:"Raanan Pro",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/raananpro/",vb:["מודרני"]},
  {n:"סקייטר",lat:"Skater",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://hagilda.com/skater/",vb:["קליגרפי", "ספורטיבי"]},
  {n:"אדיטור סריף Pro",lat:"Editor Serif Pro",fo:"hagilda",d:"מיכל סהר",y:null,st:["serif"],use:["text", "book"],tg:["trilingual"],w:null,url:"https://hagilda.com/editorserifprohlar/",vb:["בסיסי", "קלאסי", "קריאות גבוהה", "רב-משקלים"]},
  {n:"אדיטור סנס Pro",lat:"Editor Sans Pro",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text"],tg:["trilingual"],w:null,url:"https://hagilda.com/editorsansprohlar/",vb:["בסיסי", "קלאסי", "קריאות גבוהה", "רב-משקלים"]},
  {n:"הטכנאי הצעיר",lat:"The Young Technay",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/theyoungtechnay/",vb:["טכנולוגי", "וינטג׳"]},
  {n:"כלבו",lat:"Colbo",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/colbo/",vb:["נוסטלגי", "וינטג׳", "כותרות", "מרובע"]},
  {n:"סימפלר Rounded",lat:"Simpler Rounded",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["text", "display"],tg:["rounded"],w:null,url:"https://hagilda.com/simplerprorounded/",vb:["ידידותי"]},
  {n:"סימפלר פרו",lat:"Simpler Pro",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["text", "display", "brand"],tg:["trilingual"],w:null,url:"https://hagilda.com/simplerprohlar/",vb:["מודרני"]},
  {n:"סימפלר פרו Ext",lat:"Simpler Pro Extended",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["trilingual", "wide"],w:null,url:"https://hagilda.com/simplerproextendedhlar/",vb:["מודרני"]},
  {n:"סימפלר פרו Con",lat:"Simpler Pro Condensed",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["narrow"],w:null,url:"https://hagilda.com/simplerprocondensded/",vb:["מודרני"]},
  {n:"סימפלר מונו",lat:"Simpler Mono",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["mono", "sans"],use:["text"],tg:["trilingual"],w:null,url:"https://hagilda.com/simplerprohlarmono/",vb:["טכנולוגי"]},
  {n:"סימפלר אלטע",lat:"Simpler Alte",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/simplerproalte/",vb:["וינטג׳"]},
  {n:"לויט 1950",lat:"Levit 1950",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:["nostalgic", "revival"],w:null,url:"https://hagilda.com/levit1950/",vb:["וינטג׳"]},
  {n:"לויט Blended",lat:"Levit Blended",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/levitblended/",vb:["וינטג׳", "נסיוני"]},
  {n:"קרטיב",lat:"Kartiv",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/kartiv/",vb:["שובב"]},
  {n:"ארטיק",lat:"Artic",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/artic/",vb:["כתב יד", "רחב", "שמן", "וינטג׳", "ישראלי", "ילדותי"]},
  {n:"גרטה טקסט Pro",lat:"Greta Text Pro",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual"],w:null,url:"https://hagilda.com/greta-text-prohl/",vb:["ספרים", "דפוס", "קריאות גבוהה"]},
  {n:"פדרה סריף Pro",lat:"Fedra Serif Pro",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual"],w:null,url:"https://hagilda.com/fedra-serif-prohl/",vb:["מגזיני"]},
  {n:"פדרה סנס Pro",lat:"Fedra Sans Pro",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["sans"],use:["text"],tg:["bilingual"],w:null,url:"https://hagilda.com/fedra-sans-prohl/",vb:["מודרני"]},
  {n:"מסדה",lat:"Masada",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/masada/",vb:["מודרני"]},
  {n:"מסדה Mono",lat:"Masada Mono",fo:"hagilda",d:"מיכל סהר",y:null,st:["mono"],use:["text"],tg:["bilingual"],w:null,url:"https://hagilda.com/masada-mono/",vb:["טכנולוגי"]},
  {n:"רענן",lat:"Raanan",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://hagilda.com/raanan/",vb:["מודרני"]},
  {n:"רענן רחב",lat:"Raanan Extended",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hagilda.com/raananextended/",vb:["מודרני"]},
  {n:"רענן צר",lat:"Raanan Condensed",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["narrow"],w:null,url:"https://hagilda.com/raanancondensed/",vb:["מודרני"]},
  {n:"סאנדיי",lat:"Sunday",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/sunday/",vb:["ידידותי"]},
  {n:"סאנדיי מונו",lat:"Sunday Mono",fo:"hagilda",d:"מיכל סהר",y:null,st:["mono"],use:["text", "display"],tg:[],w:null,url:"https://hagilda.com/sundaymono/",vb:["טכנולוגי"]},
  {n:"אינפרא",lat:"Infra",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/infra/",vb:["כתב יד", "רחב", "שמן", "וינטג׳", "ישראלי"]},
  {n:"80kb",lat:"80kb",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/80kb/",vb:["טכנולוגי", "מכונת כתיבה", "מונוספייס", "קוד"]},
  {n:"טיגריסיבירי",lat:"Tigrisibiri",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/tigrisibiri/",vb:["מיוחד"]},
  {n:"פונט #37",lat:"Font #37",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/font37heb/",vb:["נסיוני"]},
  {n:"לימונארק",lat:"Limonarak",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/limonarak/",vb:["שובב"]},
  {n:"קריסטייל",lat:"Cristyle",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/cristyle/",vb:["אלגנטי"]},
  {n:"מרים ליברה",lat:"Miriam Libre",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "display"],tg:["bilingual", "free", "revival"],w:null,url:"https://hagilda.com/miriam-libre/",vb:["וינטג׳", "מונוליין"]},
  {n:"השמנים",lat:"Hashmenim",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hagilda.com/hashmenim/",vb:["מרובע"]},
  {n:"מכבי בלוק",lat:"Maccabi Block",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/maccabiblock/",vb:["ספורטיבי", "וינטג׳"]},
  {n:"המעשן סנס",lat:"The Smoker Sans",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/thesmokersans/",vb:["וינטג׳"]},
  {n:"המעשן סריף",lat:"The Smoker Serif",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://hagilda.com/thesmokerserif/",vb:["וינטג׳"]},
  {n:"ארבל הגילדה",lat:"Arbel Hagilda",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "display"],tg:["classic", "revival"],w:null,url:"https://hagilda.com/arbelg/",vb:["מכונת כתיבה", "טכנולוגי", "קריאות גבוהה"]},
  {n:"סטנסילז",lat:"Stencilz",fo:"hagilda",d:"מיכל סהר, דני מירב (הטייס)",y:null,st:["stencil"],use:["display"],tg:[],w:null,url:"https://hagilda.com/stencilz/",vb:["ברוטליסטי"]},
  {n:"אינקישינוב",lat:"Inkishinov",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/inkishinov/",vb:["גרוטסקי", "מיוחד", "סובייטי", "סריף מרובע", "בלוק", "קונטרסט בינוני", "כרזה"]},
  {n:"ניוז",lat:"News",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://hagilda.com/news/",vb:["מגזיני"]},
  {n:"כוס חלב",lat:"A Glass of Milk",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://hagilda.com/aglassofmilk/",vb:["קליגרפי", "שובב"]},
  {n:"כוס חלב דפוס",lat:"Cos Halav Dfus",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://hagilda.com/coshalavdfus/",vb:["שובב"]},
  {n:"פרנקלי",lat:"Frankly",fo:"hagilda",d:"מיכל סהר",y:null,st:["serif"],use:["display"],tg:["classic"],w:null,url:"https://hagilda.com/frankly/",vb:["וינטג׳"]},
  {n:"פלסטיק",lat:"Plastic",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/plastic/",vb:["שובב", "מיוחד"]},
  {n:"מן",lat:"Man",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/man/",vb:[]},
  {n:"קו 16",lat:"Kav 16",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/kav16/",vb:["מונוליין", "גאומטרי"]},
  {n:"ניופונט",lat:"Newfont",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/newfont/",vb:["מודרני"]},
  {n:"חיים הגילדה",lat:"Haim Hagilda",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["classic", "narrow", "revival"],w:null,url:"https://hagilda.com/haimg/",vb:["וינטג׳", "גאומטרי"]},
  {n:"הצבי הגילדה",lat:"Hatzvi Hagilda",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["serif"],use:["display"],tg:["classic", "revival"],w:null,url:"https://hagilda.com/hatzvig/",vb:["וינטג׳"]},
  {n:"פרנק־ריהל הגילדה",lat:"Frank-Ruhl Hagilda",fo:"hagilda",d:"מיכל סהר",y:null,st:["serif"],use:["book", "text"],tg:["classic", "revival"],w:null,url:"https://hagilda.com/frankg/",vb:["אלגנטי", "מגזיני"]},
  {n:"אהרוני הגילדה",lat:"Aharoni Hagilda",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:["classic", "revival"],w:null,url:"https://hagilda.com/aharonig/",vb:["חידוש", "גאומטרי", "גבוה", "עברי קלאסי", "מודעת אבל"]},
  {n:"סירוקא",lat:"Siruca",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/sirucaheb/",vb:["גאומטרי"]},
  {n:"בלנדר",lat:"Blender",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/blender/",vb:["טקסט קצר", "תל אביב", "גאומטרי", "בלוק", "קלאסי"]},
  {n:"בלנדר מוצר",lat:"Blender Condensed",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:["narrow"],w:null,url:"https://hagilda.com/blenderconsensed/",vb:["טקסט קצר", "תל אביב", "גאומטרי", "בלוק", "קלאסי", "גבוה"]},
  {n:"ספידמן",lat:"Speedman",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/speedman/",vb:["ספורטיבי"]},
  {n:"דרום",lat:"South",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hagilda.com/southv2/",vb:["קצוות אלכסוניים", "עיתונות", "כותרות", "ישראלי", "מרובע"]},
  {n:"דרום־מערב",lat:"South-West",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hagilda.com/southwest/",vb:["קצוות אלכסוניים", "עיתונות", "כותרות", "ישראלי", "מרובע"]},
  {n:"אלנבי סנס",lat:"Alenbi Sans",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/alenbisans/",vb:["נוסטלגי", "ישראלי", "קלאסי"]},
  {n:"אלנבי סריף",lat:"Alenbi Serif",fo:"hagilda",d:"מיכל סהר",y:null,st:["serif"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/alenbiserif/",vb:["נוסטלגי", "ישראלי", "קלאסי", "סריף מרובע"]},
  {n:"סמי קאמבק",lat:"Semi Comeback",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/semicomeback/",vb:["וינטג׳"]},
  /* ---- fontef (40) ---- */
  {n:"מנדטורי וריאבל",lat:"Mandatory Variable",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "nostalgic"],w:null,url:"https://fontef.com/mandatory-variable",vb:["וינטג׳"]},
  {n:"ליון HLAR",lat:"Lyon HLAR",fo:"fontef",d:"יאנק יונטף (עם Commercial Type)",y:null,st:["serif"],use:["text", "book"],tg:["trilingual"],w:21,url:"https://fontef.com/lyon-hlar",vb:["אלגנטי", "מגזיני"]},
  {n:"אברהם",lat:"Abraham",fo:"fontef",d:"דניאל גרומר",y:null,st:["sans"],use:["display"],tg:["trilingual", "variable", "free"],w:6,url:"https://fontef.com/abraham",vb:["ברוטליסטי", "תלת לשוני", "נועז"]},
  {n:"נרקיס בלוק",lat:"Narkiss Block",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text", "display"],tg:["bilingual", "variable", "revival"],w:30,url:"https://fontef.com/narkiss-block",vb:["מרובע", "מודרני"]},
  {n:"נרקיס בלוק מונו",lat:"Narkiss Block Mono",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["mono", "sans"],use:["text", "display"],tg:["bilingual", "variable", "revival"],w:10,url:"https://fontef.com/narkiss-block-mono",vb:["טכנולוגי"]},
  {n:"נרקיס יאיר",lat:"Narkiss Yair",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["variable", "revival"],w:6,url:"https://fontef.com/narkiss-yair",vb:[]},
  {n:"הדסה פרידלנדר",lat:"Hadassah Friedlaender",fo:"fontef",d:"הנרי פרידלנדר / יאנק יונטף",y:null,st:["serif"],use:["book", "text"],tg:["trilingual", "classic", "revival", "variable"],w:7,url:"https://fontef.com/hadassah-friedlaender",vb:["אלגנטי", "מגזיני"]},
  {n:"נרקיס תם",lat:"Narkiss Tam",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["classic", "revival", "variable"],w:21,url:"https://fontef.com/narkiss-tam",vb:["מודרני"]},
  {n:"נרקיס אסף",lat:"Narkiss Asaf",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["trilingual", "revival", "variable"],w:6,url:"https://fontef.com/narkiss-asaf",vb:[]},
  {n:"קאנלה HLAR",lat:"Canela HLAR",fo:"fontef",d:"יאנק יונטף (עם Commercial Type)",y:null,st:["serif"],use:["display"],tg:["trilingual"],w:12,url:"https://fontef.com/canela-hlar",vb:["אלגנטי"]},
  {n:"מורזילקה",lat:"Murzilka",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:[],w:3,url:"https://fontef.com/murzilka",vb:["שובב", "מיוחד"]},
  {n:"נרקיס טקסט",lat:"Narkiss Text",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["serif"],use:["text", "book"],tg:["variable", "revival"],w:null,url:"https://fontef.com/narkiss-text",vb:["מגזיני"]},
  {n:"גרפיק HLAR",lat:"Graphik HLAR",fo:"fontef",d:"יאנק יונטף (עם Commercial Type)",y:null,st:["sans"],use:["text", "brand"],tg:["trilingual"],w:18,url:"https://fontef.com/graphik",vb:["מודרני"]},
  {n:"פרנק־ריהל וריאבל",lat:"Frank Rühl Variable",fo:"fontef",d:"רפאל פרנק / יאנק יונטף",y:null,st:["serif"],use:["book", "text"],tg:["variable", "classic", "revival"],w:null,url:"https://fontef.com/frank-ruhl-variable",vb:["אלגנטי", "מגזיני"]},
  {n:"נרקיס חדש",lat:"Narkiss Hadash",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["classic", "revival"],w:21,url:"https://fontef.com/narkiss-hadash",vb:["מודרני"]},
  {n:"נאוקלאס",lat:"Neoklass",fo:"fontef",d:"ערן בן ברק",y:null,st:["serif"],use:["display", "text"],tg:["bilingual"],w:12,url:"https://fontef.com/neoklass",vb:["אלגנטי", "מודרני"]},
  {n:"נרקיסים",lat:"Narkissim",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "revival"],w:4,url:"https://fontef.com/narkissim",vb:[]},
  {n:"היציאה הבאה",lat:"NextExit",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable"],w:8,url:"https://fontef.com/nextexit",vb:["טכנולוגי"]},
  {n:"הנרי",lat:"Henri",fo:"fontef",d:"הנרי פרידלנדר / יאנק יונטף",y:null,st:["serif"],use:["display"],tg:["classic", "revival"],w:2,url:"https://fontef.com/henri",vb:["אלגנטי"]},
  {n:"אדומה",lat:"Aduma",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable"],w:12,url:"https://fontef.com/aduma",vb:["מרובע"]},
  {n:"פאוזה",lat:"Pauza",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:12,url:"https://fontef.com/pauza",vb:["מודרני"]},
  {n:"ליבלינג",lat:"Liebling",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "nostalgic"],w:7,url:"https://fontef.com/liebling",vb:["וינטג׳"]},
  {n:"אולפה",lat:"Olfa",fo:"fontef",d:"יאנק יונטף",y:2011,st:["sans"],use:["display"],tg:["trilingual", "variable"],w:6,url:"https://fontef.com/olfa",vb:["מיוחד", "מודרני"]},
  {n:"נרקיס גזית",lat:"Narkiss Gazit",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["revival"],w:1,url:"https://fontef.com/narkiss-gazit",vb:["מרובע"]},
  {n:"חיים וריאבל",lat:"Haim Variable",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "classic", "revival"],w:null,url:"https://fontef.com/haim-variable",vb:["וינטג׳", "גאומטרי"]},
  {n:"פובליקו",lat:"Publico",fo:"fontef",d:"יאנק יונטף (עם Commercial Type)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual"],w:38,url:"https://fontef.com/publico",vb:["מגזיני"]},
  {n:"נרקיס שמשון",lat:"Narkiss Shimshon",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "revival"],w:null,url:"https://fontef.com/narkiss-shimshon",vb:["מרובע"]},
  {n:"נרקיס חן",lat:"Narkiss Hen",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["revival"],w:2,url:"https://fontef.com/narkiss-hen",vb:[]},
  {n:"קסילוגרף",lat:"Xylograf",fo:"fontef",d:"יאנק יונטף",y:null,st:["serif"],use:["display"],tg:["nostalgic"],w:1,url:"https://fontef.com/xylograf",vb:["וינטג׳", "גראנג׳"]},
  {n:"אהרוני וריאבל",lat:"Aharoni Variable",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "classic", "revival"],w:null,url:"https://fontef.com/aharoni-variable",vb:["וינטג׳", "גאומטרי"]},
  {n:"פודי",lat:"Foodi",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable"],w:14,url:"https://fontef.com/foodi",vb:["שובב", "ידידותי"]},
  {n:"מרים וריאבל",lat:"Miriam Variable",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans", "mono"],use:["text"],tg:["variable", "classic", "revival"],w:null,url:"https://fontef.com/miriam",vb:["וינטג׳", "מונוליין"]},
  {n:"רוממה שפיצר",lat:"Romema Spitzer",fo:"fontef",d:"משה שפיצר / יאנק יונטף",y:null,st:["serif"],use:["text"],tg:["variable", "classic", "revival"],w:5,url:"https://fontef.com/romema-spitzer",vb:["אלגנטי"]},
  {n:"תל אביב",lat:"Tel Aviv",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["free"],w:11,url:"https://fontef.com/tel-aviv",vb:["וינטג׳"]},
  {n:"נרקיס רותי",lat:"Narkiss Ruti",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["hand"],use:["display"],tg:["variable", "revival"],w:5,url:"https://fontef.com/narkiss-ruti",vb:["קליגרפי"]},
  {n:"נרקיס שולמית",lat:"Narkiss Shulamit",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["hand"],use:["display"],tg:["variable", "revival"],w:5,url:"https://fontef.com/narkiss-shulamit",vb:["קליגרפי"]},
  {n:"שישים ושבע",lat:"Sixty Seven",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:[],w:4,url:"https://fontef.com/sixty-seven",vb:["וינטג׳"]},
  {n:"אריקה סנס",lat:"Erica Sans",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["variable"],w:3,url:"https://fontef.com/erica-sans",vb:["מודרני"]},
  {n:"סודה",lat:"Soda",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontef.com/soda",vb:["שובב"]},
  {n:"שבלונה",lat:"Schablona",fo:"fontef",d:"יאנק יונטף",y:null,st:["stencil", "sans"],use:["display"],tg:[],w:4,url:"https://fontef.com/schablona",vb:["ברוטליסטי"]},
  /* ---- ezer (33) ---- */
  {n:"נווה צדק",lat:"Neve Zedeq",fo:"ezer",d:"עודד עזר",y:1999,st:["serif"],use:["display"],tg:["nostalgic"],w:null,url:"https://www.ezertypehouse.com/fonts/neve-zedeq",vb:["וינטג׳", "אות מקורות"]},
  {n:"עזר אוגוסט",lat:"Ezer August",fo:"ezer",d:"עודד עזר",y:2017,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeraugust",vb:["מודרני", "נקי"]},
  {n:"עזר אירו",lat:"Ezer Euro",fo:"ezer",d:"עודד עזר",y:2022,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://www.ezertypehouse.com/fonts/ezereuro",vb:["מודרני", "גאומטרי"]},
  {n:"עזר אלכימאי",lat:"Ezer Alchemist",fo:"ezer",d:"עודד עזר",y:2001,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeralchemist",vb:["מודרני"]},
  {n:"עזר אלכימאי נטוי",lat:"Ezer Alchemist Italic",fo:"ezer",d:"עודד עזר",y:2013,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeralchemistitalic",vb:["קליגרפי", "נטוי"]},
  {n:"עזר אנמיה",lat:"Ezer Anemia",fo:"ezer",d:"עודד עזר",y:2000,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeranemia",vb:["נסיוני", "דקיק", "מינימלי"]},
  {n:"עזר אקטואל",lat:"Ezer Actual",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeractual",vb:["מודרני"]},
  {n:"עזר אקספרימנטה",lat:"Ezer Experimenta",fo:"ezer",d:"עודד עזר",y:2016,st:["sans"],use:["display"],tg:[],w:3,url:"https://www.ezertypehouse.com/fonts/ezerexperimenta",vb:["נסיוני"]},
  {n:"עזר בייסיק",lat:"Ezer Basic",fo:"ezer",d:"עודד עזר",y:2021,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerbasic",vb:["מודרני", "נקי"]},
  {n:"עזר בלוק",lat:"Ezer Block",fo:"ezer",d:"עודד עזר",y:2007,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerblock",vb:["מרובע", "בלוק"]},
  {n:"עזר דו",lat:"Ezer Du",fo:"ezer",d:"עודד עזר",y:2016,st:["sans"],use:["text", "brand"],tg:["bilingual"],w:null,url:"https://www.ezertypehouse.com/fonts/ezerdoo",vb:["מודרני", "נקי"]},
  {n:"עזר דיאלוג",lat:"Ezer Dialogue",fo:"ezer",d:"עודד עזר + קוזימו פנצ׳יני",y:2025,st:["serif"],use:["text", "display"],tg:["trilingual"],w:6,url:"https://www.ezertypehouse.com/fonts/ezerdialogue",vb:["ברוטליסטי", "מגזיני", "טריפגוני"]},
  {n:"עזר הלל",lat:"Ezer Hillel",fo:"ezer",d:"עודד עזר",y:2006,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerhillel",vb:["מודרני", "נקי"]},
  {n:"עזר טורטליני",lat:"Ezer Tortellini",fo:"ezer",d:"עודד עזר + דיוויד ג׳ונת׳ן רוס",y:2019,st:["sans"],use:["display"],tg:["rounded"],w:null,url:"https://www.ezertypehouse.com/fonts/ezertortellini",vb:["שובב", "עגול", "מיוחד"]},
  {n:"עזר לופט",lat:"Ezer Luft",fo:"ezer",d:"עודד עזר",y:2017,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerloft",vb:["אוורירי", "גבוה"]},
  {n:"עזר מעודד סנס",lat:"Ezer Meoded Sans",fo:"ezer",d:"עודד עזר",y:2005,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezermeodedsans",vb:["מודרני"]},
  {n:"עזר מעודד סריף",lat:"Ezer Meoded Serif",fo:"ezer",d:"עודד עזר",y:2005,st:["serif"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezermeodedserif",vb:["מגזיני"]},
  {n:"עזר מעודד פשוט",lat:"Ezer Meoded Pashut",fo:"ezer",d:"עודד עזר",y:2005,st:["sans"],use:["text", "display"],tg:[],w:8,url:"https://www.ezertypehouse.com/fonts/ezermeodedpashut",vb:["מודרני", "פשוט", "נקי"]},
  {n:"עזר מעודד פשוט צר",lat:"Ezer Meoded Pashut Tzar",fo:"ezer",d:"עודד עזר",y:2005,st:["sans"],use:["display"],tg:["narrow"],w:null,url:"https://www.ezertypehouse.com/fonts/ezermeodedpashutcondenced",vb:["מודרני", "צר", "נקי"]},
  {n:"עזר נע",lat:"Ezer Na",fo:"ezer",d:"עודד עזר",y:2013,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerna",vb:["דינמי", "נע"]},
  {n:"עזר סוליד",lat:"Ezer Solid",fo:"ezer",d:"עודד עזר",y:2022,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezersolid",vb:["מרובע", "בלוק"]},
  {n:"עזר סוסיתא",lat:"Ezer Susita",fo:"ezer",d:"עודד עזר",y:2006,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://www.ezertypehouse.com/fonts/ezersusita",vb:["וינטג׳", "נוסטלגי", "ישראלי"]},
  {n:"עזר סטנדרט",lat:"Ezer Standard",fo:"ezer",d:"עודד עזר, קוזימו פנצ׳יני, פרנצ׳סקו קנוברו ואנדראה טרטרלי",y:2024,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerstandard",vb:["מודרני", "ניטרלי"]},
  {n:"עזר פרנציסקה",lat:"Ezer Franzisca",fo:"ezer",d:"עודד עזר",y:2017,st:["serif"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerfranzisca",vb:["אלגנטי"]},
  {n:"עזר פרנקריהליה",lat:"Ezer Frankruhlia",fo:"ezer",d:"עודד עזר",y:2003,st:["serif"],use:["text", "display"],tg:["classic", "revival"],w:null,url:"https://www.ezertypehouse.com/fonts/ezerfrankruhlya",vb:["וינטג׳", "מגזיני", "עברי קלאסי"]},
  {n:"עזר קדים",lat:"Ezer Kadim",fo:"ezer",d:"עודד עזר",y:2020,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerkadim",vb:["מודרני"]},
  {n:"עזר קשיח",lat:"Ezer Kashiach",fo:"ezer",d:"עודד עזר",y:2003,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerkashiach",vb:["מרובע", "ברוטליסטי", "בלוק"]},
  {n:"עזר רץ",lat:"Ezer Rutz",fo:"ezer",d:"עודד עזר",y:2011,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerrutz",vb:["מודרני", "ספורטיבי"]},
  {n:"עזר שלוותא",lat:"Ezer Shalvata",fo:"ezer",d:"עודד עזר",y:null,st:["serif"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezershalvata",vb:["אלגנטי", "רך"]},
  {n:"עזר שמש",lat:"Ezer Shemesh",fo:"ezer",d:"עודד עזר",y:2014,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezershemesh",vb:["וינטג׳"]},
  {n:"עזר תאגיד",lat:"Ezer Taagid",fo:"ezer",d:"עודד עזר",y:2006,st:["sans"],use:["text", "brand"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezertaagid",vb:["מודרני", "מוסדי"]},
  {n:"פיט עברי",lat:"Fit Hebrew",fo:"ezer",d:"עודד עזר + David Jonathan Ross",y:2018,st:["sans"],use:["display"],tg:["variable", "wide"],w:null,url:"https://www.ezertypehouse.com/fonts/fithebrewvf",vb:["מרובע", "נסיוני", "משתנה"]},
  {n:"פלשתינה",lat:"Palastina",fo:"ezer",d:"עודד עזר + מיכל סהר",y:2003,st:["serif"],use:["display"],tg:["nostalgic"],w:null,url:"https://www.ezertypehouse.com/fonts/palastina",vb:["וינטג׳", "עברי קלאסי"]},
  /* ---- hafontia (26) ---- */
  {n:"לילית",lat:"Lilith",fo:"hafontia",d:"בן נתן",y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/lilith/",vb:["אלגנטי"]},
  {n:"סהרה",lat:"Sahara",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/sahara/",vb:[]},
  {n:"אלטע זאכן",lat:"Alte Zachen",fo:"hafontia",d:"בן נתן",y:null,st:["serif"],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/alte-zachen/",vb:["וינטג׳"]},
  {n:"ניצוץ",lat:"Nitzotz",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/nitzotz/",vb:[]},
  {n:"פולין",lat:"Polin",fo:"hafontia",d:"בן נתן",y:null,st:[],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/polin/",vb:["וינטג׳"]},
  {n:"סימונה",lat:"Simona",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://hafontia.com/family/simona/",vb:["מודרני"]},
  {n:"דנידין",lat:"Danidin",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["rounded"],w:null,url:"https://hafontia.com/family/danidin/",vb:["שובב"]},
  {n:"ברויט",lat:"Broyt",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/broyt/",vb:["וינטג׳"]},
  {n:"לאון",lat:"Leon",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://hafontia.com/family/leon/",vb:["מודרני"]},
  {n:"מנהטן",lat:"Manhattan",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hafontia.com/family/manhattan/",vb:["מרובע", "וינטג׳"]},
  {n:"פוטוריזם",lat:"Futurism",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/futurism/",vb:["גאומטרי", "נסיוני"]},
  {n:"ערפילית",lat:"Arfilit",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/arfilit/",vb:[]},
  {n:"דיסקורדיה",lat:"Discordia",fo:"hafontia",d:"בן נתן",y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/discordia/",vb:["מיוחד"]},
  {n:"סאני",lat:"Sunny",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["rounded"],w:null,url:"https://hafontia.com/family/sunny/",vb:["שובב", "ידידותי"]},
  {n:"מרדכי",lat:"Mordechai",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/mordechai/",vb:[]},
  {n:"חיים יבין",lat:"Haim Yavin",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/haim-yavin/",vb:["וינטג׳"]},
  {n:"אוריה",lat:"Oria",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://hafontia.com/family/oria/",vb:["מודרני"]},
  {n:"פנטזמגוריה",lat:"Phantasmagoria",fo:"hafontia",d:"בן נתן",y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/phantasmagoria/",vb:["מיוחד", "אלגנטי"]},
  {n:"אלה סנס",lat:"Ella Sans",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://hafontia.com/family/ella-sans/",vb:["מודרני"]},
  {n:"בזלת",lat:"Basalt",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/basalt/",vb:["מרובע"]},
  {n:"פטיש",lat:"Hammer Pro",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/hammer-pro/",vb:["ברוטליסטי"]},
  {n:"ימים ולילות",lat:"Days & Nights",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/daysnights/",vb:[]},
  {n:"קואופרטיב",lat:"Cooperative",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/cooperative/",vb:["וינטג׳"]},
  {n:"חשמל",lat:"Hashmal",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/hashmal/",vb:["טכנולוגי"]},
  {n:"פופר",lat:"Popper",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/popper/",vb:["שובב"]},
  {n:"שבתאי",lat:"Shabtai",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/shabtai/",vb:[]},
  /* ---- reisinger (6) ---- */
  {n:"ירדן (מכביה)",lat:"Yarden",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["וינטג׳", "גאומטרי"]},
  {n:"עידן (דניאל)",lat:"Idan",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["וינטג׳", "גאומטרי"]},
  {n:"מיכל (טכניון)",lat:"Michal",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["וינטג׳", "גאומטרי"]},
  {n:"אמיר (קשב)",lat:"Amir",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["וינטג׳", "גאומטרי"]},
  {n:"נטע (מלון)",lat:"Neta",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["וינטג׳", "גאומטרי"]},
  {n:"יונתן",lat:"Yonatan",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["וינטג׳", "גאומטרי"]},
];

/* ============================================================ */

const norm = (s) => (s || "").toLowerCase();

export default function DictionarySection() {
  const [query, setQuery] = useState("");
  const [foundries, setFoundries] = useState([]);
  const [styles, setStyles] = useState([]);
  const [uses, setUses] = useState([]);
  const [tags, setTags] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [eras, setEras] = useState([]);
  const [designer, setDesigner] = useState("");
  const [sort, setSort] = useState("name");

  const designers = useMemo(() => {
    const set = new Set(FONTS.map((x) => x.d).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "he"));
  }, []);

  const toggle = (setter) => (val) =>
    setter((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));

  const results = useMemo(() => {
    let out = FONTS.filter((x) => {
      if (query) {
        const q = norm(query);
        const hay = norm(x.n) + " " + norm(x.lat) + " " + norm(x.d) + " " + x.vb.join(" ");
        if (!hay.includes(q)) return false;
      }
      if (foundries.length && !foundries.includes(x.fo)) return false;
      if (styles.length && !styles.some((s) => x.st.includes(s))) return false;
      if (uses.length && !uses.some((u) => x.use.includes(u))) return false;
      if (tags.length && !tags.every((t) => x.tg.includes(t))) return false;
      if (vibes.length && !vibes.every((v) => x.vb.includes(v))) return false;
      if (eras.length && !eras.some((e) => ERAS.find((r) => r.id === e).test(x.y))) return false;
      if (designer && x.d !== designer) return false;
      return true;
    });
    out = [...out];
    if (sort === "name") out.sort((a, b) => a.n.localeCompare(b.n, "he"));
    if (sort === "newest") out.sort((a, b) => (b.y ?? -1) - (a.y ?? -1));
    if (sort === "oldest") out.sort((a, b) => (a.y ?? 9999) - (b.y ?? 9999));
    if (sort === "weights") out.sort((a, b) => (b.w ?? 0) - (a.w ?? 0));
    return out;
  }, [query, foundries, styles, uses, tags, vibes, eras, designer, sort]);

  const activeCount =
    foundries.length + styles.length + uses.length + tags.length + vibes.length + eras.length + (designer ? 1 : 0) + (query ? 1 : 0);

  const clearAll = () => {
    setQuery(""); setFoundries([]); setStyles([]); setUses([]); setTags([]); setVibes([]); setEras([]); setDesigner("");
  };

  return (
    <section dir="rtl" className="animate-tetris-stack">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl font-bold text-off-black font-headline">מילון</h2>
          <span className="font-headline text-sm text-dark-gray">
            {results.length} פונטים
            {activeCount > 0 && " (מסוננים)"}
          </span>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className={cn(
              "px-3 py-1",
              "font-headline text-xs font-bold",
              "text-off-black bg-tetris-pink",
              "border-2 border-off-black",
              "shadow-brutalist-xs",
              "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
              "transition-all duration-200"
            )}
          >
            נקה פילטרים ({activeCount})
          </button>
        )}
      </div>

      <div className="mb-6 p-4 bg-tetris-yellow border-3 border-off-black shadow-brutalist-sm">
        <p className="text-off-black/80 text-sm font-ibm leading-relaxed">
          {FONTS.length} משפחות פונטים מ־{Object.keys(FOUNDRIES).length} בתי פונטים ישראליים עצמאיים.
          סינון לפי סגנון, שימוש, מעצב/ת, תקופה ומאפיינים — כל פונט מקושר לעמוד המקורי שלו.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          className={cn(
            "flex-1 min-w-[260px]",
            "border-3 border-off-black bg-off-white",
            "px-4 py-2.5 font-headline text-base text-off-black",
            "outline-none focus:shadow-brutalist transition-shadow"
          )}
          placeholder="חיפוש פונט, שם לועזי או מעצב/ת…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={cn(
            "border-3 border-off-black bg-off-white",
            "px-3 py-2.5 font-headline text-sm text-off-black",
            "cursor-pointer outline-none focus:shadow-brutalist transition-shadow"
          )}
          value={designer}
          onChange={(e) => setDesigner(e.target.value)}
        >
          <option value="">כל המעצבים/ות</option>
          {designers.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          className={cn(
            "border-3 border-off-black bg-off-white",
            "px-3 py-2.5 font-headline text-sm text-off-black",
            "cursor-pointer outline-none focus:shadow-brutalist transition-shadow"
          )}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">מיון: א—ת</option>
          <option value="newest">מיון: חדש → ישן</option>
          <option value="oldest">מיון: ישן → חדש</option>
          <option value="weights">מיון: הכי הרבה משקלים</option>
        </select>
      </div>

      <div className="mb-8 p-4 bg-off-white border-3 border-off-black shadow-brutalist-sm">
        <h3 className="font-headline font-bold text-base text-off-black mb-4">סינון</h3>

        <FilterGroup label="בית פונטים">
          {Object.entries(FOUNDRIES).map(([id, fo]) => (
            <FilterChip
              key={id}
              label={fo.name}
              isActive={foundries.includes(id)}
              activeBg={getTagColor(fo.name)}
              onClick={() => toggle(setFoundries)(id)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="סגנון">
          {Object.entries(STYLES).map(([id, label]) => (
            <FilterChip
              key={id}
              label={label}
              isActive={styles.includes(id)}
              activeBg={getTagColor(label)}
              onClick={() => toggle(setStyles)(id)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="שימוש">
          {Object.entries(USES).map(([id, label]) => (
            <FilterChip
              key={id}
              label={label}
              isActive={uses.includes(id)}
              activeBg={getTagColor(label)}
              onClick={() => toggle(setUses)(id)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="מאפיינים">
          {Object.entries(TAGS).map(([id, label]) => (
            <FilterChip
              key={id}
              label={label}
              isActive={tags.includes(id)}
              activeBg={getTagColor(label)}
              onClick={() => toggle(setTags)(id)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="VIBE">
          {Object.entries(VIBES).map(([id, label]) => (
            <FilterChip
              key={id}
              label={label}
              isActive={vibes.includes(id)}
              activeBg={getTagColor(label)}
              onClick={() => toggle(setVibes)(id)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="תקופה">
          {ERAS.map((e) => (
            <FilterChip
              key={e.id}
              label={e.label}
              isActive={eras.includes(e.id)}
              activeBg={getTagColor(e.label)}
              onClick={() => toggle(setEras)(e.id)}
            />
          ))}
        </FilterGroup>

        {(tags.length + vibes.length) > 1 && (
          <p className="text-xs text-dark-gray font-ibm mt-1">
            מאפיינים מסוננים יחד (וגם־וגם)
          </p>
        )}
      </div>

      {results.length === 0 ? (
        <div className="border-3 border-dashed border-off-black/30 p-12 text-center text-dark-gray font-ibm text-lg bg-off-white">
          לא נמצאו פונטים שעונים על כל התנאים.
          <br />
          נסו להסיר חלק מהסינונים.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((x, i) => {
            const fo = FOUNDRIES[x.fo];
            const foundryBg = getTagColor(fo.name);
            const cardTags = [
              ...x.st.map((s) => STYLES[s]),
              ...(x.tg.includes("free") ? ["חינמי"] : []),
              ...(x.tg.includes("variable") ? ["וריאבלי"] : []),
              ...(x.tg.includes("trilingual") ? ["עב׳·ער׳·אנ׳"] : []),
              ...(x.tg.includes("bilingual") && !x.tg.includes("trilingual") ? ["דו־לשוני"] : []),
              ...(x.tg.includes("narrow") ? ["צר"] : []),
              ...(x.tg.includes("wide") ? ["רחב"] : []),
              ...(x.tg.includes("rounded") ? ["מעוגל"] : []),
              ...(x.tg.includes("nostalgic") ? ["נוסטלגי"] : []),
              ...(x.tg.includes("classic") ? ["קלאסי"] : []),
              ...x.vb.map((v) => VIBES[v] || v),
            ];

            return (
              <article
                key={x.lat + i}
                className={cn(
                  "flex flex-col",
                  "bg-off-white",
                  "border-3 border-off-black",
                  "shadow-brutalist",
                  "hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]",
                  "transition-all duration-200",
                  "overflow-hidden"
                )}
              >
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-bold border border-off-black shadow-brutalist-xs",
                        foundryBg,
                        getTagTextClass(foundryBg),
                        "font-headline"
                      )}
                    >
                      {fo.name}
                    </span>
                    <span className="text-xs text-mid-gray font-jersey tabular-nums">{x.y ?? "—"}</span>
                  </div>

                  <h3 className={cn("text-xl font-bold text-off-black text-right leading-tight", isEnglish(x.n) ? "font-jersey" : "font-headline")}>
                    {x.n}
                  </h3>
                  <p className="text-sm text-mid-gray font-jersey text-right">{x.lat}</p>
                  <p className="text-sm text-dark-gray font-ibm">
                    <span className="text-mid-gray">עיצוב: </span>
                    {x.d ?? "—"}
                  </p>

                  {cardTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {cardTags.map((tag, tagIndex) => (
                        <FontTag key={`${tag}-${tagIndex}`} label={tag} highlight={tag === "חינמי"} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t-3 border-off-black bg-light-gray flex justify-between items-center gap-3">
                  <span className="text-xs text-dark-gray font-ibm">
                    {x.w ? `${x.w} משקלים` : "מס׳ משקלים —"}
                  </span>
                  <a
                    href={x.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5",
                      "font-headline text-xs font-bold text-off-black",
                      "bg-tetris-yellow border-2 border-off-black",
                      "shadow-brutalist-xs",
                      "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                      "transition-all duration-200 no-underline"
                    )}
                  >
                    לעמוד הפונט
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <footer className="mt-10 pt-4 border-t-3 border-off-black text-xs text-dark-gray font-ibm flex justify-between flex-wrap gap-3">
        <span>הנתונים נאספו מאתרי בתי הפונטים. שדות המסומנים ב־“—” טרם אומתו.</span>
        <span>מילון · index-design-hit</span>
      </footer>
    </section>
  );
}
