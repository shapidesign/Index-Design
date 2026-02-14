---
name: tetris-hub-design-system
description: Design system for Tetris Design Hub - color palette, typography, spacing, RTL implementation rules, animation guidelines, responsive design, accessibility, performance optimization, and common patterns to follow and avoid
---
## COLOR SYSTEM

### Primary Colors
```css
--tetris-purple: #7D53FA;  /* Purple - Typography category, I-Block */
--tetris-green: #36EF79;   /* Green - Mockups category, O-Block */
--tetris-orange: #FD982E;  /* Orange - AI Tools category, L-Block */
```

### Secondary Colors
```css
--tetris-pink: #F9A8D4;    /* Pink - Student tips */
--tetris-yellow: #FDE047;  /* Yellow - Featured items */
--tetris-blue: #93C5FD;    /* Blue - Software category */
--tetris-cyan: #67E8F9;    /* Cyan - I-blocks */
```

### Neutrals (NOT Pure Black/White)
```css
--off-black: #1F1F1F;      /* NOT #000000 - for text, borders, shadows */
--dark-gray: #404040;      /* Secondary text */
--off-white: #FAFAF9;      /* NOT #FFFFFF - main background */
--light-gray: #F5F5F4;     /* Secondary background */
```

### Tailwind Usage
Always use these custom classes:
- Text: `text-off-black` or `text-dark-gray`
- Background: `bg-off-white` or `bg-light-gray`
- Borders: `border-off-black border-3`
- Shadows: `shadow-brutalist` or `shadow-brutalist-sm`

## TYPOGRAPHY

### Font Family
```css
Primary: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
/* Rubik supports Hebrew beautifully */
```

### Type Scale
```css
H1 (Hero): text-7xl font-bold (90px)
H2 (Section): text-5xl font-bold (48px)
H3 (Category): text-3xl font-semibold (32px)
Body Large: text-lg font-normal (18px)
Body: text-base font-normal (16px)
Small: text-sm font-medium (14px)
Caption: text-xs font-medium (12px)
```

