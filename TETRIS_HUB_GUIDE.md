# 🎮 TETRIS DESIGN HUB - מדריך שלב אחר שלב
## האב משאבים לסטודנטים לעיצוב גרפי

---

## 📋 MASTER CHECKLIST - תוכנית העבודה המלאה

### שלב 1: תכנון ועיצוב (Design Phase)
- [ ] קריאת המדריך המלא
- [ ] הכנת פלטת צבעים
- [ ] עיצוב רכיבים ב-Figma
- [ ] יצירת מערכת אייקונים בסגנון טטריס
- [ ] עיצוב אנימציות טטריס

### שלב 2: הקמת Notion (Content Setup)
- [ ] יצירת חשבון Notion
- [ ] הגדרת טבלאות RTL
- [ ] יצירת 5 מסדי נתונים
- [ ] מילוי תוכן לדוגמה בעברית
- [ ] קבלת מפתחות API

### שלב 3: פיתוח עם Cursor AI (Development)
- [ ] התקנת Node.js
- [ ] יצירת פרויקט
- [ ] הגדרת Cursor AI
- [ ] בניית רכיבים RTL
- [ ] אינטגרציה עם Notion
- [ ] הוספת אנימציות טטריס

### שלב 4: השקה (Deployment)
- [ ] העלאה ל-GitHub
- [ ] פריסה ב-Vercel
- [ ] בדיקות RTL
- [ ] בדיקות נייד
- [ ] השקה!

---

## 🎨 PART 1: COLOR PALETTE - פלטת הצבעים

### הצבעים שלך (Neo-Brutalist Tetris Palette):

```css
/* Primary Colors - צבעים ראשיים */
--tetris-purple: #7D53FA;      /* Purple */
--tetris-green: #36EF79;       /* Green */
--tetris-orange: #FD982E;      /* Orange */

/* Secondary Colors - צבעים משניים */
--tetris-pink: #F9A8D4;        /* Soft Pink */
--tetris-yellow: #FDE047;      /* Soft Yellow */
--tetris-blue: #93C5FD;        /* Soft Blue */
--tetris-cyan: #67E8F9;        /* Soft Cyan */

/* Neutrals - ניטרלים */
--off-black: #1F1F1F;          /* Not quite black */
--dark-gray: #404040;          /* Dark text */
--off-white: #FAFAF9;          /* Not quite white */
--light-gray: #F5F5F4;         /* Backgrounds */

/* Neo-Brutalist Shadows - צללים */
--shadow-color: #1F1F1F;       /* For drop shadows */
--border-width: 3px;           /* Thick borders */
```

### איך להשתמש:
```css
/* Example Card - כרטיס לדוגמה */
.tetris-card {
  background: var(--tetris-purple);
  border: var(--border-width) solid var(--off-black);
  box-shadow: 6px 6px 0px var(--shadow-color);
}
```

---

## 🎯 PART 2: FIGMA COMPONENTS LIST - רשימת רכיבים לעיצוב

### חובה לעצב ב-Figma (Must Design):

#### 1. **Tetris Block Components - בלוקי טטריס**
SEO Search: "tetris blocks figma", "geometric shapes figma", "pixel art components"

רכיבים לעיצוב:
- [ ] I-Block (ישר)
- [ ] O-Block (ריבוע)
- [ ] T-Block (טי)
- [ ] S-Block (אס)
- [ ] Z-Block (זד)
- [ ] J-Block (ג׳יי)
- [ ] L-Block (אל)

כל בלוק ב-7 צבעים שונים

#### 2. **Navigation Bar - תפריט ניווט**
SEO Search: "brutalist navigation figma", "thick border navbar", "RTL navigation bar"

- [ ] לוגו (טטריס מונפש)
- [ ] תפריט ראשי (5 קישורים)
- [ ] חיפוש עם אייקון
- [ ] כפתור נייד (המבורגר)
- [ ] גרסה RTL + LTR

#### 3. **Hero Section - סקשן ראשי**
SEO Search: "brutalist hero section", "neo-brutalism landing page", "tetris animation hero"

- [ ] כותרת גדולה (H1)
- [ ] תת-כותרת
- [ ] 2 כפתורי CTA
- [ ] אנימציית רקע (בלוקי טטריס נופלים)
- [ ] גרסה נייד

#### 4. **Resource Cards - כרטיסי משאבים**
SEO Search: "brutalist card design", "thick shadow cards", "neo-brutalism cards figma"

