# 🎨 TETRIS HUB COLOR PALETTE
## Neo-Brutalist Soft Pastels

---

## PRIMARY COLORS - צבעים ראשיים

### Tetris Purple - סגול טטריס
```
Hex: #7D53FA
RGB: 167, 139, 250
HSL: 255, 91%, 76%
Tailwind: purple-400

Use for:
- Primary buttons
- Featured badges
- Typography category
- I-Block tetris pieces
```

### Tetris Green - ירוק טטריס
```
Hex: #36EF79
RGB: 134, 239, 172
HSL: 142, 76%, 73%
Tailwind: green-300

Use for:
- Success states
- Mockups category
- O-Block tetris pieces
- Call-to-action accents
```

### Tetris Orange - כתום טטריס
```
Hex: #FD982E  
RGB: 253, 186, 116
HSL: 31, 97%, 72%
Tailwind: orange-300

Use for:
- Warning states
- AI Tools category
- L-Block tetris pieces
- Important highlights
```

---

## SECONDARY COLORS - צבעים משניים

### Soft Pink - ורוד רך
```
Hex: #F9A8D4
RGB: 249, 168, 212
HSL: 327, 85%, 82%

Use for:
- Student tips
- T-Block pieces
- Feminine touches
- Complementary accents
```

### Soft Yellow - צהוב רך
```
Hex: #FDE047
RGB: 253, 224, 71
HSL: 51, 98%, 64%

Use for:
- Featured badges
- Highlights
- S-Block pieces
- Attention grabbers
```

### Soft Blue - כחול רך
```
Hex: #93C5FD
RGB: 147, 197, 253
HSL: 213, 96%, 78%

Use for:
- Links
- Information
- J-Block pieces
- Cool accents
```

### Soft Cyan - ציאן רך
```
Hex: #67E8F9
RGB: 103, 232, 249
HSL: 187, 92%, 69%

Use for:
- Z-Block pieces
- Fresh accents
- Hover states
```

---

## NEUTRAL COLORS - צבעים ניטרליים

### Off-Black - שחור לא ממש
```
Hex: #1F1F1F
RGB: 31, 31, 31
HSL: 0, 0%, 12%

Use for:
- All text
- Borders (3px thick)
- Shadows (6px offset)
- Icons
```

### Dark Gray - אפור כהה
```
Hex: #404040
RGB: 64, 64, 64
HSL: 0, 0%, 25%

Use for:
- Secondary text
- Disabled states
- Subtle borders
```

### Off-White - לבן לא ממש
```
Hex: #FAFAF9
RGB: 250, 250, 249
HSL: 60, 9%, 98%

Use for:
- Main background
- Card backgrounds
- Light sections
```

### Light Gray - אפור בהיר
```
Hex: #F5F5F4
RGB: 245, 245, 244
HSL: 60, 9%, 96%

Use for:
- Secondary backgrounds
- Hover backgrounds
- Disabled states
```

---

## COLOR COMBINATIONS - שילובי צבעים

### High Energy (Purple + Yellow + Pink)
```css
.high-energy {
  background: linear-gradient(135deg, #7D53FA 0%, #FDE047 50%, #F9A8D4 100%);
}
```
**Use:** Hero sections, CTAs, Feature highlights

### Fresh & Clean (Green + Cyan + Blue)
```css
.fresh {
  background: linear-gradient(135deg, #36EF79 0%, #67E8F9 50%, #93C5FD 100%);
}
```
**Use:** Information sections, Success messages

### Warm & Inviting (Orange + Yellow + Pink)
```css
.warm {
  background: linear-gradient(135deg, #FD982E 0%, #FDE047 50%, #F9A8D4 100%);
}
```
**Use:** Welcome sections, Community areas

---

## NEO-BRUTALIST EFFECTS - אפקטים ניאו-ברוטליסטיים

### Standard Shadow
```css
box-shadow: 6px 6px 0px #1F1F1F;
border: 3px solid #1F1F1F;
```

### Hover Shadow (Pressed Effect)
```css
box-shadow: 3px 3px 0px #1F1F1F;
border: 3px solid #1F1F1F;
transform: translate(3px, 3px);
```