### Hebrew Typography Rules
- Line height: 1.5-1.6 (Hebrew needs more breathing room)
- Letter spacing: normal (don't tighten)
- Font weight: Bold (700) for headers, Regular (400) for body
- Never use font-thin or font-light with Hebrew

## SPACING SYSTEM

Follow 4px base unit:
```css
Micro: 4px (space-1)
Tiny: 8px (space-2)
Small: 12px (space-3)
Medium: 16px (space-4)
Large: 24px (space-6)
XLarge: 32px (space-8)
XXLarge: 48px (space-12)
Huge: 64px (space-16)
```

## RTL IMPLEMENTATION RULES

### HTML Setup
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
```

### CSS Rules
```css
/* ALWAYS use logical properties when possible */
margin-inline-start: 16px;  /* NOT margin-left */
padding-inline-end: 16px;   /* NOT padding-right */

/* Tailwind RTL utilities */
ms-4   /* margin-inline-start (replaces ml-4) */
me-4   /* margin-inline-end (replaces mr-4) */
ps-4   /* padding-inline-start (replaces pl-4) */
pe-4   /* padding-inline-end (replaces pr-4) */
```

### Animation Reversal
```css
/* LTR animation */
@keyframes slide-in-ltr {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* RTL version (REQUIRED) */
[dir="rtl"] @keyframes slide-in-rtl {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

### Flexbox RTL
```jsx
// ALWAYS use flex-row-reverse for RTL horizontal layouts
<div className="flex flex-row-reverse items-center gap-4">
  {/* Items appear right-to-left */}
</div>
```

## ANIMATION GUIDELINES

### Performance Rules
```css
/* ALWAYS animate with transform, NOT position */
/* ❌ BAD */
.element { left: 100px; transition: left 0.3s; }

/* ✅ GOOD */
.element { transform: translateX(100px); transition: transform 0.3s; }

/* ALWAYS use will-change for frequently animated elements */
.tetris-block-falling {
  will-change: transform, opacity;
}
```

### Tetris Animation Timings
```css
/* Standard timings for consistency */
--timing-micro: 0.1s;      /* Button active state */
--timing-fast: 0.2s;       /* Hover effects */
--timing-normal: 0.3s;     /* State changes */
--timing-slow: 0.5s;       /* Page transitions */
--timing-loading: 2s;      /* Loader animations */

/* Standard easing */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-sharp: cubic-bezier(0.4, 0.0, 1, 1);
```

### Required Animations
1. **TetrisLoader** - Falling blocks during data fetch
2. **BlockStack** - Content appears by stacking
3. **ButtonPress** - Shadow shrinks, element moves
4. **CardHover** - 90° rotation on hover
5. **LineClear** - Featured items flash yellow
6. **SlideTransition** - Section changes with rotation

## RESPONSIVE DESIGN

### Breakpoints
```javascript
const breakpoints = {
  mobile: '375px',   // Mobile first
  tablet: '768px',   // Tablets
  laptop: '1024px',  // Laptops
  desktop: '1440px'  // Desktop
};
```

### Mobile-First Approach
```jsx
<div className={cn(
  // Mobile (default)
  "flex flex-col gap-4 p-4",
  // Tablet
  "md:flex-row md:gap-6 md:p-6",
  // Laptop
  "lg:gap-8 lg:p-8",
  // Desktop
  "xl:max-w-7xl xl:mx-auto"
)}>
  {/* Content */}
</div>
```

### Mobile Menu Pattern
```jsx
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// ALWAYS prevent body scroll when menu open
useEffect(() => {
  if (mobileMenuOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
  
  return () => {
    document.body.style.overflow = 'unset';
  };
}, [mobileMenuOpen]);

// Full-screen overlay with tetris close button
<div className={cn(
  "fixed inset-0 bg-off-white z-50",
  "flex flex-col items-center justify-center",
  "transition-transform duration-300",
  mobileMenuOpen ? "translate-x-0" : "translate-x-full"
)}>
  {/* Menu content */}
</div>
```

## ACCESSIBILITY

### Required Attributes
```jsx
// ALWAYS add ARIA labels in Hebrew
<button aria-label="סגור תפריט">
  <TetrisIcon icon="close" />
</button>

// ALWAYS add proper heading hierarchy
<h1>כותרת ראשית</h1>
<h2>כותרת משנית</h2>
<h3>כותרת קטגוריה</h3>

// ALWAYS add alt text to images in Hebrew
<img src="..." alt="תיאור התמונה בעברית" />

// ALWAYS support keyboard navigation
<button 
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
```

### Focus States
```css
/* ALWAYS add visible focus states */
.interactive:focus-visible {
  outline: 3px solid var(--tetris-yellow);
  outline-offset: 3px;
}
```

### Reduced Motion
```css
/* ALWAYS respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## PERFORMANCE OPTIMIZATION

### Image Optimization
```jsx
// ALWAYS lazy load images
<img 
  src={imageUrl} 
  alt={altText}
  loading="lazy"
  decoding="async"
/>
```

### Code Splitting
```javascript
// ALWAYS lazy load routes/heavy components
const LocationMap = lazy(() => import('./components/LocationMap'));

<Suspense fallback={<TetrisLoader />}>
  <LocationMap />
</Suspense>
```

### Memoization
```javascript
// ALWAYS memoize expensive computations
const filteredResources = useMemo(() => {
  return resources.filter(r => r.category === activeCategory);
}, [resources, activeCategory]);

// ALWAYS memoize callbacks passed to children
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

## COMMON PATTERNS TO AVOID

### ❌ NEVER DO THIS:
```jsx
// ❌ Using pure black/white
<div className="bg-white text-black">

// ❌ Using left/right directly
<div className="ml-4 mr-8">

// ❌ Exposing API keys in frontend
const NOTION_KEY = "secret_xxx";

// ❌ Animating width/height/left/right
.element { transition: left 0.3s; }

// ❌ Rounded corners everywhere
<div className="rounded-lg">

// ❌ Subtle shadows
<div className="shadow-sm">

// ❌ Missing RTL direction
<div className="flex flex-row">

// ❌ English placeholder in Hebrew input
<input placeholder="Search..." />

// ❌ Hard-coded strings instead of Hebrew
<h1>Welcome to Design Hub</h1>
```

### ✅ ALWAYS DO THIS:
```jsx
// ✅ Using off-black/off-white
<div className="bg-off-white text-off-black">

// ✅ Using logical properties
<div className="ms-4 me-8">

// ✅ API keys in backend only
// In .env: NOTION_API_KEY=secret_xxx

// ✅ Animating transforms
.element { transition: transform 0.3s; }

// ✅ No rounded corners (or blocky only)
<div className=""> or <div className="rounded-none">

// ✅ Thick brutalist shadows
<div className="shadow-brutalist">

// ✅ RTL flex with reverse
<div className="flex flex-row-reverse">

// ✅ Hebrew placeholder
<input placeholder="חיפוש..." />

// ✅ Hebrew strings
<h1>ברוכים הבאים לאב העיצוב</h1>
```
