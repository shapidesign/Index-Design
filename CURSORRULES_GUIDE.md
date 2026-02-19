# HOW TO USE .CURSORRULES FILE
## Making Cursor AI Follow Your Design System Perfectly

---

## 🎯 WHAT IS .CURSORRULES?

The `.cursorrules` file is Cursor AI's instruction manual for your project. When you place it in your project root, Cursor reads it automatically and follows all the rules when generating code.

Think of it as **teaching Cursor to be your perfect design-system-aware developer**.

---

## 📦 SETUP (2 Minutes)

### Step 1: Create Your Project
```bash
mkdir tetris-design-hub
cd tetris-design-hub
```

### Step 2: Copy .cursorrules File
Copy the `.cursorrules` file I created into your project root:
```
tetris-design-hub/
  .cursorrules          ← This file!
  package.json
  src/
  ...
```

### Step 3: Open in Cursor
```bash
cursor .
```

**That's it!** Cursor now knows all your rules.

---

## ✨ WHAT THIS DOES

### Before .cursorrules:
You: "Create a button component"

Cursor: *Creates generic button with rounded corners, subtle shadow, English text*

### After .cursorrules:
You: "Create a button component"

Cursor: *Creates neo-brutalist button with 3px black border, 6px hard shadow, Hebrew text, RTL support, tetris theme, press animation, proper color palette*

**Everything matches your design system automatically!**

---

## 🎨 WHAT'S INCLUDED IN THE RULES

### 1. Design System Enforcement
- ✅ **Colors**: Only uses your palette (no random colors)
- ✅ **Typography**: Rubik font, proper sizes, Hebrew support
- ✅ **Spacing**: 4px base unit system
- ✅ **Shadows**: Always 6px brutalist shadows
- ✅ **Borders**: Always 3px thick black borders

### 2. RTL/Hebrew Rules
- ✅ **Direction**: Auto-adds `dir="rtl"`
- ✅ **Text Alignment**: Always `text-right`
- ✅ **Flexbox**: Uses `flex-row-reverse`
- ✅ **Margins**: Uses `ms-/me-` instead of `ml-/mr-`
- ✅ **Animations**: Reverses for RTL

### 3. Tetris Theme
- ✅ **Block Shapes**: Uses 7 tetris block types
- ✅ **Rotations**: Only 90° increments
- ✅ **Colors**: Category-coded colors
- ✅ **Animations**: Blocky, grid-based movement

### 4. Code Quality
- ✅ **Performance**: Uses transforms, lazy loading
- ✅ **Accessibility**: ARIA labels, keyboard nav
- ✅ **Security**: API keys in backend only
- ✅ **Error Handling**: Proper try/catch, user-friendly errors

### 5. Notion Integration
- ✅ **API Routes**: Backend-only pattern
- ✅ **Data Transform**: Notion → Clean objects
- ✅ **Error States**: Loading, error, empty states

---

## 🚀 HOW TO USE IT

### Method 1: Natural Language (Recommended)

Just describe what you want in natural language. Cursor will follow the rules automatically:

**Example 1:**
```
You: "Create a resource card component"

Cursor generates:
- RTL component with dir="rtl"
- Hebrew prop names in comments
- Neo-brutalist styling (borders + shadows)
- Tetris-themed category badges
- Proper color palette
- Accessibility attributes
- Performance optimizations
```

**Example 2:**
```
You: "Create a button that rotates when hovered"

Cursor generates:
- Button with brutalist styling
- 90° rotation on hover (tetris theme)
- Shadow movement (press effect)
- RTL-aware
- Hebrew aria-label
```

**Example 3:**
```
You: "Create a loading animation"

Cursor generates:
- TetrisLoader component
- 7 falling blocks
- Your color palette
- Smooth 60fps animation
- RTL support
```

### Method 2: Reference Rules Explicitly

If you want to emphasize something specific:

```
You: "Create a card following the neo-brutalist rules in .cursorrules"

Cursor: *Focuses especially on brutalist styling*
```

### Method 3: Ask Cursor to Explain Rules

```
You: "What are the color rules for this project?"

Cursor: *Explains your color palette from .cursorrules*
```

---

## 🎯 EXAMPLE PROMPTS THAT WORK PERFECTLY

