# 🎮 TETRIS ANIMATIONS & INTERACTIONS
## מדריך אנימציות ואינטראקציות טטריס

---

## 🎯 ANIMATION PHILOSOPHY - פילוסופיית האנימציה

### Core Principles:
1. **Playful but Professional** - כיפי אבל מקצועי
2. **Blocky Movement** - תנועה בלוקית (לא חלקה מדי)
3. **Snap to Grid** - נעילה לרשת
4. **90° Rotations Only** - רק סיבובים של 90 מעלות
5. **Drop & Stack** - נפילה והצטברות

---

## 📦 TETRIS BLOCK COMPONENTS

### 1. I-Block (Straight) - בלוק ישר
```
████
Shape: 4x1
Color: Cyan (#67E8F9)
Use: Horizontal dividers, loading bars
```

### 2. O-Block (Square) - ריבוע
```
██
██
Shape: 2x2
Color: Yellow (#FDE047)
Use: Icons, badges, bullets
```

### 3. T-Block (T-Shape) - טי
```
 █
███
Shape: 3x2
Color: Purple (#7D53FA)
Use: Arrows, pointers, navigation
```

### 4. S-Block (S-Shape) - אס
```
 ██
██
Shape: 3x2
Color: Green (#36EF79)
Use: Decorative, connections
```

### 5. Z-Block (Z-Shape) - זד
```
██
 ██
Shape: 3x2
Color: Pink (#F9A8D4) (instead of red)
Use: Decorative, backgrounds
```

### 6. J-Block (J-Shape) - ג׳יי
```
  █
███
Shape: 3x2
Color: Blue (#93C5FD)
Use: Corners, brackets
```

### 7. L-Block (L-Shape) - אל
```
█
███
Shape: 3x2
Color: Orange (#FD982E)
Use: Corners, brackets (mirrored)
```

---

## 🎬 KEY ANIMATIONS

### Animation 1: Falling Blocks (Loading)

**When:** During page load or data fetch

**How it works:**
```css
@keyframes tetris-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.tetris-block-falling {
  animation: tetris-fall 3s linear infinite;
  animation-delay: calc(var(--block-index) * 0.3s);
}
```

**Visual:**
- 7 blocks (one of each type) fall from top
- Each block enters at random X position
- Rotate during fall
- Loop infinitely
- Stagger timing (0.3s between each)

**Usage:**
```jsx
<TetrisLoader>
  {/* Shows 7 falling blocks */}
</TetrisLoader>
```

---

### Animation 2: Block Stacking (On Content Load)

**When:** When new content appears