סוגים:
- [ ] Resource Card - משאב בודד
  - כותרת
  - תיאור
  - תגיות (טטריס blocks כתגיות)
  - אייקון קישור
  - כפתור "שמור"
  - סטייט: Default, Hover, Featured

- [ ] Location Card - כרטיס מיקום
  - שם
  - כתובת
  - טיפ לסטודנט
  - דירוג (כוכבים)
  - שעות פתיחה

- [ ] Book Card - כרטיס ספר
  - תמונת כריכה
  - כותרת
  - מחבר
  - למה לקרוא
  - "Featured" badge

#### 5. **Category Tags - תגיות קטגוריה**
SEO Search: "brutalist tags", "pill buttons figma", "category chips neo-brutalism"

- [ ] טיפוגרפיה (בלוק סגול)
- [ ] מוקאפים (בלוק ירוק)
- [ ] AI Tools (בלוק כתום)
- [ ] תוכנות (בלוק כחול)
- [ ] כל אחד בצורת בלוק טטריס עם צל

#### 6. **Section Headers - כותרות סקשנים**
SEO Search: "brutalist typography", "thick text borders", "display font headers"

- [ ] H1 - כותרת ראשית (90px)
- [ ] H2 - כותרת סקשן (48px)
- [ ] H3 - כותרת קטגוריה (32px)
- [ ] כל אחד עם outline או shadow

#### 7. **Buttons - כפתורים**
SEO Search: "neo-brutalism buttons", "chunky buttons figma", "drop shadow buttons"

סטייטים:
- [ ] Primary Button (סגול)
  - Default
  - Hover (תזוזת צל)
  - Active (לחוץ)
  - Disabled

- [ ] Secondary Button (לבן עם מסגרת)
- [ ] Icon Button (רק אייקון)
- [ ] CTA Button (כתום, גדול)

#### 8. **Search Bar - שורת חיפוש**
SEO Search: "brutalist search bar", "thick border input field"

- [ ] Input field עם מסגרת עבה
- [ ] אייקון חיפוש (משקפת בסגנון טטריס)
- [ ] Placeholder text
- [ ] Focus state
- [ ] גרסה RTL

#### 9. **Student Tips Cards - כרטיסי טיפים**
SEO Search: "quote cards brutalist", "testimonial cards thick border"

- [ ] טקסט הטיפ
- [ ] קטגוריה (אייקון טטריס)
- [ ] מספר הצבעות
- [ ] כפתורי upvote/downvote
- [ ] Border עבה + shadow

#### 10. **Tetris Loader - אנימציית טעינה**
SEO Search: "tetris loading animation", "pixel art loader", "geometric loading spinner"

- [ ] בלוקי טטריס נופלים ומסתדרים
- [ ] גרסת לופ אינסופית
- [ ] 3 צבעים מתחלפים

#### 11. **Footer - כותרת תחתונה**
SEO Search: "brutalist footer design", "chunky footer layout"

- [ ] 3 עמודות מידע
- [ ] לינקים חברתיים (אייקונים בסגנון טטריס)
- [ ] Copyright
- [ ] "Built by students" badge

#### 12. **Mobile Menu - תפריט נייד**
SEO Search: "mobile hamburger menu brutalist", "full screen mobile nav"

- [ ] Hamburger icon (3 קווים עבים)
- [ ] Full-screen overlay
- [ ] רשימת ניווט (גדולה)
- [ ] אנימציית פתיחה/סגירה
- [ ] כפתור סגירה (X גדול)

#### 13. **Icons Set - סט אייקונים**
SEO Search: "pixel art icons", "geometric icons", "tetris style icons"

אייקונים נדרשים (בסגנון טטריס):
- [ ] Toolbox (ארגז כלים)
- [ ] Museum (אייקון מוזיאון)
- [ ] Library (ספר)
- [ ] Map Pin (סיכת מפה)
- [ ] Users (אנשים)
- [ ] Search (משקפת)
- [ ] Star (כוכב)
- [ ] Heart (לב)
- [ ] Download (הורדה)
- [ ] Link (קישור)
- [ ] Menu (המבורגר)
- [ ] Close (X)

כל אייקון: 24x24px grid, בסגנון פיקסלי/טטריס

#### 14. **Featured Badge - תג מומלץ**
SEO Search: "badge design brutalist", "featured sticker"