### Creating Components:
```
✅ "Create a navigation bar"
✅ "Make a search input"
✅ "Build a footer with 3 columns"
✅ "Create a mobile menu"
✅ "Make a resource card"
✅ "Build a tetris loader"
```

### Styling Existing Components:
```
✅ "Add brutalist styling to this button"
✅ "Make this card RTL-compatible"
✅ "Add tetris theme to this icon"
✅ "Fix the shadow on hover"
```

### Fixing Issues:
```
✅ "This text isn't right-aligned, fix it"
✅ "The animation isn't RTL-aware"
✅ "The colors don't match the palette"
✅ "Add Hebrew labels to these buttons"
```

### Building Features:
```
✅ "Create a search feature with filtering"
✅ "Add a bookmark system with localStorage"
✅ "Build a category switcher"
✅ "Implement a voting system"
```

---

## 💡 BEST PRACTICES

### 1. Trust the Rules
Don't micro-manage every detail. Let Cursor follow the rules.

**Instead of:**
```
"Create a button with bg-purple-400, 3px border, 6px shadow at position 6,6, 
RTL support, Hebrew text..."
```

**Just say:**
```
"Create a primary button"
```

Cursor knows all those details from .cursorrules!

### 2. Be Specific About Functionality
Focus your prompts on **what**, not **how**:

**Good:**
```
"Create a card that shows a resource with save button and tags"
```

**Less Good:**
```
"Create a div with flex-row-reverse and border-3..."
```

### 3. Iterate with Cursor
If something's not perfect:

```
You: "Create a card"
Cursor: [generates card]
You: "Add a featured badge to the top-right"
Cursor: [adds badge following tetris theme]
You: "Make the badge rotate slightly"
Cursor: [adds rotation following 90° rule]
```

### 4. Review Generated Code
Always check that Cursor:
- ✅ Used the right colors
- ✅ Added RTL support
- ✅ Included Hebrew text/comments
- ✅ Followed brutalist styling
- ✅ Added accessibility

---

## 🔧 CUSTOMIZING THE RULES

### Want to Change Something?

Edit `.cursorrules` directly:

**Example: Change primary color**
```javascript
// In .cursorrules, find:
--tetris-purple: #7D53FA;

// Change to:
--tetris-purple: #9333EA;  // Darker purple
```

**Example: Add new rule**
```javascript
// Add to .cursorrules:
### ANIMATION SPEED
All animations must complete in under 300ms for responsiveness.
```

**After editing:**
1. Save `.cursorrules`
2. Restart Cursor (Cmd+Shift+P → "Reload Window")
3. New rules take effect immediately

---

## 🐛 TROUBLESHOOTING

### Issue: Cursor Not Following Rules

**Solution 1:** Make sure `.cursorrules` is in project root
```
tetris-design-hub/
  .cursorrules  ← Must be here!
  src/
  package.json
```

**Solution 2:** Reload Cursor
- Press Cmd+Shift+P (or Ctrl+Shift+P)
- Type "Reload Window"
- Hit Enter

**Solution 3:** Be more explicit in your prompt
```
Instead of: "Create a button"
Try: "Create a button following the brutalist rules"
```

### Issue: Generated Code Has Wrong Colors

**Check:**
1. Is the color in your palette? (Check COLOR_PALETTE.md)
2. Did you specify a category? (Each category has a color)
3. Try: "Use the tetris color palette from .cursorrules"

### Issue: RTL Not Working

**Remind Cursor:**
```
"Create this component with RTL support as specified in .cursorrules"
```

Or:
```
"Fix the RTL in this component"
```

---

## 📊 WHAT CURSOR LEARNS FROM THE FILE

### Project Context:
- Hebrew language project
- RTL direction
- Neo-brutalist design
- Tetris theme
- For design students

### Technical Stack:
- React 18
- Vite
- Tailwind CSS
- Notion API
- Vercel deployment

### Code Patterns:
- Component structure
- File organization
- Naming conventions
- Git commit format

### Common Components:
- Buttons (3 types)
- Cards (4 types)
- Tetris blocks (7 types)
- Loaders, inputs, badges

### Best Practices:
- Performance (transforms, lazy loading)
- Accessibility (ARIA, keyboard nav)
- Security (API keys)
- Error handling

