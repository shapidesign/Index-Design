---
name: tetris-hub-project
description: Project overview, core principles, file structure, and coding standards for the Tetris Design Hub - a Hebrew RTL Neo-Brutalist Tetris-themed resource hub for graphic design students built with React, Vite, Tailwind, and Notion API
---
# Tetris Design Hub - Cursor AI Rules
# האב משאבים לסטודנטים לעיצוב גרפי

## PROJECT OVERVIEW
You are building a Hebrew RTL, Neo-Brutalist, Tetris-themed resource hub for graphic design students.
- Primary Language: Hebrew (עברית)
- Direction: RTL (right-to-left)
- Design Style: Neo-Brutalism with Tetris theme
- Framework: React 18 + Vite
- Styling: Tailwind CSS with RTL plugin
- Backend: Notion API via Express serverless functions
- Deployment: Vercel
- Cost: $0/month (free tier everything)

## CORE PRINCIPLES

### 1. RTL-FIRST DESIGN
- ALWAYS set `dir="rtl"` on containers
- ALWAYS use RTL-aware Tailwind utilities (e.g., `ms-4` not `ml-4`)
- ALWAYS reverse animations for RTL (transform directions)
- ALWAYS test with `lang="he"` attribute
- Text alignment: `text-right` is default
- Flexbox: Use `flex-row-reverse` for RTL horizontal layouts
- Grid: Mirror for RTL contexts

### 2. NEO-BRUTALIST STYLE
- ALL interactive elements MUST have:
  - 3px solid black border: `border-3 border-off-black`
  - 6px drop shadow: `shadow-brutalist` (6px 6px 0px #1F1F1F)
  - Hover state: shadow reduces to 3px, element translates 3px down/right
  - Active state: shadow 0px, element translates 6px down/right
- NO rounded corners (except tetris blocks which are blocky)
- NO gradients on main UI (only in backgrounds/special effects)
- NO subtle shadows (always hard, offset shadows)
- Bold, chunky typography
- High contrast colors
- Thick borders everywhere

### 3. TETRIS THEME
- Use tetris block shapes for icons, decorations, layouts
- 7 block types: I, O, T, S, Z, J, L
- Animations should feel "blocky" and snap to grid
- Rotations: ONLY 90° increments (no smooth continuous rotation)
- Movement: Prefer translate over smooth transitions
- Use tetris colors for categories:
  - Typography: Purple
  - Mockups: Green
  - AI Tools: Orange
  - Software: Blue
  - Tips: Pink
  - Featured: Yellow
  - Navigation: Cyan

## COMPONENT STRUCTURE

### File Organization
```
src/
  components/
    layout/
      Header.jsx
      Navigation.jsx
      MobileMenu.jsx
      Footer.jsx
    tetris/
      TetrisBlock.jsx
      TetrisLoader.jsx
      TetrisBackground.jsx
      TetrisIcon.jsx
    cards/
      ResourceCard.jsx
      LocationCard.jsx
      BookCard.jsx
      TipCard.jsx
      DesignerCard.jsx
    ui/
      Button.jsx
      Input.jsx
      Badge.jsx
      Tag.jsx
  lib/
    notion.js        # Notion API client (frontend calls)
    utils.js         # Utility functions
  hooks/
    useSearch.js
    useData.js
  styles/
    globals.css
  App.jsx
  main.jsx
```

## FILE NAMING CONVENTIONS

```
Components: PascalCase (ResourceCard.jsx)
Utils/Hooks: camelCase (useSearch.js, formatDate.js)
Styles: kebab-case (globals.css, tetris-animations.css)
API routes: kebab-case (index.js, get-resources.js)
```

## GIT COMMIT MESSAGES

Follow this pattern:
```
feat: Add tetris loader component
fix: RTL animation direction in card hover
style: Update color palette to soft pastels
refactor: Extract notion transform logic
docs: Add Hebrew README
test: Add RTL layout tests
```

## TESTING REQUIREMENTS

### Before Committing Code
```bash
# ALWAYS test these before committing:
1. RTL display is correct
2. Hebrew text renders properly
3. All animations work smoothly
4. Mobile responsive works
5. Keyboard navigation works
6. Focus states visible
7. No console errors
8. Data loads from Notion correctly
```

## DEPLOYMENT CHECKLIST

Before deploying to Vercel:
```
✅ Environment variables set in Vercel dashboard
✅ Build succeeds locally (npm run build)
✅ No console errors in production build
✅ RTL working in production
✅ Hebrew text displays correctly
✅ Notion API connected and working
✅ All animations smooth on mobile
✅ Performance score >90 on Lighthouse
✅ Accessibility score >95
```

## WHEN IN DOUBT

1. **Check the guides**: TETRIS_HUB_GUIDE.md, COLOR_PALETTE.md, TETRIS_ANIMATIONS.md
2. **Follow RTL-first**: Always design for Hebrew RTL, not English LTR
3. **Be brutalist**: Thick borders, hard shadows, no subtlety
4. **Think tetris**: Blocky, grid-based, 90° rotations only
5. **Ask**: If unsure, ask me to clarify the requirement

## SUMMARY

This Tetris Design Hub must be:
- ✅ Hebrew-first with perfect RTL support
- ✅ Neo-brutalist (thick borders, hard shadows, high contrast)
- ✅ Tetris-themed (blocky, grid-based, colorful)
- ✅ Performant (transforms, lazy loading, memoization)
- ✅ Accessible (ARIA, keyboard nav, focus states)
- ✅ Secure (API keys in backend only)
- ✅ Mobile-responsive
- ✅ $0 cost (using free tiers)

Every line of code should follow these rules. When generating code, ALWAYS:
1. Check if RTL is properly implemented
2. Verify colors match the palette
3. Ensure brutalist styling (borders + shadows)
4. Add tetris theme elements
5. Include proper Hebrew text
6. Optimize for performance
7. Add accessibility attributes
8. Handle errors gracefully

Good luck building the most unique design student hub! 🎮🎨