- [ ] "FEATURED" text
- [ ] צורת בלוק טטריס
- [ ] צבע צהוב בולט
- [ ] צל עבה
- [ ] גודל: 100x40px

#### 15. **Responsive Breakpoints - נקודות שבירה**
- [ ] Desktop: 1440px
- [ ] Laptop: 1024px
- [ ] Tablet: 768px
- [ ] Mobile: 375px

עיצוב כל רכיב בכל הגדלים!

---

## 📱 PART 3: FIGMA WORKFLOW - תהליך העבודה

### הגדרת פרויקט חדש:

1. **Create New Figma File**
   - [ ] שם: "Tetris Design Hub - דף משאבים"
   - [ ] Setup: Frame 1440x900 (Desktop)

2. **Create Color Styles**
   - [ ] צור Color Styles לכל צבע בפלטה
   - [ ] שם בעברית: "סגול רך", "ירוק רך", וכו׳

3. **Create Text Styles**
```
H1 - Heading XL
- Font: Rubik Bold (תומך עברית)
- Size: 90px
- Line height: 100%
- RTL support

H2 - Heading Large  
- Font: Rubik Bold
- Size: 48px
- Line height: 110%

H3 - Heading Medium
- Font: Rubik SemiBold
- Size: 32px

Body Large
- Font: Rubik Regular
- Size: 18px
- Line height: 150%

Body Regular
- Font: Rubik Regular
- Size: 16px
- Line height: 150%

Caption
- Font: Rubik Medium
- Size: 14px
```

4. **Create Component Library**
   - [ ] צור page בשם "Components"
   - [ ] ארגן לפי קטגוריות:
     - Navigation
     - Cards
     - Buttons
     - Forms
     - Icons
     - Badges

5. **Create Prototype**
   - [ ] קשר את כל הדפים
   - [ ] הוסף אנימציות מעבר
   - [ ] טסט RTL navigation

---

## 🔄 PART 4: NOTION RTL SETUP - הגדרת Notion לעברית

### Step 1: Create Notion Account
- [ ] לך ל-https://notion.so
- [ ] הירשם עם אימייל סטודנט (.ac.il)
- [ ] אשר אימייל

### Step 2: Enable RTL in Notion

**Important: Notion doesn't have native RTL support, but we can work around it!**

#### Method 1: Browser Extension (המלצה)
1. [ ] התקן "Notion RTL" Chrome Extension
   - חפש: "Notion RTL extension"
   - או: "Right-to-Left for Notion"
2. [ ] הפעל ב-Notion pages
3. [ ] כל הטקסט יופיע RTL

#### Method 2: Manual RTL per Database
בכל database:
1. [ ] לחץ על Properties (מאפיינים)
2. [ ] בחר Text property
3. [ ] הקלד טקסט בעברית
4. [ ] Notion יזהה אוטומטית RTL

### Step 3: Create Databases

#### Database 1: משאבים (Resources)
```
שם Database: 🛠️ משאבים

Properties:
✅ שם (Title) - Title type
✅ תיאור (Text)
✅ קטגוריה (Select)
   אפשרויות:
   - טיפוגרפיה
   - מוקאפים
   - כלי AI
   - תוכנות
✅ סקשן (Select)
   אפשרויות:
   - ארגז כלים
   - המוזיאון
   - הספרייה
   - מפה מקומית
   - סטודנט לסטודנט
✅ קישור (URL)
✅ טיפ לסטודנט (Text)
✅ מומלץ (Checkbox)
✅ תגיות (Multi-select)
```

**טיפ:** ליצור view חדש שנקרא "מומלצים" עם פילטר: מומלץ = checked

#### Database 2: מיקומים (Locations)
```
שם Database: 📍 מיקומים

Properties:
✅ שם (Title)
✅ קטגוריה (Select)
   - בית דפוס
   - חנות אמנות
   - אוצר נסתר
✅ כתובת (Text)
✅ שעות פעילות (Text)
✅ טיפ לסטודנט (Text)
✅ טלפון (Phone)
✅ מומלץ (Checkbox)
✅ דירוג (Number) - 1-5
```

#### Database 3: ספרים (Books)
```
שם Database: 📚 ספרים

Properties:
✅ כותרת (Title)
✅ מחבר (Text)
✅ למה לקרוא (Text)
✅ תמונת כריכה (URL)
✅ מומלץ (Checkbox)
✅ קטגוריה (Select)
   - טיפוגרפיה
   - עיצוב
   - השראה
   - קריירה
```