**How it works:**
```css
@keyframes tetris-stack {
  0% {
    transform: translateY(-50px);
    opacity: 0;
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.content-block {
  animation: tetris-stack 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**Visual:**
- Content blocks drop from above
- Bounce slightly when they land
- Snap into place

**Usage:**
```jsx
{resources.map((resource, i) => (
  <ResourceCard 
    key={resource.id}
    {...resource}
    style={{ animationDelay: `${i * 0.1}s` }}
  />
))}
```

---

### Animation 3: Rotation on Hover

**When:** Hovering over cards or buttons

**How it works:**
```css
.tetris-interactive {
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.tetris-interactive:hover {
  transform: rotate(90deg);
}
```

**Visual:**
- Small tetris icons rotate 90° on hover
- Tags rotate and change color
- Navigation icons spin

**Usage:**
```jsx
<TetrisIcon 
  icon="bookmark" 
  className="tetris-interactive"
/>
```

---

### Animation 4: Press Effect (Button Click)

**When:** Clicking buttons or interactive elements

**How it works:**
```css
.btn-tetris {
  box-shadow: 6px 6px 0 var(--off-black);
  transition: all 0.1s ease;
}

.btn-tetris:active {
  box-shadow: 3px 3px 0 var(--off-black);
  transform: translate(3px, 3px);
}

.btn-tetris:hover {
  box-shadow: 4px 4px 0 var(--off-black);
  transform: translate(2px, 2px);
}
```

**Visual:**
- Shadow shrinks
- Button moves down and right
- Creates "pressed into page" effect
- Snaps back when released

**Timing:**
- Hover: 200ms
- Active: 100ms
- Release: 150ms

---

### Animation 5: Line Clear (When Featured)

**When:** Featured items appear or user achieves something

**How it works:**
```css
@keyframes line-clear {
  0% {
    background: var(--off-white);
  }
  25% {
    background: var(--tetris-yellow);
  }
  50% {
    background: var(--off-white);
  }
  75% {
    background: var(--tetris-yellow);
  }
  100% {
    background: var(--off-white);
  }
}

.featured-item {
  animation: line-clear 1s ease 3;
}
```

**Visual:**
- Featured items flash yellow
- 3 times flash
- Then settle
- Like Tetris line clear effect

---

### Animation 6: Block Building (Hero Section)

**When:** Initial page load - hero section

**How it works:**
```css
@keyframes build-blocks {
  0% {
    clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
  }
  100% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

.hero-content {
  animation: build-blocks 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**Visual:**
- Text/content builds up from bottom like stacking blocks
- Feels like tetris pieces arranging themselves
- Bounces at end

---

### Animation 7: Block Shuffle (Category Switch)

**When:** Switching between sections

**How it works:**
```css
@keyframes shuffle-out {
  0% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%) rotate(-90deg);
    opacity: 0;
  }
}

@keyframes shuffle-in {
  0% {
    transform: translateX(100%) rotate(90deg);
    opacity: 0;
  }
  100% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
}

/* RTL version */
[dir="rtl"] @keyframes shuffle-out {
  0% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(100%) rotate(90deg);
    opacity: 0;
  }
}

[dir="rtl"] @keyframes shuffle-in {
  0% {
    transform: translateX(-100%) rotate(-90deg);
    opacity: 0;
  }
  100% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
}
```

**Visual:**
- Old content slides out and rotates
- New content slides in from opposite side
- Respects RTL direction

---

## 🎨 BACKGROUND ANIMATIONS

### Subtle Floating Blocks

**Where:** Behind content, very light

```jsx
<TetrisBackground>
  {/* Renders 20 random blocks */}
  {/* Opacity: 0.05 */}
  {/* Slow random movement */}
  {/* No interaction */}
</TetrisBackground>
```

**CSS:**
```css
.bg-tetris-block {
  position: absolute;
  opacity: 0.05;
  animation: float-tetris 20s ease-in-out infinite;
  animation-delay: calc(var(--block-index) * -2s);
}

@keyframes float-tetris {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -20px) rotate(45deg);
  }
  50% {
    transform: translate(-20px, 20px) rotate(90deg);
  }
  75% {
    transform: translate(20px, 20px) rotate(135deg);
  }
}
```

---

## 🖱️ MICRO-INTERACTIONS

### 1. Bookmark Heart Fill

```css
.bookmark-icon {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.bookmark-icon.saved {
  fill: var(--tetris-pink);
  transform: scale(1.2) rotate(12deg);
}

.bookmark-icon.saved::before {
  content: "💾";
  position: absolute;
  animation: pop 0.5s ease;
}
```

### 2. Vote Counter

```css
.vote-count {
  transition: all 0.3s ease;
}

.vote-count.increased {
  color: var(--tetris-green);
  transform: scale(1.3);
  animation: bounce-tetris 0.5s ease;
}

@keyframes bounce-tetris {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
```

### 3. Tag Selection

```css
.tag {
  transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 3px 3px 0 var(--off-black);
}

.tag:hover {
  transform: translate(-2px, -2px) rotate(-5deg);
  box-shadow: 5px 5px 0 var(--off-black);
}

.tag.selected {
  background: var(--tetris-yellow);
  transform: rotate(5deg);
  box-shadow: 6px 6px 0 var(--off-black);
}
```

---

## 📱 MOBILE-SPECIFIC ANIMATIONS

### Swipe Gestures

```javascript
const handleSwipe = (direction) => {
  if (direction === 'left' && !isRTL) {
    // Next section with slide animation
    setActiveSection(nextSection);
  }
  if (direction === 'right' && !isRTL) {
    // Previous section
    setActiveSection(prevSection);
  }
};
```

### Touch Feedback

```css
.mobile-card:active {
  transform: scale(0.98);
  box-shadow: 2px 2px 0 var(--off-black);
}
```

---

## 🎯 TETRIS ICONS - אייקונים בסגנון טטריס

### How to Create Tetris-Style Icons:

1. **Grid-Based**: 24x24px or 32x32px grid
2. **Blocky**: Use squares, no curves
3. **Limited Colors**: 1-2 colors + black outline
4. **Thick Lines**: 2-3px borders

### Example: Bookmark Icon
```svg
<svg width="24" height="24" viewBox="0 0 24 24">
  <!-- Tetris L-block shaped bookmark -->
  <path d="M8 4h8v2h-8v-2z" fill="#FD982E" stroke="#1F1F1F" stroke-width="2"/>
  <path d="M8 6h2v12h-2v-12z" fill="#FD982E" stroke="#1F1F1F" stroke-width="2"/>
  <path d="M10 18h8v2h-8v-2z" fill="#FD982E" stroke="#1F1F1F" stroke-width="2"/>
</svg>
```

### Icon Animation Template:
```css
.tetris-icon {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.tetris-icon:hover {
  transform: rotate(90deg) scale(1.1);
}

.tetris-icon:active {
  transform: scale(0.9);
}
```

---

## 🎭 STATE TRANSITIONS

### Loading → Loaded
```javascript
// Show falling blocks
<TetrisLoader />

// After data loads
<div className="animate-tetris-stack">
  {content}
</div>
```

### Empty → Content
```javascript
// Empty state shows one lonely block
<div className="empty-state">
  <TetrisBlock type="O" color="yellow" />
  <p>אין עדיין תוכן...</p>
</div>

// Content appears with stacking animation
<div className="content-grid animate-stack">
  {items.map(item => <Card {...item} />)}
</div>
```

### Normal → Featured
```javascript
// Regular card
<Card {...props} />

// Featured card pulses with yellow
<Card {...props} featured className="animate-line-clear" />
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Best Practices:

1. **Use CSS Transforms** (not position)
   ```css
   /* ❌ Slow */
   .block { left: 100px; top: 100px; }
   
   /* ✅ Fast */
   .block { transform: translate(100px, 100px); }
   ```

2. **Limit Animated Elements**
   - Max 20 background blocks
   - Max 7 falling blocks in loader
   - Pause animations when off-screen

3. **Use will-change** for frequently animated elements
   ```css
   .tetris-block-falling {
     will-change: transform, opacity;
   }
   ```

4. **Reduce Animation on Mobile**
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

5. **requestAnimationFrame** for complex animations
   ```javascript
   const animate = () => {
     // Update positions
     requestAnimationFrame(animate);
   };
   requestAnimationFrame(animate);
   ```

---

## 🎮 EASTER EGGS (Optional Fun Features)

### 1. Konami Code
```javascript
// Up Up Down Down Left Right Left Right B A
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// Activates secret tetris game overlay
```

### 2. Click Counter
```javascript
// After 7 clicks on logo, play tetris sound
const [clicks, setClicks] = useState(0);

if (clicks === 7) {
  playTetrisTheme();
  showEasterEgg();
}
```

### 3. Achievement Popups
```jsx
<Achievement
  icon={<TetrisBlock type="I" />}
  text="גילית 10 משאבים!"
  color="cyan"
/>
```

---

## 🔧 CURSOR PROMPTS FOR ANIMATIONS

### Prompt for Basic Animations:
```
Create tetris-themed animations:

1. Falling blocks loader (7 blocks, different colors, infinite loop)
2. Content stacking animation (bounce on land)
3. Button press effect (shadow shrinks, element moves)
4. Card hover rotation (90 degrees)
5. Line clear flash for featured items

Use CSS animations, optimized for performance.
Support RTL direction.
Use our color palette.
```

### Prompt for Interactive Elements:
```
Create interactive tetris micro-interactions:

1. Bookmark toggle (heart fills, rotates, bounces)
2. Vote counter (increases with scale animation)
3. Tag selection (rotates, changes shadow, color changes)
4. Category switch (slide out/in with rotation)

Make them playful but not annoying.
Use cubic-bezier for bounce effect.
```

### Prompt for Background:
```
Create subtle tetris background:

1. 20 random tetris blocks
2. Very low opacity (0.05)
3. Slow floating animation (20s loop)
4. Random positions
5. Doesn't interfere with content
6. Performance optimized (GPU accelerated)

Should feel ambient, not distracting.
```

---

## 📊 ANIMATION TIMING GUIDE

```
Micro-interactions:  100-300ms
Hover effects:       200-400ms
State changes:       300-500ms
Page transitions:    500-800ms
Loading animations:  1000-3000ms
Background motion:   10000-20000ms
```

**Easing Functions:**
```css
/* Bounce */
cubic-bezier(0.68, -0.55, 0.265, 1.55)

/* Smooth */
cubic-bezier(0.4, 0.0, 0.2, 1)

/* Sharp */
cubic-bezier(0.4, 0.0, 1, 1)

/* Tetris Drop */
cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

---

## ✅ ANIMATION CHECKLIST

Before launch, verify:

- [ ] All animations 60fps smooth
- [ ] RTL animations reversed correctly
- [ ] Mobile animations simplified
- [ ] Reduced motion respected
- [ ] No animation jank on slow devices
- [ ] Loading states have animations
- [ ] Hover states have feedback
- [ ] Click states have feedback
- [ ] Transitions between pages smooth
- [ ] Background animations don't distract

---

**זמן להנפיש את הטטריס! 🎮**

Make it playful, make it smooth, make it tetris! 🟪🟩🟧