### Double Shadow (Extra Depth)
```css
box-shadow: 
  6px 6px 0px #1F1F1F,
  12px 12px 0px rgba(31, 31, 31, 0.2);
border: 3px solid #1F1F1F;
```

### Inner Border Effect
```css
border: 3px solid #1F1F1F;
outline: 3px solid #FAFAF9;
outline-offset: -9px;
```

---

## CATEGORY COLOR CODING - קידוד צבעים לפי קטגוריה

### Toolbox Section - ארגז הכלים
```
Typography: Purple (#7D53FA)
Mockups: Green (#36EF79)
AI Tools: Orange (#FD982E)
Software: Blue (#93C5FD)
```

### Location Categories - קטגוריות מיקומים
```
Print Shops: Orange (#FD982E)
Art Supply: Green (#36EF79)
Hidden Gems: Yellow (#FDE047)
```

### Student Tips - טיפים
```
Critiques: Pink (#F9A8D4)
Projects: Purple (#7D53FA)
Faculty: Cyan (#67E8F9)
```

---

## TETRIS BLOCK COLORS - צבעי בלוקי טטריס

### Official Tetris Colors (Reference)
```
I-Block (Cyan): #67E8F9 ✅ Using our cyan
O-Block (Yellow): #FDE047 ✅ Using our yellow
T-Block (Purple): #7D53FA ✅ Using our purple
S-Block (Green): #36EF79 ✅ Using our green
Z-Block (Red): #F9A8D4 ❌ Using pink instead
J-Block (Blue): #93C5FD ✅ Using our blue
L-Block (Orange): #FD982E ✅ Using our orange
```

---

## ACCESSIBILITY - נגישות

### Contrast Ratios (WCAG AA Standard)