#### Database 4: טיפים מסטודנטים (Student Tips)
```
שם Database: 💡 טיפים

Properties:
✅ טיפ (Title)
✅ קטגוריה (Select)
   - ביקורות
   - ניהול פרויקטים
   - ניווט בפקולטה
✅ הצבעות (Number)
✅ אושר (Checkbox)
```

#### Database 5: מעצבים (Designers)
```
שם Database: 🎨 מעצבים

Properties:
✅ שם (Title)
✅ תקופה (Text) - "1931-2014"
✅ מפורסם בזכות (Text)
✅ ביוגרפיה (Text - Long)
✅ מומלץ (Checkbox)
```

### Step 4: Get API Credentials

1. **Create Integration**
   - [ ] לך ל-https://www.notion.so/my-integrations
   - [ ] לחץ "+ אינטגרציה חדשה"
   - [ ] שם: "Tetris Design Hub"
   - [ ] Workspace: בחר את ה-workspace שלך
   - [ ] לחץ "שלח"
   - [ ] **העתק את ה-Secret Key** (מתחיל ב-`secret_`)
   - [ ] שמור במקום בטוח!

2. **Connect Databases to Integration**
   
   לכל אחד מ-5 ה-databases:
   - [ ] פתח את ה-database כדף מלא
   - [ ] לחץ על ⋯ (שלוש נקודות) למעלה מימין
   - [ ] לחץ "+ הוסף חיבורים"
   - [ ] בחר "Tetris Design Hub"
   - [ ] לחץ "אשר"

3. **Get Database IDs**
   
   לכל database:
   - [ ] פתח כדף מלא
   - [ ] העתק את ה-URL
   - [ ] ה-URL נראה כך: `https://notion.so/workspace/[DATABASE_ID]?v=...`
   - [ ] ה-DATABASE_ID הוא המחרוזת של 32 תווים
   - [ ] שמור את כל 5 ה-IDs

### Step 5: Add Sample Content (Hebrew)

#### דוגמאות למשאבים:
```
שם: Adobe Fonts
תיאור: למעלה מ-1000 משפחות פונטים עם Creative Cloud
קטגוריה: טיפוגרפיה
טיפ: השתמש באימייל הסטודנט שלך לגישה חינמית
מומלץ: ✓
תגיות: פונטים, adobe, הנחת סטודנט

---

שם: Figma Education
תיאור: תוכנית Pro חינמית לסטודנטים
קטגוריה: תוכנות
טיפ: הירשם עם כתובת .edu או .ac.il
מומלץ: ✓
תגיות: UI, עיצוב, שיתוף פעולה

---

שם: Remove.bg
תיאור: הסרת רקע מבוססת AI
קטגוריה: כלי AI
טיפ: חינם עבור תמונות ברזולוציה נמוכה
תגיות: AI, עריכת תמונות
```

#### דוגמאות למיקומים:
```
שם: המרכז להדפסה מהירה
קטגוריה: בית דפוס
כתובת: רחוב הרצל 123, תל אביב
שעות: א׳-ה׳ 8:00-20:00
טיפ: 10% הנחה עם תעודת סטודנט
טלפון: 03-1234567
מומלץ: ✓
דירוג: 4.5
```

#### דוגמאות לטיפים:
```
טיפ: תמיד תדפיס את העבודה - מסכים משקרים
קטגוריה: ביקורות
הצבעות: 47
אושר: ✓

---

טiפ: תתחיל עם סקיצות, לא עם המחשב. 20 רעיונות מהירים > רעיון אחד מלוטש ורע
קטגוריה: ניהול פרויקטים
הצבעות: 55
אושר: ✓
```

---

## 💻 PART 5: CURSOR AI DEVELOPMENT - פיתוח עם Cursor

### Setup Development Environment

#### Step 1: Install Prerequisites
- [ ] הורד והתקן Node.js מ-https://nodejs.org (LTS version)
- [ ] וודא שיש לך Cursor AI מותקן
- [ ] פתח Terminal (או Command Prompt ב-Windows)

#### Step 2: Create Project Folder
```bash
mkdir tetris-design-hub
cd tetris-design-hub
```

#### Step 3: Open in Cursor
```bash
cursor .
```

#### Step 4: Initialize Project

