import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

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
  monoline: "מונוליין",
  boxy: "Boxy / מרובע",
  geometric: "גיאומטרי",
  sporty: "ספורטיבי",
  cursive: "קורסיבי / זורם",
  vintage: "וינטג׳",
  modern: "מודרני",
  playful: "שובב",
  elegant: "אלגנטי",
  brutalist: "ברוטליסטי",
  techy: "טכנולוגי",
  grunge: "גראנג׳",
  friendly: "ידידותי",
  editorial: "מגזיני",
  quirky: "אקסצנטרי",
  experimental: "נסיוני",
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
  {n:"אטלס",lat:"Atlas",fo:"aaa",d:"אברהם קורנפלד",y:2009,st:["sans"],use:["display", "text"],tg:["bilingual", "multilingual", "niqqud"],w:6,url:"https://alefalefalef.co.il/font/atlas/",vb:["modern"]},
  {n:"סינופסיס",lat:"Synopsis",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["serif"],use:["book", "text", "display"],tg:[],w:5,url:"https://alefalefalef.co.il/font/synopsis/",vb:["elegant", "editorial"]},
  {n:"אמביוולנטי נורמל",lat:"Ambivalenti",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans", "slab"],use:["display"],tg:["bilingual", "niqqud"],w:7,url:"https://alefalefalef.co.il/font/ambivalenti/",vb:["boxy"]},
  {n:"אמביוולנטי צר",lat:"Ambivalenti Tzar",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans", "slab"],use:["display"],tg:["bilingual", "multilingual", "narrow", "niqqud"],w:7,url:"https://alefalefalef.co.il/font/ambivalenti-tzar/",vb:["boxy"]},
  {n:"אמביוולנטי קומפרסט",lat:"Ambivalenti Compressed",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans", "slab"],use:["display"],tg:["bilingual", "narrow"],w:7,url:"https://alefalefalef.co.il/font/ambivalenti-compressed/",vb:["boxy"]},
  {n:"אמביוולנטי רחב",lat:"Ambivalenti Wide",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans", "slab"],use:["display"],tg:["bilingual", "wide"],w:7,url:"https://alefalefalef.co.il/font/ambivalenti-wide/",vb:["boxy"]},
  {n:"נוילנד",lat:"Noyland",fo:"aaa",d:"נוי ניימן",y:2011,st:["sans"],use:["display"],tg:["bilingual", "rounded", "nostalgic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/noyland/",vb:["vintage", "playful"]},
  {n:"אלמוני",lat:"Almoni",fo:"aaa",d:"אברהם קורנפלד",y:2012,st:["sans"],use:["text", "display"],tg:["bilingual", "multilingual", "niqqud"],w:10,url:"https://alefalefalef.co.il/font/almoni/",vb:["modern"]},
  {n:"אלמוני צר",lat:"Almoni Tzar",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["sans"],use:["display"],tg:["bilingual", "multilingual", "narrow", "niqqud"],w:7,url:"https://alefalefalef.co.il/font/almoni-tzar/",vb:["modern"]},
  {n:"מקומי",lat:"Mekomi",fo:"aaa",d:"אברהם קורנפלד",y:2011,st:["serif"],use:["text", "display"],tg:["bilingual", "multilingual", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/mekomi/",vb:["editorial"]},
  {n:"סטנגה",lat:"Stanga",fo:"aaa",d:"ערן בכרך + אנה חורש",y:2012,st:["sans"],use:["display"],tg:["bilingual", "narrow", "rounded"],w:6,url:"https://alefalefalef.co.il/font/stanga/",vb:["sporty"]},
  {n:"אסימון דו־לשוני",lat:"Asimon",fo:"aaa",d:"אברהם קורנפלד",y:2012,st:["sans", "serif"],use:["text", "display"],tg:["bilingual", "nostalgic", "niqqud"],w:8,url:"https://alefalefalef.co.il/font/asimon/",vb:["vintage"]},
  {n:"מוגרבי",lat:"Mugrabi",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["serif", "stencil"],use:["display"],tg:["nostalgic", "classic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/mugrabi/",vb:["vintage", "elegant"]},
  {n:"בר־לב",lat:"Barlev",fo:"aaa",d:"נדב ברקן + נוי ניימן",y:2013,st:["sans"],use:["display"],tg:["bilingual", "narrow", "nostalgic", "niqqud"],w:6,url:"https://alefalefalef.co.il/font/barlev/",vb:["vintage"]},
  {n:"פרנק־רי",lat:"Frank-Re",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["serif"],use:["book", "text", "display"],tg:["bilingual", "nostalgic", "classic", "niqqud", "revival"],w:6,url:"https://alefalefalef.co.il/font/frank-re/",vb:["elegant", "editorial"]},
  {n:"פרנק־רי צר",lat:"Frank-Re Tzar",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["serif"],use:["book", "text"],tg:["bilingual", "narrow", "classic", "revival"],w:6,url:"https://alefalefalef.co.il/font/frank-re-tzar/",vb:["elegant", "editorial"]},
  {n:"פעמון",lat:"Paamon",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["sans", "slab"],use:["display"],tg:["bilingual", "nostalgic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/paamon/",vb:["vintage"]},
  {n:"קרוואן",lat:"Caravan",fo:"aaa",d:"אברהם קורנפלד",y:2013,st:["sans", "slab"],use:["display"],tg:["bilingual", "wide", "nostalgic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/caravan/",vb:["vintage", "boxy"]},
  {n:"תעמולה",lat:"Taamula",fo:"aaa",d:"אברהם קורנפלד",y:2015,st:["sans"],use:["display"],tg:["bilingual", "multilingual", "narrow", "nostalgic", "niqqud"],w:6,url:"https://alefalefalef.co.il/font/taamula/",vb:["vintage"]},
  {n:"מכמורת",lat:"Mikhmoret",fo:"aaa",d:"אברהם קורנפלד",y:2017,st:["sans"],use:["display"],tg:["bilingual", "narrow", "niqqud"],w:4,url:"https://alefalefalef.co.il/font/mikhmoret/",vb:["vintage"]},
  {n:"מכמורת מעוגל",lat:"Mikhmoret Rounded",fo:"aaa",d:"אברהם קורנפלד",y:2017,st:["sans"],use:["display"],tg:["bilingual", "narrow", "rounded", "niqqud"],w:3,url:"https://alefalefalef.co.il/font/mikhmoret-rounded/",vb:["friendly"]},
  {n:"שלוק",lat:"Shluk",fo:"aaa",d:"שביט יעקב + אנה חורש",y:2017,st:["hand"],use:["display"],tg:["bilingual", "rounded", "niqqud"],w:1,url:"https://alefalefalef.co.il/font/shluk/",vb:["cursive", "playful"]},
  {n:"אפק",lat:"Afek",fo:"aaa",d:"אברהם קורנפלד",y:2017,st:["sans"],use:["text", "display"],tg:["bilingual", "niqqud"],w:8,url:"https://alefalefalef.co.il/font/afek/",vb:["modern"]},
  {n:"פלוני",lat:"Ploni",fo:"aaa",d:"אברהם קורנפלד",y:2018,st:["sans"],use:["text", "display"],tg:["bilingual", "multilingual", "niqqud"],w:8,url:"https://alefalefalef.co.il/font/ploni/",vb:["modern", "friendly"]},
  {n:"פלוני יד",lat:"Ploni Yad",fo:"aaa",d:"אברהם קורנפלד",y:2018,st:["hand", "sans"],use:["display"],tg:["niqqud"],w:8,url:"https://alefalefalef.co.il/font/ploni-yad/",vb:["cursive", "friendly"]},
  {n:"פלוני מעוגל",lat:"Ploni Round",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans"],use:["text", "display"],tg:["bilingual", "multilingual", "rounded"],w:6,url:"https://alefalefalef.co.il/font/ploni-round/",vb:["friendly"]},
  {n:"פלוני צר",lat:"Ploni Tzar",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans"],use:["text", "display"],tg:["bilingual", "narrow"],w:7,url:"https://alefalefalef.co.il/font/ploni-tzar/",vb:["modern"]},
  {n:"אנומליה",lat:"Anomalia",fo:"aaa",d:"אברהם קורנפלד",y:2018,st:["sans"],use:["display"],tg:["bilingual", "multilingual", "niqqud"],w:7,url:"https://alefalefalef.co.il/font/anomalia/",vb:["quirky", "modern"]},
  {n:"קדם סריף",lat:"Kedem Serif",fo:"aaa",d:"אברהם קורנפלד",y:2020,st:["serif"],use:["display"],tg:["bilingual", "multilingual", "wide", "nostalgic", "niqqud"],w:6,url:"https://alefalefalef.co.il/font/kedem-serif/",vb:["vintage", "elegant"]},
  {n:"קדם סנס",lat:"Kedem Sans",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans"],use:["display"],tg:["bilingual", "multilingual", "wide", "nostalgic", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/kedem-sans/",vb:["vintage"]},
  {n:"אינדקס",lat:"Index",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans"],use:["display"],tg:["bilingual", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/index/",vb:["techy", "modern"]},
  {n:"אינדקס מונו",lat:"Index Mono",fo:"aaa",d:"אברהם קורנפלד",y:2021,st:["sans", "mono"],use:["display"],tg:["bilingual", "niqqud"],w:5,url:"https://alefalefalef.co.il/font/index-mono/",vb:["techy"]},
  {n:"גלוריה",lat:"Gloria",fo:"aaa",d:null,y:null,st:["sans"],use:["display"],tg:["bilingual"],w:null,url:"https://alefalefalef.co.il/font/gloria/",vb:[]},
  {n:"לוי",lat:"Levi",fo:"aaa",d:null,y:null,st:["sans"],use:["display"],tg:["bilingual"],w:null,url:"https://alefalefalef.co.il/font/levi/",vb:[]},
  {n:"אוונטה",lat:"Awanta",fo:"aaa",d:null,y:null,st:["sans"],use:["display"],tg:["bilingual"],w:null,url:"https://alefalefalef.co.il/font/awanta/",vb:[]},
  {n:"פריימריז",lat:"Primaries",fo:"aaa",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://alefalefalef.co.il/font/primaries/",vb:[]},
  {n:"קארמה",lat:"Karma",fo:"aaa",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://alefalefalef.co.il/font/karma/",vb:[]},
  /* ---- fontimonim (73) ---- */
  {n:"אבג",lat:"Obege",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/obege/",vb:[]},
  {n:"אביגול",lat:"Avigul",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/avigul/",vb:["cursive"]},
  {n:"אגוזים",lat:"Egozim",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["rounded"],w:null,url:"https://fontimonim.co.il/font/egozim/",vb:["playful", "friendly"]},
  {n:"אוסקר",lat:"Oscar",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/oscar/",vb:[]},
  {n:"אוסקר צר",lat:"Oscar Tzar",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["narrow"],w:null,url:"https://fontimonim.co.il/font/oscar-tzar/",vb:[]},
  {n:"אורון צר",lat:"Oron Tzar",fo:"fontimonim",d:"אשר אורון",y:null,st:["sans"],use:["display"],tg:["narrow", "classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-tzar/",vb:["vintage", "geometric"]},
  {n:"אורון קלאסי",lat:"Oron Classic",fo:"fontimonim",d:"אשר אורון",y:1966,st:["sans"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-classic/",vb:["vintage", "geometric"]},
  {n:"אורון קשת",lat:"Oron Keshet",fo:"fontimonim",d:"אשר אורון",y:null,st:["sans"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-keshet/",vb:["vintage", "geometric"]},
  {n:"אורון רחב",lat:"Oron Wide",fo:"fontimonim",d:"אשר אורון",y:null,st:["sans"],use:["display"],tg:["wide", "classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-wide/",vb:["vintage", "geometric"]},
  {n:"אורון תבנית",lat:"Oron Tavnit",fo:"fontimonim",d:"אשר אורון",y:null,st:["sans", "stencil"],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/oron-tavnit/",vb:["vintage", "geometric"]},
  {n:"אותיותי",lat:"Otiyoti",fo:"fontimonim",d:null,y:null,st:["sans"],use:["display"],tg:["free"],w:null,url:"https://fontimonim.co.il/font/otiyoti/",vb:["boxy", "friendly"]},
  {n:"אייקונימונים",lat:"Iconimonim",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/iconimonim/",vb:["playful"]},
  {n:"איצטרובל",lat:"Itstrubal",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/itstrubal/",vb:[]},
  {n:"אקסיומה",lat:"Axioma",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/axioma/",vb:["geometric"]},
  {n:"ארצי",lat:"Artzi",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/artzi/",vb:["vintage"]},
  {n:"אשכוליתה",lat:"Eshkolita",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["rounded"],w:null,url:"https://fontimonim.co.il/font/eshkolita/",vb:["playful", "friendly"]},
  {n:"באבא",lat:"Baba",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/baba/",vb:["playful"]},
  {n:"בגירה",lat:"Bagira",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/bagira/",vb:["monoline", "cursive"]},
  {n:"בולדר",lat:"Bolder",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["wide"],w:null,url:"https://fontimonim.co.il/font/bolder/",vb:["boxy"]},
  {n:"בומבסטה",lat:"Bombasta",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["wide"],w:null,url:"https://fontimonim.co.il/font/bombasta/",vb:["boxy"]},
  {n:"במברגר גראנג׳",lat:"Bamberger Grunge",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/bamberger-grunge/",vb:["grunge", "vintage"]},
  {n:"במברגר חד",lat:"Bamberger Sharp",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/bamberger-sharp/",vb:["vintage"]},
  {n:"בנצ׳מרק",lat:"Benchmark",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/benchmark/",vb:[]},
  {n:"ברונו",lat:"Bruno",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/bruno/",vb:[]},
  {n:"ברנדה",lat:"Brenda",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/brenda/",vb:[]},
  {n:"ג׳ינג׳ר",lat:"Ginger",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/ginger/",vb:["playful"]},
  {n:"ג׳קלין",lat:"Jacqueline",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/jacqueline/",vb:["elegant"]},
  {n:"גרמושקה",lat:"Garmoshka",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["narrow"],w:null,url:"https://fontimonim.co.il/font/garmoshka/",vb:["quirky"]},
  {n:"דידה",lat:"Dida",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/dida/",vb:[]},
  {n:"דמקה",lat:"Damka",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/damka/",vb:["geometric"]},
  {n:"האוזר",lat:"Hauser",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/hauser/",vb:[]},
  {n:"הדס באו",lat:"Hadasbau",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/hadasbau/",vb:["geometric", "experimental"]},
  {n:"וארלה אקסטרה",lat:"Varela Extra",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["rounded"],w:null,url:"https://fontimonim.co.il/font/varela-extra/",vb:["friendly"]},
  {n:"זבולון",lat:"Zvulun",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/zvulun/",vb:[]},
  {n:"חביבי",lat:"Habibi",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/habibi/",vb:["friendly"]},
  {n:"חיים גראנג׳",lat:"Haim Grunge",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/haim-grunge/",vb:["grunge", "vintage"]},
  {n:"חיים קלאסי",lat:"Haim Classic",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["classic", "revival"],w:null,url:"https://fontimonim.co.il/font/haim-classic/",vb:["vintage", "geometric"]},
  {n:"טוליטון",lat:"Toliton",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/toliton/",vb:[]},
  {n:"טליזמן",lat:"Talizman",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/talizman/",vb:[]},
  {n:"טרבלסי",lat:"Trabelsi",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/trabelsi/",vb:[]},
  {n:"יו־יו",lat:"Yoyo",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/yoyo/",vb:["playful"]},
  {n:"יידישקייט",lat:"Yiddishkeit",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/yiddishkeit/",vb:["vintage"]},
  {n:"לובלין",lat:"Lublin",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/lublin/",vb:["cursive", "friendly"]},
  {n:"מאוריציוס",lat:"Mauritius",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/mauritius/",vb:[]},
  {n:"מוזיאון",lat:"Museum",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/museum/",vb:["elegant"]},
  {n:"מוטל׳ה",lat:"Motaleh",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/motaleh/",vb:["vintage"]},
  {n:"מיקסטייפ",lat:"Mixtape",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/mixtape/",vb:["techy"]},
  {n:"סולומון",lat:"Solomon",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/solomon/",vb:[]},
  {n:"סופי סנס",lat:"Sofi Sans",fo:"fontimonim",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/sofi-sans/",vb:[]},
  {n:"סופי סריף",lat:"Sofi Serif",fo:"fontimonim",d:null,y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/sofi-serif/",vb:[]},
  {n:"ספיר קלאסי",lat:"Sapir Classic",fo:"fontimonim",d:null,y:null,st:["serif"],use:["display"],tg:["classic"],w:null,url:"https://fontimonim.co.il/font/sapir-classic/",vb:["elegant"]},
  {n:"ספקטרום",lat:"Spectrum",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/spectrum/",vb:[]},
  {n:"עומס",lat:"Omes",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/omes/",vb:["experimental"]},
  {n:"פלמינגו",lat:"Flamingo",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/flamingo/",vb:["playful"]},
  {n:"פלסיבו",lat:"Placebo",fo:"fontimonim",d:null,y:null,st:["sans"],use:["display"],tg:["bilingual"],w:null,url:"https://fontimonim.co.il/font/placebo/",vb:["quirky", "modern"]},
  {n:"פרשנדתא",lat:"Parshendata",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["classic"],w:null,url:"https://fontimonim.co.il/font/parshendata/",vb:["vintage"]},
  {n:"ציפלון",lat:"Tziflon",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/tziflon/",vb:["playful"]},
  {n:"צלילה־באו",lat:"Tslilabau",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/tslilabau/",vb:["geometric", "experimental"]},
  {n:"קלוגמן",lat:"Klugman",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/klugman/",vb:[]},
  {n:"קלפיון",lat:"Kalpion",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/kalpion/",vb:[]},
  {n:"קריספר",lat:"Krisper",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/krisper/",vb:[]},
  {n:"רביצקי",lat:"Ravitzky",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/ravitzky/",vb:["vintage"]},
  {n:"רבקה־באו",lat:"Rivkabau",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/rivkabau/",vb:["geometric", "experimental"]},
  {n:"רוגטקה",lat:"Rugatka",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/rugatka/",vb:["playful"]},
  {n:"ריטריט",lat:"Retreat",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/retreat/",vb:[]},
  {n:"רקיע",lat:"Rakia",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/rakia/",vb:[]},
  {n:"שביס",lat:"Shavis",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/shavis/",vb:["vintage"]},
  {n:"שיק",lat:"Szyk",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["nostalgic"],w:null,url:"https://fontimonim.co.il/font/szyk/",vb:["vintage"]},
  {n:"שירבושקה",lat:"Shirbushka",fo:"fontimonim",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/shirbushka/",vb:["cursive"]},
  {n:"שליט״א",lat:"Shlita",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:["classic"],w:null,url:"https://fontimonim.co.il/font/shlita/",vb:["vintage"]},
  {n:"שסק",lat:"Shesek",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/shesek/",vb:[]},
  {n:"שפגאט",lat:"Shpagat",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/shpagat/",vb:["quirky"]},
  {n:"תאום",lat:"Teom",fo:"fontimonim",d:null,y:null,st:[],use:["display"],tg:[],w:null,url:"https://fontimonim.co.il/font/teom/",vb:[]},
  /* ---- hagilda (73) ---- */
  {n:"פרנקריהל Universal",lat:"FrankRuhl Universal",fo:"hagilda",d:null,y:null,st:["serif"],use:["book", "text"],tg:["bilingual", "classic", "revival"],w:null,url:"https://hagilda.com/frankruhluniversal/",vb:["elegant", "editorial"]},
  {n:"סקולו",lat:"Secolo",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/secolo/",vb:["modern"]},
  {n:"ראפידה",lat:"Rapida",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["trilingual"],w:null,url:"https://hagilda.com/rapidaheblatar/",vb:["sporty", "modern"]},
  {n:"לאבה פרו",lat:"Lava Pro",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual"],w:null,url:"https://hagilda.com/lava-prohl/",vb:["editorial"]},
  {n:"רולי חדש",lat:"Roli New",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/roli_new/",vb:["playful"]},
  {n:"גרטה סריף וריאבל",lat:"Greta Serif Variable",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual", "variable"],w:null,url:"https://hagilda.com/greta-serif-variable/",vb:["editorial", "elegant"]},
  {n:"פדרה סנס וריאבל",lat:"Fedra Sans Variable",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["sans"],use:["text"],tg:["bilingual", "variable"],w:null,url:"https://hagilda.com/fedra-sans-variable/",vb:["modern"]},
  {n:"TheBasics",lat:"TheBasics",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "brand"],tg:["bilingual"],w:null,url:"https://hagilda.com/thebasics/",vb:["modern"]},
  {n:"TheBasics Corporate",lat:"TheBasics Corporate",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "brand"],tg:["bilingual"],w:null,url:"https://hagilda.com/thebasicscorporate/",vb:["modern"]},
  {n:"אלפא/Bravo",lat:"Alfa/Bravo",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/alfabravo/",vb:["techy"]},
  {n:"אלפא/Bravo מונו",lat:"Alfa/Bravo Mono",fo:"hagilda",d:null,y:null,st:["mono", "sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/alfabravomono/",vb:["techy"]},
  {n:"רציף 22",lat:"Ratzif 22",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/ratzif22/",vb:["vintage"]},
  {n:"רענן Pro",lat:"Raanan Pro",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/raananpro/",vb:["modern"]},
  {n:"סקייטר",lat:"Skater",fo:"hagilda",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://hagilda.com/skater/",vb:["cursive", "sporty"]},
  {n:"אדיטור סריף Pro",lat:"Editor Serif Pro",fo:"hagilda",d:null,y:null,st:["serif"],use:["text", "book"],tg:["trilingual"],w:null,url:"https://hagilda.com/editorserifprohlar/",vb:["editorial"]},
  {n:"אדיטור סנס Pro",lat:"Editor Sans Pro",fo:"hagilda",d:null,y:null,st:["sans"],use:["text"],tg:["trilingual"],w:null,url:"https://hagilda.com/editorsansprohlar/",vb:["editorial"]},
  {n:"הטכנאי הצעיר",lat:"The Young Technay",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/theyoungtechnay/",vb:["techy", "vintage"]},
  {n:"כלבו",lat:"Colbo",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/colbo/",vb:["vintage"]},
  {n:"סימפלר Rounded",lat:"Simpler Rounded",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["text", "display"],tg:["rounded"],w:null,url:"https://hagilda.com/simplerprorounded/",vb:["friendly"]},
  {n:"סימפלר פרו",lat:"Simpler Pro",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["text", "display", "brand"],tg:["trilingual"],w:null,url:"https://hagilda.com/simplerprohlar/",vb:["modern"]},
  {n:"סימפלר פרו Ext",lat:"Simpler Pro Extended",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["trilingual", "wide"],w:null,url:"https://hagilda.com/simplerproextendedhlar/",vb:["modern"]},
  {n:"סימפלר פרו Con",lat:"Simpler Pro Condensed",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["narrow"],w:null,url:"https://hagilda.com/simplerprocondensded/",vb:["modern"]},
  {n:"סימפלר מונו",lat:"Simpler Mono",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["mono", "sans"],use:["text"],tg:["trilingual"],w:null,url:"https://hagilda.com/simplerprohlarmono/",vb:["techy"]},
  {n:"סימפלר אלטע",lat:"Simpler Alte",fo:"hagilda",d:"דני מירב (הטייס)",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/simplerproalte/",vb:["vintage"]},
  {n:"לויט 1950",lat:"Levit 1950",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["nostalgic", "revival"],w:null,url:"https://hagilda.com/levit1950/",vb:["vintage"]},
  {n:"לויט Blended",lat:"Levit Blended",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/levitblended/",vb:["vintage", "experimental"]},
  {n:"קרטיב",lat:"Kartiv",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/kartiv/",vb:["playful"]},
  {n:"ארטיק",lat:"Artic",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/artic/",vb:["playful"]},
  {n:"גרטה טקסט Pro",lat:"Greta Text Pro",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual"],w:null,url:"https://hagilda.com/greta-text-prohl/",vb:["editorial"]},
  {n:"פדרה סריף Pro",lat:"Fedra Serif Pro",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual"],w:null,url:"https://hagilda.com/fedra-serif-prohl/",vb:["editorial"]},
  {n:"פדרה סנס Pro",lat:"Fedra Sans Pro",fo:"hagilda",d:"מיכל סהר (עם Typotheque)",y:null,st:["sans"],use:["text"],tg:["bilingual"],w:null,url:"https://hagilda.com/fedra-sans-prohl/",vb:["modern"]},
  {n:"מסדה",lat:"Masada",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/masada/",vb:["modern"]},
  {n:"מסדה Mono",lat:"Masada Mono",fo:"hagilda",d:null,y:null,st:["mono"],use:["text"],tg:["bilingual"],w:null,url:"https://hagilda.com/masada-mono/",vb:["techy"]},
  {n:"רענן",lat:"Raanan",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://hagilda.com/raanan/",vb:["modern"]},
  {n:"רענן רחב",lat:"Raanan Extended",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hagilda.com/raananextended/",vb:["modern"]},
  {n:"רענן צר",lat:"Raanan Condensed",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["narrow"],w:null,url:"https://hagilda.com/raanancondensed/",vb:["modern"]},
  {n:"סאנדיי",lat:"Sunday",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/sunday/",vb:["friendly"]},
  {n:"סאנדיי מונו",lat:"Sunday Mono",fo:"hagilda",d:null,y:null,st:["mono"],use:["text", "display"],tg:[],w:null,url:"https://hagilda.com/sundaymono/",vb:["techy"]},
  {n:"אינפרא",lat:"Infra",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/infra/",vb:["techy"]},
  {n:"80kb",lat:"80kb",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/80kb/",vb:["techy", "boxy"]},
  {n:"טיגריסיבירי",lat:"Tigrisibiri",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/tigrisibiri/",vb:["quirky"]},
  {n:"פונט #37",lat:"Font #37",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/font37heb/",vb:["experimental"]},
  {n:"לימונארק",lat:"Limonarak",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/limonarak/",vb:["playful"]},
  {n:"קריסטייל",lat:"Cristyle",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/cristyle/",vb:["elegant"]},
  {n:"מרים ליברה",lat:"Miriam Libre",fo:"hagilda",d:"מיכל סהר",y:null,st:["sans"],use:["text", "display"],tg:["bilingual", "free", "revival"],w:null,url:"https://hagilda.com/miriam-libre/",vb:["vintage", "monoline"]},
  {n:"השמנים",lat:"Hashmenim",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hagilda.com/hashmenim/",vb:["boxy"]},
  {n:"מכבי בלוק",lat:"Maccabi Block",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/maccabiblock/",vb:["sporty", "vintage"]},
  {n:"המעשן סנס",lat:"The Smoker Sans",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/thesmokersans/",vb:["vintage"]},
  {n:"המעשן סריף",lat:"The Smoker Serif",fo:"hagilda",d:null,y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://hagilda.com/thesmokerserif/",vb:["vintage"]},
  {n:"ארבל הגילדה",lat:"Arbel Hagilda",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "display"],tg:["classic", "revival"],w:null,url:"https://hagilda.com/arbelg/",vb:["vintage"]},
  {n:"סטנסילז",lat:"Stencilz",fo:"hagilda",d:null,y:null,st:["stencil"],use:["display"],tg:[],w:null,url:"https://hagilda.com/stencilz/",vb:["brutalist"]},
  {n:"אינקישינוב",lat:"Inkishinov",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/inkishinov/",vb:["vintage", "quirky"]},
  {n:"ניוז",lat:"News",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://hagilda.com/news/",vb:["editorial"]},
  {n:"כוס חלב",lat:"A Glass of Milk",fo:"hagilda",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://hagilda.com/aglassofmilk/",vb:["cursive", "playful"]},
  {n:"כוס חלב דפוס",lat:"Cos Halav Dfus",fo:"hagilda",d:null,y:null,st:["hand"],use:["display"],tg:[],w:null,url:"https://hagilda.com/coshalavdfus/",vb:["playful"]},
  {n:"פרנקלי",lat:"Frankly",fo:"hagilda",d:null,y:null,st:["serif"],use:["display"],tg:["classic"],w:null,url:"https://hagilda.com/frankly/",vb:["vintage"]},
  {n:"פלסטיק",lat:"Plastic",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/plastic/",vb:["playful", "quirky"]},
  {n:"מן",lat:"Man",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/man/",vb:[]},
  {n:"קו 16",lat:"Kav 16",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/kav16/",vb:["monoline", "geometric"]},
  {n:"ניופונט",lat:"Newfont",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/newfont/",vb:["modern"]},
  {n:"חיים הגילדה",lat:"Haim Hagilda",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["classic", "narrow", "revival"],w:null,url:"https://hagilda.com/haimg/",vb:["vintage", "geometric"]},
  {n:"הצבי הגילדה",lat:"Hatzvi Hagilda",fo:"hagilda",d:null,y:null,st:["serif"],use:["display"],tg:["classic", "revival"],w:null,url:"https://hagilda.com/hatzvig/",vb:["vintage"]},
  {n:"פרנק־ריהל הגילדה",lat:"Frank-Ruhl Hagilda",fo:"hagilda",d:null,y:null,st:["serif"],use:["book", "text"],tg:["classic", "revival"],w:null,url:"https://hagilda.com/frankg/",vb:["elegant", "editorial"]},
  {n:"אהרוני הגילדה",lat:"Aharoni Hagilda",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["classic", "revival"],w:null,url:"https://hagilda.com/aharonig/",vb:["vintage", "geometric"]},
  {n:"סירוקא",lat:"Siruca",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/sirucaheb/",vb:["geometric"]},
  {n:"בלנדר",lat:"Blender",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/blender/",vb:["techy", "geometric"]},
  {n:"בלנדר מוצר",lat:"Blender Condensed",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["narrow"],w:null,url:"https://hagilda.com/blenderconsensed/",vb:["techy"]},
  {n:"ספידמן",lat:"Speedman",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hagilda.com/speedman/",vb:["sporty"]},
  {n:"דרום",lat:"South",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hagilda.com/southv2/",vb:["boxy"]},
  {n:"דרום־מערב",lat:"South-West",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hagilda.com/southwest/",vb:["boxy"]},
  {n:"אלנבי סנס",lat:"Alenbi Sans",fo:"hagilda",d:null,y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/alenbisans/",vb:["modern"]},
  {n:"אלנבי סריף",lat:"Alenbi Serif",fo:"hagilda",d:null,y:null,st:["serif"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://hagilda.com/alenbiserif/",vb:["editorial"]},
  {n:"סמי קאמבק",lat:"Semi Comeback",fo:"hagilda",d:null,y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hagilda.com/semicomeback/",vb:["vintage"]},
  /* ---- fontef (40) ---- */
  {n:"מנדטורי וריאבל",lat:"Mandatory Variable",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "nostalgic"],w:null,url:"https://fontef.com/mandatory-variable",vb:["vintage"]},
  {n:"ליון HLAR",lat:"Lyon HLAR",fo:"fontef",d:"יאנק יונטף (עם Commercial Type)",y:null,st:["serif"],use:["text", "book"],tg:["trilingual"],w:21,url:"https://fontef.com/lyon-hlar",vb:["elegant", "editorial"]},
  {n:"אברהם",lat:"Abraham",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["trilingual", "variable"],w:6,url:"https://fontef.com/abraham",vb:["brutalist"]},
  {n:"נרקיס בלוק",lat:"Narkiss Block",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text", "display"],tg:["bilingual", "variable", "revival"],w:30,url:"https://fontef.com/narkiss-block",vb:["boxy", "modern"]},
  {n:"נרקיס בלוק מונו",lat:"Narkiss Block Mono",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["mono", "sans"],use:["text", "display"],tg:["bilingual", "variable", "revival"],w:10,url:"https://fontef.com/narkiss-block-mono",vb:["techy"]},
  {n:"נרקיס יאיר",lat:"Narkiss Yair",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["variable", "revival"],w:6,url:"https://fontef.com/narkiss-yair",vb:[]},
  {n:"הדסה פרידלנדר",lat:"Hadassah Friedlaender",fo:"fontef",d:"הנרי פרידלנדר / יאנק יונטף",y:null,st:["serif"],use:["book", "text"],tg:["trilingual", "classic", "revival", "variable"],w:7,url:"https://fontef.com/hadassah-friedlaender",vb:["elegant", "editorial"]},
  {n:"נרקיס תם",lat:"Narkiss Tam",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["classic", "revival", "variable"],w:21,url:"https://fontef.com/narkiss-tam",vb:["modern"]},
  {n:"נרקיס אסף",lat:"Narkiss Asaf",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["trilingual", "revival", "variable"],w:6,url:"https://fontef.com/narkiss-asaf",vb:[]},
  {n:"קאנלה HLAR",lat:"Canela HLAR",fo:"fontef",d:"יאנק יונטף (עם Commercial Type)",y:null,st:["serif"],use:["display"],tg:["trilingual"],w:12,url:"https://fontef.com/canela-hlar",vb:["elegant"]},
  {n:"מורזילקה",lat:"Murzilka",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:[],w:3,url:"https://fontef.com/murzilka",vb:["playful", "quirky"]},
  {n:"נרקיס טקסט",lat:"Narkiss Text",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["serif"],use:["text", "book"],tg:["variable", "revival"],w:null,url:"https://fontef.com/narkiss-text",vb:["editorial"]},
  {n:"גרפיק HLAR",lat:"Graphik HLAR",fo:"fontef",d:"יאנק יונטף (עם Commercial Type)",y:null,st:["sans"],use:["text", "brand"],tg:["trilingual"],w:18,url:"https://fontef.com/graphik",vb:["modern"]},
  {n:"פרנק־ריהל וריאבל",lat:"Frank Rühl Variable",fo:"fontef",d:"רפאל פרנק / יאנק יונטף",y:null,st:["serif"],use:["book", "text"],tg:["variable", "classic", "revival"],w:null,url:"https://fontef.com/frank-ruhl-variable",vb:["elegant", "editorial"]},
  {n:"נרקיס חדש",lat:"Narkiss Hadash",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["classic", "revival"],w:21,url:"https://fontef.com/narkiss-hadash",vb:["modern"]},
  {n:"נאוקלאס",lat:"Neoklass",fo:"fontef",d:"ערן בן ברק",y:null,st:["serif"],use:["display", "text"],tg:["bilingual"],w:12,url:"https://fontef.com/neoklass",vb:["elegant", "modern"]},
  {n:"נרקיסים",lat:"Narkissim",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "revival"],w:4,url:"https://fontef.com/narkissim",vb:[]},
  {n:"היציאה הבאה",lat:"NextExit",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable"],w:8,url:"https://fontef.com/nextexit",vb:["techy"]},
  {n:"הנרי",lat:"Henri",fo:"fontef",d:"הנרי פרידלנדר / יאנק יונטף",y:null,st:["serif"],use:["display"],tg:["classic", "revival"],w:2,url:"https://fontef.com/henri",vb:["elegant"]},
  {n:"אדומה",lat:"Aduma",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable"],w:12,url:"https://fontef.com/aduma",vb:["boxy"]},
  {n:"פאוזה",lat:"Pauza",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:12,url:"https://fontef.com/pauza",vb:["modern"]},
  {n:"ליבלינג",lat:"Liebling",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "nostalgic"],w:7,url:"https://fontef.com/liebling",vb:["vintage"]},
  {n:"אולפה",lat:"Olfa",fo:"fontef",d:"יאנק יונטף",y:2011,st:["sans"],use:["display"],tg:["trilingual", "variable"],w:6,url:"https://fontef.com/olfa",vb:["quirky", "modern"]},
  {n:"נרקיס גזית",lat:"Narkiss Gazit",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["revival"],w:1,url:"https://fontef.com/narkiss-gazit",vb:["boxy"]},
  {n:"חיים וריאבל",lat:"Haim Variable",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "classic", "revival"],w:null,url:"https://fontef.com/haim-variable",vb:["vintage", "geometric"]},
  {n:"פובליקו",lat:"Publico",fo:"fontef",d:"יאנק יונטף (עם Commercial Type)",y:null,st:["serif"],use:["text", "book"],tg:["bilingual"],w:38,url:"https://fontef.com/publico",vb:["editorial"]},
  {n:"נרקיס שמשון",lat:"Narkiss Shimshon",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "revival"],w:null,url:"https://fontef.com/narkiss-shimshon",vb:["boxy"]},
  {n:"נרקיס חן",lat:"Narkiss Hen",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["revival"],w:2,url:"https://fontef.com/narkiss-hen",vb:[]},
  {n:"קסילוגרף",lat:"Xylograf",fo:"fontef",d:"יאנק יונטף",y:null,st:["serif"],use:["display"],tg:["nostalgic"],w:1,url:"https://fontef.com/xylograf",vb:["vintage", "grunge"]},
  {n:"אהרוני וריאבל",lat:"Aharoni Variable",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable", "classic", "revival"],w:null,url:"https://fontef.com/aharoni-variable",vb:["vintage", "geometric"]},
  {n:"פודי",lat:"Foodi",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["variable"],w:14,url:"https://fontef.com/foodi",vb:["playful", "friendly"]},
  {n:"מרים וריאבל",lat:"Miriam Variable",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans", "mono"],use:["text"],tg:["variable", "classic", "revival"],w:null,url:"https://fontef.com/miriam",vb:["vintage", "monoline"]},
  {n:"רוממה שפיצר",lat:"Romema Spitzer",fo:"fontef",d:"משה שפיצר / יאנק יונטף",y:null,st:["serif"],use:["text"],tg:["variable", "classic", "revival"],w:5,url:"https://fontef.com/romema-spitzer",vb:["elegant"]},
  {n:"תל אביב",lat:"Tel Aviv",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:["free"],w:11,url:"https://fontef.com/tel-aviv",vb:["vintage"]},
  {n:"נרקיס רותי",lat:"Narkiss Ruti",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["hand"],use:["display"],tg:["variable", "revival"],w:5,url:"https://fontef.com/narkiss-ruti",vb:["cursive"]},
  {n:"נרקיס שולמית",lat:"Narkiss Shulamit",fo:"fontef",d:"צבי נרקיס / יאנק יונטף",y:null,st:["hand"],use:["display"],tg:["variable", "revival"],w:5,url:"https://fontef.com/narkiss-shulamit",vb:["cursive"]},
  {n:"שישים ושבע",lat:"Sixty Seven",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:[],w:4,url:"https://fontef.com/sixty-seven",vb:["vintage"]},
  {n:"אריקה סנס",lat:"Erica Sans",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["text"],tg:["variable"],w:3,url:"https://fontef.com/erica-sans",vb:["modern"]},
  {n:"סודה",lat:"Soda",fo:"fontef",d:"יאנק יונטף",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://fontef.com/soda",vb:["playful"]},
  {n:"שבלונה",lat:"Schablona",fo:"fontef",d:"יאנק יונטף",y:null,st:["stencil", "sans"],use:["display"],tg:[],w:4,url:"https://fontef.com/schablona",vb:["brutalist"]},
  /* ---- ezer (33) ---- */
  {n:"נווה צדק",lat:"Neve Zedeq",fo:"ezer",d:"עודד עזר",y:null,st:["serif"],use:["display"],tg:["nostalgic"],w:null,url:"https://www.ezertypehouse.com/fonts/neve-zedeq",vb:["vintage"]},
  {n:"עזר אוגוסט",lat:"Ezer August",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeraugust",vb:[]},
  {n:"עזר אירו",lat:"Ezer Euro",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text", "display"],tg:["bilingual"],w:null,url:"https://www.ezertypehouse.com/fonts/ezereuro",vb:["modern"]},
  {n:"עזר אלכימאי",lat:"Ezer Alchemist",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeralchemist",vb:["modern"]},
  {n:"עזר אלכימאי נטוי",lat:"Ezer Alchemist Italic",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeralchemistitalic",vb:["cursive"]},
  {n:"עזר אנמיה",lat:"Ezer Anemia",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeranemia",vb:["experimental"]},
  {n:"עזר אקטואל",lat:"Ezer Actual",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezeractual",vb:["modern"]},
  {n:"עזר אקספרימנטה",lat:"Ezer Experimenta",fo:"ezer",d:"עודד עזר",y:2016,st:["sans"],use:["display"],tg:[],w:3,url:"https://www.ezertypehouse.com/fonts/ezerexperimenta",vb:["experimental"]},
  {n:"עזר בייסיק",lat:"Ezer Basic",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerbasic",vb:["modern"]},
  {n:"עזר בלוק",lat:"Ezer Block",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerblock",vb:["boxy"]},
  {n:"עזר דו",lat:"Ezer Du",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text", "brand"],tg:["bilingual"],w:null,url:"https://www.ezertypehouse.com/fonts/ezerdoo",vb:["modern"]},
  {n:"עזר דיאלוג",lat:"Ezer Dialogue",fo:"ezer",d:"עודד עזר + קוזימו פנצ׳יני",y:2025,st:["serif"],use:["text", "display"],tg:["trilingual"],w:6,url:"https://www.ezertypehouse.com/fonts/ezerdialogue",vb:["brutalist", "editorial"]},
  {n:"עזר הלל",lat:"Ezer Hillel",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerhillel",vb:["modern"]},
  {n:"עזר טורטליני",lat:"Ezer Tortellini",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:["rounded"],w:null,url:"https://www.ezertypehouse.com/fonts/ezertortellini",vb:["playful"]},
  {n:"עזר לופט",lat:"Ezer Luft",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerloft",vb:[]},
  {n:"עזר מעודד סנס",lat:"Ezer Meoded Sans",fo:"ezer",d:"עודד עזר",y:2005,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezermeodedsans",vb:["modern"]},
  {n:"עזר מעודד סריף",lat:"Ezer Meoded Serif",fo:"ezer",d:"עודד עזר",y:2005,st:["serif"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezermeodedserif",vb:["editorial"]},
  {n:"עזר מעודד פשוט",lat:"Ezer Meoded Pashut",fo:"ezer",d:"עודד עזר",y:2005,st:["sans"],use:["text", "display"],tg:[],w:8,url:"https://www.ezertypehouse.com/fonts/ezermeodedpashut",vb:["modern"]},
  {n:"עזר מעודד פשוט צר",lat:"Ezer Meoded Pashut Tzar",fo:"ezer",d:"עודד עזר",y:2005,st:["sans"],use:["display"],tg:["narrow"],w:null,url:"https://www.ezertypehouse.com/fonts/ezermeodedpashutcondenced",vb:["modern"]},
  {n:"עזר נע",lat:"Ezer Na",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerna",vb:[]},
  {n:"עזר סוליד",lat:"Ezer Solid",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezersolid",vb:["boxy"]},
  {n:"עזר סוסיתא",lat:"Ezer Susita",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://www.ezertypehouse.com/fonts/ezersusita",vb:["vintage"]},
  {n:"עזר סטנדרט",lat:"Ezer Standard",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerstandard",vb:["modern"]},
  {n:"עזר פרנציסקה",lat:"Ezer Franzisca",fo:"ezer",d:"עודד עזר",y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerfranzisca",vb:["elegant"]},
  {n:"עזר פרנקריהליה",lat:"Ezer Frankruhlia",fo:"ezer",d:"עודד עזר",y:null,st:["serif"],use:["text", "display"],tg:["classic", "revival"],w:null,url:"https://www.ezertypehouse.com/fonts/ezerfrankruhlya",vb:["vintage", "editorial"]},
  {n:"עזר קדים",lat:"Ezer Kadim",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerkadim",vb:[]},
  {n:"עזר קשיח",lat:"Ezer Kashiach",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerkashiach",vb:["boxy", "brutalist"]},
  {n:"עזר רץ",lat:"Ezer Rutz",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezerrutz",vb:["modern"]},
  {n:"עזר שלוותא",lat:"Ezer Shalvata",fo:"ezer",d:"עודד עזר",y:null,st:["serif"],use:["text"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezershalvata",vb:["elegant"]},
  {n:"עזר שמש",lat:"Ezer Shemesh",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezershemesh",vb:[]},
  {n:"עזר תאגיד",lat:"Ezer Taagid",fo:"ezer",d:"עודד עזר",y:null,st:["sans"],use:["text", "brand"],tg:[],w:null,url:"https://www.ezertypehouse.com/fonts/ezertaagid",vb:["modern"]},
  {n:"פיט עברי",lat:"Fit Hebrew",fo:"ezer",d:"עודד עזר + David Jonathan Ross",y:2018,st:["sans"],use:["display"],tg:["variable", "wide"],w:null,url:"https://www.ezertypehouse.com/fonts/fithebrewvf",vb:["boxy", "experimental"]},
  {n:"פלשתינה",lat:"Palastina",fo:"ezer",d:"עודד עזר",y:null,st:["serif"],use:["display"],tg:["nostalgic"],w:null,url:"https://www.ezertypehouse.com/fonts/palastina",vb:["vintage"]},
  /* ---- hafontia (26) ---- */
  {n:"לילית",lat:"Lilith",fo:"hafontia",d:"בן נתן",y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/lilith/",vb:["elegant"]},
  {n:"סהרה",lat:"Sahara",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/sahara/",vb:[]},
  {n:"אלטע זאכן",lat:"Alte Zachen",fo:"hafontia",d:"בן נתן",y:null,st:["serif"],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/alte-zachen/",vb:["vintage"]},
  {n:"ניצוץ",lat:"Nitzotz",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/nitzotz/",vb:[]},
  {n:"פולין",lat:"Polin",fo:"hafontia",d:"בן נתן",y:null,st:["serif"],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/polin/",vb:["vintage"]},
  {n:"סימונה",lat:"Simona",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://hafontia.com/family/simona/",vb:["modern"]},
  {n:"דנידין",lat:"Danidin",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["rounded"],w:null,url:"https://hafontia.com/family/danidin/",vb:["playful"]},
  {n:"ברויט",lat:"Broyt",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/broyt/",vb:["vintage"]},
  {n:"לאון",lat:"Leon",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["text", "display"],tg:[],w:null,url:"https://hafontia.com/family/leon/",vb:["modern"]},
  {n:"מנהטן",lat:"Manhattan",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["wide"],w:null,url:"https://hafontia.com/family/manhattan/",vb:["boxy", "vintage"]},
  {n:"פוטוריזם",lat:"Futurism",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/futurism/",vb:["geometric", "experimental"]},
  {n:"ערפילית",lat:"Arfilit",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/arfilit/",vb:[]},
  {n:"דיסקורדיה",lat:"Discordia",fo:"hafontia",d:"בן נתן",y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/discordia/",vb:["quirky"]},
  {n:"סאני",lat:"Sunny",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["rounded"],w:null,url:"https://hafontia.com/family/sunny/",vb:["playful", "friendly"]},
  {n:"מרדכי",lat:"Mordechai",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/mordechai/",vb:[]},
  {n:"חיים יבין",lat:"Haim Yavin",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/haim-yavin/",vb:["vintage"]},
  {n:"אוריה",lat:"Oria",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://hafontia.com/family/oria/",vb:["modern"]},
  {n:"פנטזמגוריה",lat:"Phantasmagoria",fo:"hafontia",d:"בן נתן",y:null,st:["serif"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/phantasmagoria/",vb:["quirky", "elegant"]},
  {n:"אלה סנס",lat:"Ella Sans",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["text"],tg:[],w:null,url:"https://hafontia.com/family/ella-sans/",vb:["modern"]},
  {n:"בזלת",lat:"Basalt",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/basalt/",vb:["boxy"]},
  {n:"פטיש",lat:"Hammer Pro",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/hammer-pro/",vb:["brutalist"]},
  {n:"ימים ולילות",lat:"Days & Nights",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/daysnights/",vb:[]},
  {n:"קואופרטיב",lat:"Cooperative",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:["nostalgic"],w:null,url:"https://hafontia.com/family/cooperative/",vb:["vintage"]},
  {n:"חשמל",lat:"Hashmal",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/hashmal/",vb:["techy"]},
  {n:"פופר",lat:"Popper",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/popper/",vb:["playful"]},
  {n:"שבתאי",lat:"Shabtai",fo:"hafontia",d:"בן נתן",y:null,st:["sans"],use:["display"],tg:[],w:null,url:"https://hafontia.com/family/shabtai/",vb:[]},
  /* ---- reisinger (6) ---- */
  {n:"ירדן (מכביה)",lat:"Yarden",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["vintage", "geometric"]},
  {n:"עידן (דניאל)",lat:"Idan",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["vintage", "geometric"]},
  {n:"מיכל (טכניון)",lat:"Michal",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["vintage", "geometric"]},
  {n:"אמיר (קשב)",lat:"Amir",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["vintage", "geometric"]},
  {n:"נטע (מלון)",lat:"Neta",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["vintage", "geometric"]},
  {n:"יונתן",lat:"Yonatan",fo:"reisinger",d:"דן ריזינגר / הפונטיה",y:2024,st:["sans"],use:["display"],tg:["bilingual", "free"],w:null,url:"https://reisinger.hafontia.com/",vb:["vintage", "geometric"]},
];

/* ============================================================ */

const norm = (s) => (s || "").toLowerCase();

export default function HebrewTypeIndex() {
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      <div className="mb-8 border-3 border-off-black bg-tetris-yellow p-6 shadow-brutalist relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '14px 14px' }}></div>
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-widest text-off-black/70 mb-2">אינדקס ◌ משאבים לסטודנטים לעיצוב גרפי</p>
          <h1 className="font-shimshon text-4xl sm:text-5xl md:text-6xl mb-3">אינדקס <span className="text-tetris-purple">הפונט העברי</span></h1>
          <p className="text-off-black/80 text-sm sm:text-base max-w-2xl font-ibm">
            {FONTS.length} משפחות פונטים מ־{Object.keys(FOUNDRIES).length} בתי פונטים ישראליים עצמאיים.
            סינון לפי סגנון, שימוש, מעצב/ת, תקופה ומאפיינים — כל פונט מקושר לעמוד המקורי שלו.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex-1 min-w-[260px] relative">
          <input
            className="w-full border-3 border-off-black bg-off-white px-4 py-2.5 font-ibm text-base outline-none focus:shadow-brutalist transition-shadow"
            placeholder="חיפוש פונט, שם לועזי או מעצב/ת…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="border-3 border-off-black bg-off-white px-3 py-2.5 font-ibm text-sm cursor-pointer outline-none focus:shadow-brutalist transition-shadow" value={designer} onChange={(e) => setDesigner(e.target.value)}>
          <option value="">כל המעצבים/ות</option>
          {designers.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="border-3 border-off-black bg-off-white px-3 py-2.5 font-ibm text-sm cursor-pointer outline-none focus:shadow-brutalist transition-shadow" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">מיון: א—ת</option>
          <option value="newest">מיון: חדש → ישן</option>
          <option value="oldest">מיון: ישן → חדש</option>
          <option value="weights">מיון: הכי הרבה משקלים</option>
        </select>
        {activeCount > 0 && (
          <button className="border-3 border-off-black bg-off-black text-off-white px-4 py-2.5 font-ibm text-sm font-bold cursor-pointer hover:bg-tetris-purple transition-colors flex items-center gap-2" onClick={clearAll}>
            ניקוי ({activeCount})
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-8 bg-off-white border-3 border-off-black p-5 shadow-brutalist">
        <div className="flex flex-wrap gap-2 items-baseline">
          <span className="text-xs font-bold tracking-widest text-off-black/70 min-w-[76px]">בית פונטים</span>
          {Object.entries(FOUNDRIES).map(([id, fo]) => (
            <button
              key={id}
              className={cn(
                "border-2 border-off-black px-3 py-1 text-sm rounded-full transition-transform hover:-translate-y-0.5 font-ibm",
                foundries.includes(id) ? "text-white" : "bg-off-white"
              )}
              style={foundries.includes(id) ? { background: fo.color, borderColor: fo.color } : { borderColor: fo.color, color: fo.color }}
              onClick={() => toggle(setFoundries)(id)}
            >
              {fo.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-baseline">
          <span className="text-xs font-bold tracking-widest text-off-black/70 min-w-[76px]">סגנון</span>
          {Object.entries(STYLES).map(([id, label]) => (
            <button key={id} className={cn("border-2 border-off-black px-3 py-1 text-sm rounded-full transition-transform hover:-translate-y-0.5 font-ibm", styles.includes(id) ? "bg-off-black text-off-white" : "bg-off-white text-off-black")} onClick={() => toggle(setStyles)(id)}>{label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-baseline">
          <span className="text-xs font-bold tracking-widest text-off-black/70 min-w-[76px]">שימוש</span>
          {Object.entries(USES).map(([id, label]) => (
            <button key={id} className={cn("border-2 border-off-black px-3 py-1 text-sm rounded-full transition-transform hover:-translate-y-0.5 font-ibm", uses.includes(id) ? "bg-off-black text-off-white" : "bg-off-white text-off-black")} onClick={() => toggle(setUses)(id)}>{label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-baseline">
          <span className="text-xs font-bold tracking-widest text-off-black/70 min-w-[76px]">מאפיינים</span>
          {Object.entries(TAGS).map(([id, label]) => (
            <button key={id} className={cn("border-2 border-off-black px-3 py-1 text-sm rounded-full transition-transform hover:-translate-y-0.5 font-ibm", tags.includes(id) ? "bg-off-black text-off-white" : "bg-off-white text-off-black")} onClick={() => toggle(setTags)(id)}>{label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-baseline">
          <span className="text-xs font-bold tracking-widest text-off-black/70 min-w-[76px]">VIBE</span>
          {Object.entries(VIBES).map(([id, label]) => (
            <button key={id} className={cn("border-2 border-off-black px-3 py-1 text-sm rounded-full transition-transform hover:-translate-y-0.5 font-ibm", vibes.includes(id) ? "bg-tetris-purple text-off-white border-tetris-purple" : "bg-off-white text-off-black")} onClick={() => toggle(setVibes)(id)}>{label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-baseline">
          <span className="text-xs font-bold tracking-widest text-off-black/70 min-w-[76px]">תקופה</span>
          {ERAS.map((e) => (
            <button key={e.id} className={cn("border-2 border-off-black px-3 py-1 text-sm rounded-full transition-transform hover:-translate-y-0.5 font-ibm", eras.includes(e.id) ? "bg-off-black text-off-white" : "bg-off-white text-off-black")} onClick={() => toggle(setEras)(e.id)}>{e.label}</button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-baseline mb-6 flex-wrap gap-3">
        <div className="font-shimshon text-2xl">
          <b className="text-tetris-purple">{results.length}</b> פונטים נמצאו
        </div>
        {(tags.length + vibes.length) > 1 && <div className="text-xs text-off-black/70 font-ibm">מאפיינים מסוננים יחד (וגם־וגם)</div>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.length === 0 && (
          <div className="col-span-full border-3 border-dashed border-off-black/30 p-12 text-center text-off-black/60 font-ibm text-lg">
            לא נמצאו פונטים שעונים על כל התנאים.<br />נסו להסיר חלק מהסינונים.
          </div>
        )}
        {results.map((x, i) => {
          const fo = FOUNDRIES[x.fo];
          return (
            <article 
              className="border-3 border-off-black bg-off-white p-5 flex flex-col gap-2 transition-all hover:-translate-y-1 hover:-translate-x-1 group" 
              key={x.lat + i} 
              style={{ boxShadow: `4px 4px 0 ${fo.color}` }}
            >
              <div className="flex justify-between items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: fo.color }}>{fo.name}</span>
                <span className="text-xs text-off-black/60 font-mono">{x.y ?? "—"}</span>
              </div>
              <h3 className="font-shimshon text-3xl leading-tight m-0">{x.n}</h3>
              <div className="text-sm text-off-black/60 tracking-wide dir-ltr text-right -mt-1 font-ibm">{x.lat}</div>
              <div className="text-sm font-ibm mt-1"><span className="text-off-black/60">עיצוב: </span>{x.d ?? "—"}</div>
              
              <div className="flex flex-wrap gap-1.5 mt-2">
                {x.st.map((s) => <span key={s} className="text-[11px] border border-off-black/40 px-2 py-0.5 rounded-full text-off-black/70">{STYLES[s]}</span>)}
                {x.tg.includes("free") && <span className="text-[11px] border border-tetris-purple bg-tetris-purple text-white font-bold px-2 py-0.5 rounded-full">חינמי</span>}
                {x.tg.includes("variable") && <span className="text-[11px] border border-tetris-purple text-tetris-purple font-semibold px-2 py-0.5 rounded-full">וריאבלי</span>}
                {x.tg.includes("trilingual") && <span className="text-[11px] border border-tetris-purple text-tetris-purple font-semibold px-2 py-0.5 rounded-full">עב׳·ער׳·אנ׳</span>}
                {x.tg.includes("bilingual") && !x.tg.includes("trilingual") && <span className="text-[11px] border border-off-black/40 px-2 py-0.5 rounded-full text-off-black/70">דו־לשוני</span>}
                {x.tg.includes("narrow") && <span className="text-[11px] border border-off-black/40 px-2 py-0.5 rounded-full text-off-black/70">צר</span>}
                {x.tg.includes("wide") && <span className="text-[11px] border border-off-black/40 px-2 py-0.5 rounded-full text-off-black/70">רחב</span>}
                {x.tg.includes("rounded") && <span className="text-[11px] border border-off-black/40 px-2 py-0.5 rounded-full text-off-black/70">מעוגל</span>}
                {x.tg.includes("nostalgic") && <span className="text-[11px] border border-off-black/40 px-2 py-0.5 rounded-full text-off-black/70">נוסטלגי</span>}
                {x.tg.includes("classic") && <span className="text-[11px] border border-off-black/40 px-2 py-0.5 rounded-full text-off-black/70">קלאסי</span>}
                {x.vb.map((v) => <span key={v} className="text-[11px] border border-dashed border-tetris-purple text-tetris-purple px-2 py-0.5 rounded-full">{VIBES[v] || v}</span>)}
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-dashed border-off-black/30">
                <span className="text-xs text-off-black/60 font-ibm">{x.w ? `${x.w} משקלים` : "מס׳ משקלים —"}</span>
                <a className="text-sm font-bold text-off-black no-underline hover:text-tetris-purple flex items-center gap-1 font-ibm transition-colors" href={x.url} target="_blank" rel="noreferrer">
                  לעמוד הפונט
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="mt-10 text-xs text-off-black/60 border-t-2 border-off-black pt-4 flex justify-between flex-wrap gap-3 font-ibm">
        <span>הנתונים נאספו מאתרי בתי הפונטים. שדות המסומנים ב־“—” טרם אומתו.</span>
        <span>המילון · index-design-hit</span>
      </footer>
    </div>
  );
}
