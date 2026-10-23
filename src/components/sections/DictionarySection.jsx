import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, ChevronDown } from "lucide-react";
import { getTagColor, getTagTextClass } from "@/lib/tagColors";
import { FOUNDRIES, STYLES, USES, TAGS, VIBES, ERAS, FONTS, fontSlug } from "@/data/fonts";
import previewSlugs from "@/data/font-previews.json";
import FilterToggle from "@/components/ui/FilterToggle";
import SaveItemButton from "@/components/ui/SaveItemButton";

const PREVIEW_SLUGS = new Set(previewSlugs);

const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test((text || "").trim());

const usesWhiteText = (bgClass) => bgClass === "bg-tetris-purple";

const FilterChip = ({ label, isActive, activeBg, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-2.5 md:py-1.5",
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

const FilterAccordion = ({ label, activeCount = 0, isOpen, onToggle, toolbar, scrollable = false, children }) => (
  <div className="border-2 border-off-black mb-2 last:mb-0">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className={cn(
        "w-full flex items-center justify-between gap-2 px-3 py-2.5",
        "text-right transition-colors duration-200",
        isOpen ? "bg-tetris-yellow" : "bg-light-gray hover:bg-light-gray/70"
      )}
    >
      <span className="flex items-center gap-2">
        <span className="font-headline text-sm font-bold text-off-black">{label}</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-tetris-pink border-2 border-off-black text-[11px] font-bold text-off-black">
            {activeCount}
          </span>
        )}
      </span>
      <ChevronDown
        className={cn(
          "w-4 h-4 text-off-black transition-transform duration-200 shrink-0",
          isOpen && "rotate-180"
        )}
      />
    </button>
    {isOpen && (
      <div className="p-3 border-t-2 border-off-black bg-off-white">
        {toolbar && <div className="mb-3">{toolbar}</div>}
        <div className={cn("flex flex-wrap gap-2", scrollable && "max-h-60 overflow-y-auto pe-1")}>
          {children}
        </div>
      </div>
    )}
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
  const [openGroup, setOpenGroup] = useState(null);
  const [vibeQuery, setVibeQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const designers = useMemo(() => {
    const set = new Set(FONTS.map((x) => x.d).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "he"));
  }, []);

  const vibeEntries = useMemo(() => {
    const all = Object.entries(VIBES);
    const q = vibeQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(([, label]) => label.toLowerCase().includes(q));
  }, [vibeQuery]);

  const toggle = (setter) => (val) =>
    setter((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));

  const toggleGroup = (id) => setOpenGroup((prev) => (prev === id ? null : id));

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
    setQuery(""); setFoundries([]); setStyles([]); setUses([]); setTags([]); setVibes([]); setEras([]); setDesigner(""); setVibeQuery("");
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
        <FilterToggle
          isOpen={showFilters}
          onToggle={() => setShowFilters((prev) => !prev)}
          activeCount={foundries.length + styles.length + uses.length + tags.length + vibes.length + eras.length}
          className="py-2.5"
        />
      </div>

      {showFilters && (
      <div className="mb-8 p-4 bg-off-white border-3 border-off-black shadow-brutalist-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="font-headline font-bold text-base text-off-black">סינון</h3>
          <span className="font-ibm text-xs text-dark-gray">לחצו על קטגוריה כדי לפתוח</span>
        </div>

        <FilterAccordion
          label="בית פונטים"
          activeCount={foundries.length}
          isOpen={openGroup === "foundries"}
          onToggle={() => toggleGroup("foundries")}
        >
          {Object.entries(FOUNDRIES).map(([id, fo]) => (
            <FilterChip
              key={id}
              label={fo.name}
              isActive={foundries.includes(id)}
              activeBg={getTagColor(fo.name)}
              onClick={() => toggle(setFoundries)(id)}
            />
          ))}
        </FilterAccordion>

        <FilterAccordion
          label="סגנון"
          activeCount={styles.length}
          isOpen={openGroup === "styles"}
          onToggle={() => toggleGroup("styles")}
        >
          {Object.entries(STYLES).map(([id, label]) => (
            <FilterChip
              key={id}
              label={label}
              isActive={styles.includes(id)}
              activeBg={getTagColor(label)}
              onClick={() => toggle(setStyles)(id)}
            />
          ))}
        </FilterAccordion>

        <FilterAccordion
          label="שימוש"
          activeCount={uses.length}
          isOpen={openGroup === "uses"}
          onToggle={() => toggleGroup("uses")}
        >
          {Object.entries(USES).map(([id, label]) => (
            <FilterChip
              key={id}
              label={label}
              isActive={uses.includes(id)}
              activeBg={getTagColor(label)}
              onClick={() => toggle(setUses)(id)}
            />
          ))}
        </FilterAccordion>

        <FilterAccordion
          label="מאפיינים"
          activeCount={tags.length}
          isOpen={openGroup === "tags"}
          onToggle={() => toggleGroup("tags")}
        >
          {Object.entries(TAGS).map(([id, label]) => (
            <FilterChip
              key={id}
              label={label}
              isActive={tags.includes(id)}
              activeBg={getTagColor(label)}
              onClick={() => toggle(setTags)(id)}
            />
          ))}
        </FilterAccordion>

        <FilterAccordion
          label="VIBE"
          activeCount={vibes.length}
          isOpen={openGroup === "vibes"}
          onToggle={() => toggleGroup("vibes")}
          scrollable
          toolbar={
            <input
              className={cn(
                "w-full border-2 border-off-black bg-off-white",
                "px-3 py-2 font-headline text-sm text-off-black",
                "outline-none focus:shadow-brutalist-xs transition-shadow"
              )}
              placeholder="חיפוש מאפיין ויזואלי…"
              value={vibeQuery}
              onChange={(e) => setVibeQuery(e.target.value)}
            />
          }
        >
          {vibeEntries.length === 0 ? (
            <p className="w-full text-xs text-dark-gray font-ibm py-1">לא נמצאו מאפיינים תואמים.</p>
          ) : (
            vibeEntries.map(([id, label]) => (
              <FilterChip
                key={id}
                label={label}
                isActive={vibes.includes(id)}
                activeBg={getTagColor(label)}
                onClick={() => toggle(setVibes)(id)}
              />
            ))
          )}
        </FilterAccordion>

        <FilterAccordion
          label="תקופה"
          activeCount={eras.length}
          isOpen={openGroup === "eras"}
          onToggle={() => toggleGroup("eras")}
        >
          {ERAS.map((e) => (
            <FilterChip
              key={e.id}
              label={e.label}
              isActive={eras.includes(e.id)}
              activeBg={getTagColor(e.label)}
              onClick={() => toggle(setEras)(e.id)}
            />
          ))}
        </FilterAccordion>

        {(tags.length + vibes.length) > 1 && (
          <p className="text-xs text-dark-gray font-ibm mt-3">
            מאפיינים מסוננים יחד (וגם־וגם)
          </p>
        )}
      </div>
      )}

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
            const slug = fontSlug(x);
            const hasPreview = PREVIEW_SLUGS.has(slug);
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
                id={`search-item-dictionary-${String(x.lat || x.n).replace(/[^a-zA-Z0-9_-]/g, '-')}`}
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
                {hasPreview && (
                  <div className="border-b-3 border-off-black bg-light-gray">
                    <img
                      src={`/font-previews/${slug}.webp`}
                      alt={`דוגמה ויזואלית של הפונט ${x.n}`}
                      loading="lazy"
                      className="w-full h-36 object-cover object-center"
                    />
                  </div>
                )}
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-mid-gray font-jersey tabular-nums">{x.y ?? "—"}</span>
                      <SaveItemButton
                        sectionId="dictionary"
                        itemId={x.lat || x.n}
                        size="sm"
                        snapshot={{
                          titleHe: x.n || "",
                          titleEn: x.lat || "",
                          description: [fo?.name, x.d].filter(Boolean).join(" · "),
                          link: x.url || "",
                          image: hasPreview ? `/font-previews/${slug}.webp` : "",
                          tags: cardTags.slice(0, 5),
                          badge: fo?.name || "פונט",
                        }}
                      />
                    </div>
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