**📝 PROMPT FOR CURSOR #1:**
```
Create a React + Vite project with RTL support for a Hebrew website.

Setup:
1. Initialize React 18 with Vite
2. Install Tailwind CSS with RTL plugin
3. Install these dependencies:
   - lucide-react (icons)
   - @notionhq/client (Notion API)
   - clsx (conditional classes)

4. Configure Tailwind for RTL:
   - Add tailwindcss-rtl plugin
   - Set default direction to RTL
   - Configure Hebrew font support (Rubik)

5. Create folder structure:
   src/
     components/
       layout/
       tetris/
       cards/
     lib/
     hooks/
     utils/
     assets/
     styles/

6. Setup tailwind.config.js with:
   - Custom colors for neo-brutalist palette
   - Hebrew font stack
   - RTL utilities
   - Custom shadows for brutalist style

Generate all config files and initial structure.
```

**Cursor will create your entire project structure!**

### Step 5: Create Color System

**📝 PROMPT FOR CURSOR #2:**
```
Create a color system file at src/styles/colors.js:

Export CSS custom properties for a neo-brutalist design with soft pastel colors:

Primary colors:
- Tetris Purple: #7D53FA (purple)
- Tetris Green: #36EF79 (green)  
- Tetris Orange: #FD982E (orange)

Secondary:
- Pink: #F9A8D4
- Yellow: #FDE047
- Blue: #93C5FD
- Cyan: #67E8F9

Neutrals:
- Off-black: #1F1F1F (for text and borders)
- Dark gray: #404040
- Off-white: #FAFAF9 (for backgrounds)
- Light gray: #F5F5F4

Also create utility classes for:
- Thick borders (3px)
- Neo-brutalist shadows (6px 6px 0px)
- Tetris block shapes

Make it easy to use with Tailwind classes.
```

### Step 6: Create Tetris Components

**📝 PROMPT FOR CURSOR #3:**
```
Create tetris-themed React components in src/components/tetris/:

1. TetrisBlock.jsx
   - Props: type (I, O, T, S, Z, J, L), color, size
   - Render as SVG with pixelated/geometric style
   - Support hover and active states
   - RTL compatible

2. TetrisLoader.jsx
   - Animated falling tetris blocks
   - Loops infinitely
   - Uses our color palette
   - Shows while content loads

3. TetrisBackground.jsx
   - Subtle animated tetris blocks in background
   - Very light opacity
   - Doesn't interfere with content
   - Performance optimized

4. TetrisIcon.jsx
   - Wrapper for all icons in tetris style
   - Converts Lucide icons to pixelated style
   - Props: icon, size, color

All components should:
- Support RTL
- Use our color system
- Have thick borders (neo-brutalist)
- Include hover effects
```

### Step 7: Create Layout Components

**📝 PROMPT FOR CURSOR #4:**
```
Create layout components in src/components/layout/ with RTL support:

1. Header.jsx
   - Logo (tetris blocks forming logo)
   - Navigation menu (5 items in Hebrew)
   - Search bar with tetris icon
   - Mobile hamburger menu
   - Sticky on scroll
   - Neo-brutalist style with thick borders and shadows

2. Navigation.jsx
   - Desktop: horizontal links
   - Mobile: full-screen overlay
   - RTL direction
   - Active state highlighting
   - Tetris block indicators

3. MobileMenu.jsx
   - Full-screen overlay
   - Large links with tetris icons
   - Smooth animation
   - Close button
   - RTL support

4. Footer.jsx
   - 3 columns (Hebrew content)
   - Social links with tetris icons
   - "Built by students" badge
   - Copyright
   - Neo-brutalist styling

All components:
- Hebrew text
- RTL layout
- Thick borders
- Drop shadows
- Hover effects
- Mobile responsive
```

### Step 8: Create Card Components

**📝 PROMPT FOR CURSOR #5:**
```
Create card components in src/components/cards/:

1. ResourceCard.jsx
   Props: name, description, category, link, tip, featured, tags
   - Displays resource information
   - Category shown as colored tetris block
   - Tags as small tetris blocks
   - Featured badge (yellow tetris)
   - "Save" button
   - External link icon
   - Thick border + shadow (6px 6px 0)
   - Hover: shadow moves (3px 3px 0)
   - Hebrew text + RTL

2. LocationCard.jsx
   Props: name, category, address, hours, tip, phone, rating
   - Map pin tetris icon
   - Star rating (tetris star shapes)
   - Hours in Hebrew
   - Student tip section highlighted
   - Call button with phone icon

3. BookCard.jsx
   Props: title, author, why, coverUrl, featured
   - Cover image
   - Title and author (Hebrew)
   - "Why read" section
   - Featured badge if applicable
   - Thick border + colorful shadow

4. TipCard.jsx
   Props: text, category, votes
   - Tip text in large font
   - Category icon (tetris)
   - Vote counter
   - Upvote button (tetris arrow up)
   - Light background, thick border

All cards:
- Neo-brutalist style
- RTL support
- Color-coded by category
- Responsive (mobile stacks vertically)
- Smooth animations
```