**Text on Off-White Background:**
- Off-Black (#1F1F1F): 17.2:1 ✅ AAA
- Dark Gray (#404040): 9.6:1 ✅ AAA
- Purple (#7D53FA): 3.4:1 ✅ AA Large
- Green (#36EF79): 1.5:1 ❌ Use for decorative only
- Orange (#FD982E): 1.7:1 ❌ Use for decorative only

**Use This Rule:**
- Body text: Off-Black or Dark Gray only
- Headings: Off-Black, Dark Gray, or Purple
- Decorative: Any color with thick black borders
- Interactive: Ensure 3:1 contrast minimum

---

## TAILWIND CONFIG - הגדרת Tailwind

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'tetris': {
          purple: '#7D53FA',
          green: '#36EF79',
          orange: '#FD982E',
          pink: '#F9A8D4',
          yellow: '#FDE047',
          blue: '#93C5FD',
          cyan: '#67E8F9',
        },
        'neutral': {
          'off-black': '#1F1F1F',
          'dark': '#404040',
          'off-white': '#FAFAF9',
          'light': '#F5F5F4',
        }
      },
      boxShadow: {
        'brutalist': '6px 6px 0px #1F1F1F',
        'brutalist-sm': '3px 3px 0px #1F1F1F',
        'brutalist-lg': '12px 12px 0px #1F1F1F',
      },
      borderWidth: {
        'brutalist': '3px',
      }
    }
  }
}
```

---

## CSS CUSTOM PROPERTIES - משתנים CSS

```css
:root {
  /* Primary */
  --tetris-purple: #7D53FA;
  --tetris-green: #36EF79;
  --tetris-orange: #FD982E;
  
  /* Secondary */
  --tetris-pink: #F9A8D4;
  --tetris-yellow: #FDE047;
  --tetris-blue: #93C5FD;
  --tetris-cyan: #67E8F9;
  
  /* Neutrals */
  --off-black: #1F1F1F;
  --dark-gray: #404040;
  --off-white: #FAFAF9;
  --light-gray: #F5F5F4;
  
  /* Effects */
  --border-width: 3px;
  --shadow-offset: 6px;
  --shadow-color: var(--off-black);
}

/* RTL Support */
[dir="rtl"] {
  --shadow-offset-x: -6px;
}

[dir="ltr"] {
  --shadow-offset-x: 6px;
}
```

---

## USAGE EXAMPLES - דוגמאות שימוש

### Button Primary
```css
.btn-primary {
  background: var(--tetris-purple);
  color: var(--off-black);
  border: var(--border-width) solid var(--off-black);
  box-shadow: 6px 6px 0 var(--shadow-color);
  font-weight: 700;
  padding: 12px 24px;
  transition: all 0.2s;
}

.btn-primary:hover {
  box-shadow: 3px 3px 0 var(--shadow-color);
  transform: translate(3px, 3px);
}
```

### Card Featured
```css
.card-featured {
  background: var(--off-white);
  border: var(--border-width) solid var(--off-black);
  box-shadow: 
    6px 6px 0 var(--tetris-yellow),
    9px 9px 0 var(--off-black);
  padding: 24px;
}
```

### Tag Category
```css
.tag-typography {
  background: var(--tetris-purple);
  color: var(--off-black);
  border: 2px solid var(--off-black);
  box-shadow: 3px 3px 0 var(--off-black);
  padding: 6px 12px;
  font-weight: 600;
  font-size: 14px;
}
```

---

## GRADIENTS - גרדיאנטים

### Hero Background
```css
background: linear-gradient(
  135deg,
  var(--off-white) 0%,
  var(--light-gray) 100%
);
```

### Card Hover Gradient
```css
background: linear-gradient(
  180deg,
  var(--tetris-purple) 0%,
  #9F7FEB 100%
);
```

### Loading Screen
```css
background: linear-gradient(
  90deg,
  var(--tetris-purple) 0%,
  var(--tetris-cyan) 25%,
  var(--tetris-green) 50%,
  var(--tetris-yellow) 75%,
  var(--tetris-orange) 100%
);
animation: rainbow 3s ease infinite;
```

---

## COLOR PSYCHOLOGY - פסיכולוגיה של צבעים

### Purple (סגול)
- Creativity, Wisdom, Imagination
- Perfect for: Typography, Design tools
- Mood: Inspiring, Artistic

### Green (ירוק)
- Growth, Freshness, Success
- Perfect for: Mockups, Resources
- Mood: Calming, Positive

### Orange (כתום)
- Energy, Enthusiasm, Innovation
- Perfect for: AI tools, New features
- Mood: Exciting, Warm

### Pink (ורוד)
- Community, Support, Friendliness
- Perfect for: Student tips, Social
- Mood: Approachable, Caring

### Yellow (צהוב)
- Attention, Optimism, Featured
- Perfect for: Highlights, Important info
- Mood: Happy, Energetic

### Blue (כחול)
- Trust, Stability, Knowledge
- Perfect for: Information, Links
- Mood: Professional, Calm

---

## PRINT COLORS - צבעי הדפסה

If you need to print materials:

### CMYK Values

```
Tetris Purple: C47 M52 Y0 K0
Tetris Green: C45 M0 Y49 K0
Tetris Orange: C0 M29 Y56 K0
Soft Pink: C2 M39 Y0 K0
Soft Yellow: C1 M8 Y73 K0
Soft Blue: C37 M16 Y0 K0
Soft Cyan: C49 M0 Y7 K0

Off-Black: C75 M68 Y67 K90
Off-White: C2 M2 Y4 K0
```

---

## EXPORT FOR DESIGN TOOLS

### Figma Styles
1. Create Local Styles for each color
2. Name: "Tetris/Purple", "Tetris/Green", etc.
3. Organize in folders: Primary, Secondary, Neutral

### Adobe XD
1. Add to Assets panel
2. Create Character Styles using colors
3. Save as Library

### Sketch
1. Add to Document Colors
2. Create Library
3. Share with team

---

## QUICK REFERENCE - מדריך מהיר

```
Cards/Backgrounds: Off-White (#FAFAF9)
All Text: Off-Black (#1F1F1F)
All Borders: 3px, Off-Black
All Shadows: 6px 6px 0px Off-Black
Hover: Shadow 3px, Translate 3px

Categories:
Typography → Purple
Mockups → Green
AI Tools → Orange
Software → Blue
Tips → Pink
Featured → Yellow
```

---

**Save this file and reference it while designing! 🎨**