---

## 🎯 REAL EXAMPLE WORKFLOW

### You Want: Create a Location Card

**Your Prompt:**
```
Create a LocationCard component that displays:
- Name
- Address
- Hours
- Student tip
- Phone number
- Rating stars
```

**What Cursor Does (Automatically):**

1. **Reads .cursorrules**
2. **Generates component with:**
   - ✅ RTL support (`dir="rtl"`)
   - ✅ Hebrew prop names in JSDoc
   - ✅ Brutalist styling (3px border, 6px shadow)
   - ✅ Tetris-themed category badge
   - ✅ Proper color from palette
   - ✅ Right-aligned text
   - ✅ Hover animation (shadow movement)
   - ✅ Accessibility labels in Hebrew
   - ✅ Map pin as tetris icon
   - ✅ Star rating with tetris blocks
   - ✅ Mobile responsive
   - ✅ Performance optimized

**You Get: Perfect component on first try!**

---

## 🎨 ADVANCED USAGE

### Chain Multiple Components:
```
You: "Create a resources section with:
1. Search bar
2. Category filters
3. Grid of resource cards
4. Loading state"

Cursor: *Generates entire section following all rules*
```

### Update Existing Code:
```
You: "Refactor this component to follow .cursorrules"

Cursor: *Updates to match design system*
```

### Generate Multiple Variants:
```
You: "Create 3 button variants: primary, secondary, icon-only"

Cursor: *Generates all 3 with consistent styling*
```

---

## ✅ VERIFICATION CHECKLIST

After Cursor generates code, verify:

- [ ] Colors match palette (no random colors)
- [ ] RTL direction is set
- [ ] Text is right-aligned
- [ ] Borders are 3px thick black
- [ ] Shadows are 6px hard shadows
- [ ] Hebrew text/comments present
- [ ] Animations use transforms
- [ ] Accessibility attributes added
- [ ] Component follows naming convention
- [ ] No API keys exposed in frontend

If any fail, tell Cursor:
```
"Fix this to match .cursorrules specifications"
```

---

## 🚀 POWER TIPS

### Tip 1: Use "Following .cursorrules"
Add this phrase to emphasize rule-following:
```
"Create a hero section following .cursorrules"
```

### Tip 2: Reference Specific Sections
Point to specific rules:
```
"Use the color system from .cursorrules"
"Follow the RTL implementation rules"
"Apply the animation guidelines"
```

### Tip 3: Build on Examples
Reference the example component in .cursorrules:
```
"Create a card similar to the ResourceCard example in .cursorrules"
```

### Tip 4: Batch Operations
Ask for multiple related items:
```
"Create all the tetris block components (I, O, T, S, Z, J, L)"
```

### Tip 5: Style Consistency
When adding features:
```
"Add a voting system with brutalist styling consistent with the project"
```

---

## 📚 RELATED FILES

Work together with these guides:

1. **TETRIS_HUB_GUIDE.md** - Overall project plan
2. **COLOR_PALETTE.md** - Detailed color specs
3. **TETRIS_ANIMATIONS.md** - Animation details
4. **QUICK_START.md** - Timeline and checklist
5. **.cursorrules** - Cursor's instruction manual (this file!)

They all work together to guide your project.

---

## 🎉 FINAL THOUGHTS

The `.cursorrules` file is your **secret weapon** for consistent, high-quality code generation with Cursor AI.

**Benefits:**
- ✅ Saves time (no repetitive styling)
- ✅ Ensures consistency (every component matches)
- ✅ Reduces errors (rules enforced automatically)
- ✅ Speeds up development (just describe functionality)
- ✅ Maintains quality (design system baked in)

**Remember:**
- Place `.cursorrules` in project root
- Restart Cursor after editing
- Trust the rules, focus on features
- Iterate with Cursor naturally
- Verify generated code matches

---

**זמן לבנות עם Cursor! 🚀**

With .cursorrules, every component will be:
- 🎨 Beautifully designed
- 🌍 RTL-ready
- 🎮 Tetris-themed
- 💪 Neo-brutalist
- ♿ Accessible
- ⚡ Performant

**Just describe what you want, Cursor handles the how!**