### Step 9: Connect to Notion API

**📝 PROMPT FOR CURSOR #6:**
```
Create Notion integration in src/lib/notion.js:

1. Initialize Notion client with API key from environment variables
2. Create fetch functions for each database:
   - fetchResources()
   - fetchLocations()
   - fetchBooks()
   - fetchTips()
   - fetchDesigners()

3. Transform Notion data structure to match our card components:

For Resources:
{
  id: string,
  name: string (from title),
  description: string (from rich_text),
  category: string (from select),
  section: string (from select),
  link: string (from url),
  tip: string (from text),
  featured: boolean (from checkbox),
  tags: string[] (from multi_select)
}

Handle Notion's property types correctly:
- title → get plain_text
- rich_text → get plain_text
- select → get name
- checkbox → get boolean
- url → get string
- number → get number
- multi_select → map to array of names

Add error handling and loading states.
Support Hebrew text (ensure UTF-8).
```

**Create .env.local file:**
```
VITE_NOTION_API_KEY=secret_your_key_here
VITE_NOTION_RESOURCES_DB=database_id_here
VITE_NOTION_LOCATIONS_DB=database_id_here
VITE_NOTION_BOOKS_DB=database_id_here
VITE_NOTION_TIPS_DB=database_id_here
VITE_NOTION_DESIGNERS_DB=database_id_here
```

### Step 10: Create Main App

**📝 PROMPT FOR CURSOR #7:**
```
Update src/App.jsx to create the main application:

Structure:
1. Header component (always visible)
2. Hero section with:
   - Large Hebrew headline: "האב משאבים לסטודנטים לעיצוב"
   - Subtitle
   - Animated tetris background
   - CTA buttons
3. Navigation tabs for 5 sections:
   - ארגז הכלים (Toolbox)
   - המוזיאון (Museum)
   - הספרייה (Library)
   - המפה המקומית (Local Map)
   - סטודנט לסטודנט (Student-to-Student)
4. Content area that changes based on active section
5. Footer

Features:
- Fetch all data from Notion on mount
- Show TetrisLoader while loading
- Filter content by active section
- Search functionality (searches Hebrew text)
- Featured content highlighted
- Responsive layout
- RTL throughout
- Neo-brutalist styling

State management:
- activeSection
- searchQuery  
- allData (from Notion)
- loading
- error

Use hooks for data fetching and state.
```

### Step 11: Add Animations

**📝 PROMPT FOR CURSOR #8:**
```
Create animation utilities in src/utils/animations.js:

1. Tetris block falling animation:
   - Blocks fall from top
   - Random horizontal positions
   - Stack at bottom
   - Loop infinitely
   - CSS keyframes

2. Tetris block rotating:
   - 90-degree rotations
   - Smooth transitions
   - Trigger on hover

3. Shadow movement on hover:
   - Shadow moves from 6px to 3px
   - Element moves 3px down and right
   - Creates "press" effect
   - Works with RTL

4. Page transitions:
   - Fade in content
   - Slide animations
   - Respect RTL direction

5. Loader animation:
   - Spinning tetris blocks
   - Color changes
   - Smooth and performant

Export as CSS classes and React components.
Use Framer Motion if needed, or pure CSS for performance.
```

### Step 12: Create Backend API

**📝 PROMPT FOR CURSOR #9:**
```
The Notion API key shouldn't be in the frontend for security.

Create an Express.js backend in /api:

1. File: api/index.js
2. Setup Express server
3. Enable CORS for localhost:5173
4. Create endpoints:
   - GET /api/resources
   - GET /api/locations
   - GET /api/books
   - GET /api/tips
   - GET /api/designers
   - GET /api/search?q=query (searches all)

5. Each endpoint:
   - Uses NOTION_API_KEY from process.env (no VITE_ prefix)
   - Queries appropriate Notion database
   - Transforms data to match frontend structure
   - Returns JSON
   - Handles errors with 500 status

6. Add health check: GET /api/health

7. Export for Vercel serverless functions

Update frontend src/lib/notion.js to:
- Remove direct Notion calls
- Fetch from /api/* endpoints instead
- Handle fetch errors gracefully
```

**Create vercel.json:**
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ],
  "build": {
    "env": {
      "NOTION_API_KEY": "@notion-api-key",
      "NOTION_RESOURCES_DB": "@notion-resources-db",
      "NOTION_LOCATIONS_DB": "@notion-locations-db",
      "NOTION_BOOKS_DB": "@notion-books-db",
      "NOTION_TIPS_DB": "@notion-tips-db",
      "NOTION_DESIGNERS_DB": "@notion-designers-db"
    }
  }
}
```

### Step 13: Test Locally

```bash
# Run frontend
npm run dev

# Run backend (in another terminal)
node api/index.js

# Or run both together:
npm run dev:all
```

Test checklist:
- [ ] עברית מוצגת נכון
- [ ] RTL עובד
- [ ] צבעים נכונים
- [ ] אנימציות חלקות
- [ ] נתונים מ-Notion מוצגים
- [ ] חיפוש עובד
- [ ] נייד responsive
- [ ] כפתורים מגיבים
- [ ] צללים זזים בהובר

---

## 🚀 PART 6: DEPLOYMENT - העלאה לאינטרנט

### Step 1: Prepare for Production

**📝 PROMPT FOR CURSOR #10:**
```
Prepare the project for production deployment:

1. Create .gitignore if not exists:
node_modules
.env
.env.local
dist
.vercel

2. Update package.json scripts:
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext js,jsx"
}

3. Optimize images and assets
4. Ensure all API calls use relative URLs for production
5. Add meta tags for Hebrew/RTL in index.html
6. Configure Vite for RTL optimization
```

### Step 2: Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Tetris Design Hub"

# Create repo on GitHub
# Then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tetris-design-hub.git
git push -u origin main
```

Checklist:
- [ ] Repository created on GitHub
- [ ] Code pushed
- [ ] .env.local NOT in repository (check .gitignore)

### Step 3: Deploy to Vercel

1. **Go to https://vercel.com**
   - [ ] Sign in with GitHub

2. **Import Project**
   - [ ] Click "New Project"
   - [ ] Select your GitHub repository
   - [ ] Vercel auto-detects Vite ✅

3. **Configure**
   - [ ] Framework: Vite
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`
   - [ ] Install Command: `npm install`

4. **Add Environment Variables**
   
   Click "Environment Variables" and add:
   ```
   NOTION_API_KEY = secret_your_actual_key
   NOTION_RESOURCES_DB = database_id
   NOTION_LOCATIONS_DB = database_id
   NOTION_BOOKS_DB = database_id
   NOTION_TIPS_DB = database_id
   NOTION_DESIGNERS_DB = database_id
   ```
   
   **Important:** No `VITE_` prefix for backend variables!

5. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait 2-3 minutes
   - [ ] ✅ Your site is live!

Your URL: `https://tetris-design-hub-[random].vercel.app`

### Step 4: Test Production

Test checklist:
- [ ] פתח את האתר
- [ ] בדוק RTL עובד
- [ ] בדוק עברית מוצגת
- [ ] טעינת נתונים מ-Notion
- [ ] חיפוש עובד
- [ ] כל הקישורים פועלים
- [ ] נייד responsive
- [ ] אנימציות חלקות
- [ ] מהירות טעינה טובה

### Step 5: Custom Domain (Optional)

If you want your own domain:
1. [ ] Buy domain from Namecheap (~$12/year)
2. [ ] In Vercel: Settings → Domains
3. [ ] Add your domain
4. [ ] Update DNS records
5. [ ] Wait for SSL certificate (auto)

---

## 🎯 PART 7: UPDATING CONTENT - עדכון תוכן

### After Launch - Zero Code Needed!

**To add/update content:**

1. [ ] פתח Notion
2. [ ] עבור למסד הנתונים הרלוונטי
3. [ ] הוסף/ערוך/מחק שורות
4. [ ] שמור
5. [ ] ✅ שינויים מופיעים באתר תוך ~60 שניות

**דוגמה: להוסיף משאב חדש**
1. פתח את database "משאבים"
2. לחץ "+ New"
3. מלא:
   - שם: "Canva לסטודנטים"
   - תיאור: "כלי עיצוב חינמי לסטודנטים"
   - קטגוריה: תוכנות
   - קישור: https://canva.com/education
   - טיפ: "גרסת Pro חינמית לסטודנטים"
   - מומלץ: ✓
4. שמור
5. רענן את האתר - המשאב מופיע!

**אין צורך לגעת בקוד אף פעם!**

---

## 📊 PERFORMANCE CHECKLIST - רשימת ביקורת ביצועים

### Before Launch:
- [ ] Images optimized (WebP format)
- [ ] Fonts subset for Hebrew only
- [ ] Lazy loading for images
- [ ] Code splitting
- [ ] Minified CSS/JS
- [ ] Gzip compression enabled
- [ ] CDN for static assets (Vercel auto)

### Lighthouse Score Goals:
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 95+

### Hebrew/RTL Specific:
- [ ] `dir="rtl"` on html element
- [ ] `lang="he"` on html element
- [ ] Meta tags in Hebrew
- [ ] Proper font loading for Hebrew
- [ ] Text aligns right
- [ ] Icons flip correctly in RTL

---

## 🐛 TROUBLESHOOTING - פתרון בעיות

### Issue: Notion data not loading
**Fix:**
1. Check environment variables in Vercel
2. Verify database IDs are correct
3. Ensure integration has access to databases
4. Check API key starts with `secret_`

### Issue: RTL not working
**Fix:**
1. Verify `dir="rtl"` in index.html
2. Check Tailwind RTL plugin installed
3. Ensure Hebrew font loaded
4. Test with browser RTL override

### Issue: Colors look wrong
**Fix:**
1. Check Tailwind config has custom colors
2. Verify color values match palette
3. Clear browser cache
4. Rebuild project

### Issue: Animations laggy
**Fix:**
1. Use CSS transforms instead of position
2. Add `will-change` to animated elements
3. Reduce number of animated blocks
4. Use `translate3d` for GPU acceleration

### Issue: Mobile menu not working
**Fix:**
1. Check z-index conflicts
2. Verify touch events registered
3. Test on actual mobile device
4. Check overflow settings

---

## 📚 RESOURCES - משאבים

### Design Inspiration:
- Brutalist Websites: https://brutalistwebsites.com
- Neo-Brutalism Figma: Search "neo-brutalism UI kit"
- Tetris Game: For animation inspiration

### Fonts:
- Rubik (Google Fonts) - תומך עברית
- Heebo - עברית
- Assistant - עברית

### Tools:
- Figma: https://figma.com
- Notion: https://notion.so
- Cursor AI: (you have it!)
- Vercel: https://vercel.com

### Learning:
- React RTL: https://rtlstyling.com
- Tailwind RTL: https://github.com/20lives/tailwindcss-rtl
- Notion API Docs: https://developers.notion.com

---

## ✅ FINAL CHECKLIST - בדיקה אחרונה

### Before Going Live:
- [ ] All content in Hebrew
- [ ] RTL working perfectly
- [ ] 5 Notion databases populated
- [ ] At least 10 items in each database
- [ ] All links tested
- [ ] Mobile responsive verified
- [ ] Animations smooth
- [ ] Colors match palette
- [ ] Tetris theme consistent
- [ ] Neo-brutalist style everywhere
- [ ] Search working
- [ ] Featured items highlighted
- [ ] Performance optimized
- [ ] Accessibility checked
- [ ] SEO meta tags added
- [ ] Vercel deployed successfully
- [ ] Custom domain connected (if applicable)

### Post-Launch:
- [ ] Share with classmates
- [ ] Collect feedback
- [ ] Add more content
- [ ] Monitor Notion for submissions
- [ ] Update based on user needs

---

## 🎉 CONGRATULATIONS!

You've built a professional, $0/month, Hebrew RTL, Neo-Brutalist, Tetris-themed Design Hub!

**What you achieved:**
✅ Fully functional website
✅ Connected to Notion CMS
✅ No monthly costs
✅ Full control over design
✅ Hebrew/RTL support
✅ Unique tetris theme
✅ Portfolio-worthy project

**Share it with:**
- Your design faculty
- Fellow students
- On social media
- As portfolio piece

---

**זמן להתחיל! 🚀**

**Start with:**
1. Read this guide fully
2. Design in Figma (Part 2)
3. Setup Notion (Part 4)
4. Build with Cursor (Part 5)
5. Deploy (Part 6)
6. Celebrate! 🎊