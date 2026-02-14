---
name: tetris-hub-components
description: Component patterns and templates for Tetris Design Hub - JSX component template, button patterns, card patterns, Tetris block SVG component, search implementation, state management, Notion API integration, error handling, and full example component
---
## COMPONENT TEMPLATE

Every component MUST follow this structure:

```jsx
import React from 'react';
import { cn } from '@/lib/utils'; // classnames utility

/**
 * ComponentName - Brief description
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional classes
 * @returns {JSX.Element}
 */
const ComponentName = ({ 
  children,
  className,
  ...props 
}) => {
  return (
    <div 
      dir="rtl"
      className={cn(
        "base-classes",
        "rtl-specific-classes",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default ComponentName;
```

## NOTION API INTEGRATION

### Environment Variables
```env
# Backend only (no VITE_ prefix)
NOTION_API_KEY=secret_xxx
NOTION_RESOURCES_DB=xxx
NOTION_LOCATIONS_DB=xxx
NOTION_BOOKS_DB=xxx
NOTION_TIPS_DB=xxx
NOTION_DESIGNERS_DB=xxx
```

### API Routes Pattern
```javascript
// api/index.js
export default async (req, res) => {
  const { type } = req.query;
  
  try {
    const data = await fetchFromNotion(type);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Frontend Data Fetching
```javascript
// ALWAYS use API routes, NEVER expose Notion key in frontend
const fetchResources = async () => {
  const response = await fetch('/api/resources');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};
```

### Notion Data Transformation
```javascript
// Transform Notion properties to clean objects
const transformResource = (page) => ({
  id: page.id,
  name: page.properties.Name.title[0]?.plain_text || '',
  description: page.properties.Description.rich_text[0]?.plain_text || '',
  category: page.properties.Category.select?.name || '',
  link: page.properties.Link.url || '',
  tip: page.properties.Tip.rich_text[0]?.plain_text || '',
  featured: page.properties.Featured.checkbox || false,
  tags: page.properties.Tags.multi_select.map(t => t.name) || []
});
```

## BUTTON PATTERNS

### Primary Button (Default State)
```jsx
<button className={cn(
  "px-6 py-3",
  "bg-tetris-purple",
  "text-off-black font-bold text-base",
  "border-3 border-off-black",
  "shadow-brutalist",
  "transition-all duration-200",
  "hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]",
  "active:shadow-none active:translate-x-[6px] active:translate-y-[6px]",
  "disabled:opacity-50 disabled:cursor-not-allowed"
)}>
  כפתור
</button>
```

### Secondary Button
```jsx
<button className={cn(
  "px-6 py-3",
  "bg-off-white",
  "text-off-black font-bold text-base",
  "border-3 border-off-black",
  "shadow-brutalist",
  "hover:bg-light-gray",
  "transition-all duration-200"
)}>
  כפתור משני
</button>
```

### Icon Button
```jsx
<button className={cn(
  "p-3",
  "bg-tetris-yellow",
  "border-3 border-off-black",
  "shadow-brutalist-sm",
  "hover:rotate-90",
  "transition-all duration-300 ease-bounce"
)}>
  <TetrisIcon icon="bookmark" size={24} />
</button>
```

## CARD PATTERNS

### Resource Card
```jsx
<div className={cn(
  "p-6",
  "bg-off-white",
  "border-3 border-off-black",
  featured ? "shadow-[6px_6px_0_#FDE047,9px_9px_0_#1F1F1F]" : "shadow-brutalist",
  "hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]",
  "transition-all duration-200",
  "group"
)}>
  <div className="flex flex-row-reverse items-start justify-between mb-3">
    <h3 className="text-xl font-bold text-off-black text-right">{name}</h3>
    <TetrisIcon icon="external-link" className="text-dark-gray" />
  </div>
  
  <p className="text-base text-dark-gray text-right mb-4">{description}</p>
  
  {tip && (
    <div className="mt-4 pt-4 border-t-3 border-light-gray">
      <p className="text-sm text-off-black text-right">💡 {tip}</p>
    </div>
  )}
  
  <div className="flex flex-row-reverse gap-2 mt-4">
    {tags.map(tag => (
      <span key={tag} className="px-3 py-1 bg-tetris-purple border-2 border-off-black shadow-[2px_2px_0_#1F1F1F] text-xs font-bold">
        {tag}
      </span>
    ))}
  </div>
</div>
```

## TETRIS BLOCK COMPONENT

### Base Pattern
```jsx
const TetrisBlock = ({ type, color, size = 24, className }) => {
  const blocks = {
    I: { path: "M0,0 L96,0 L96,24 L0,24 Z", viewBox: "0 0 96 24" },
    O: { path: "M0,0 L48,0 L48,48 L0,48 Z", viewBox: "0 0 48 48" },
    T: { path: "M0,0 L72,0 L72,24 L48,24 L48,48 L24,48 L24,24 L0,24 Z", viewBox: "0 0 72 48" },
    // ... other blocks
  };
  
  const block = blocks[type];
  const colors = {
    cyan: '#67E8F9',
    yellow: '#FDE047',
    purple: '#7D53FA',
    green: '#36EF79',
    pink: '#F9A8D4',
    blue: '#93C5FD',
    orange: '#FD982E'
  };
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={block.viewBox}
      className={cn("tetris-block", className)}
    >
      <path
        d={block.path}
        fill={colors[color]}
        stroke="#1F1F1F"
        strokeWidth="3"
      />
    </svg>
  );
};
```

## SEARCH IMPLEMENTATION

### Search Hook Pattern
```javascript
const useSearch = (items, searchQuery) => {
  return useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    
    return items.filter(item => {
      // Search in Hebrew and English
      const searchableText = [
        item.name,
        item.description,
        item.tip,
        ...(item.tags || [])
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
  }, [items, searchQuery]);
};
```

### Search Input
```jsx
<div className="relative">
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="חיפוש משאבים..."
    className={cn(
      "w-full px-4 py-3 pe-12",
      "bg-off-white",
      "text-off-black text-right",
      "border-3 border-off-black",
      "focus:outline-none focus:shadow-brutalist",
      "transition-shadow duration-200"
    )}
    dir="rtl"
  />
  <TetrisIcon 
    icon="search" 
    className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-gray"
  />
</div>
```

## STATE MANAGEMENT

### Loading States
```jsx
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);
const [error, setError] = useState(null);

// ALWAYS show TetrisLoader during loading
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white">
      <TetrisLoader />
    </div>
  );
}

// ALWAYS show friendly error with retry
if (error) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-off-white p-8">
      <TetrisBlock type="O" color="yellow" size={64} />
      <h2 className="text-2xl font-bold text-off-black mt-6 mb-4">אופס! משהו השתבש</h2>
      <p className="text-dark-gray text-center mb-6">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-tetris-green border-3 border-off-black shadow-brutalist"
      >
        נסה שוב
      </button>
    </div>
  );
}
```

## ERROR HANDLING

### API Calls
```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/resources');
    
    if (!response.ok) {
      throw new Error(`שגיאה בטעינת הנתונים: ${response.status}`);
    }
    
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    setError(error.message || 'שגיאה לא צפויה');
  } finally {
    setLoading(false);
  }
};
```

### Form Validation
```javascript
const validateForm = (values) => {
  const errors = {};
  
  if (!values.name?.trim()) {
    errors.name = 'שם הוא שדה חובה';
  }
  
  if (values.email && !isValidEmail(values.email)) {
    errors.email = 'כתובת אימייל לא תקינה';
  }
  
  return errors;
};
```

## EXAMPLE FULL COMPONENT

Here's a perfect example that follows ALL rules:

```jsx
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import TetrisIcon from '@/components/tetris/TetrisIcon';

/**
 * ResourceCard - כרטיס משאב עבור סטודנטים
 * Displays a resource with tetris-themed brutalist design
 * 
 * @param {Object} props
 * @param {string} props.name - שם המשאב
 * @param {string} props.description - תיאור המשאב
 * @param {string} props.category - קטגוריה
 * @param {string} props.link - קישור
 * @param {string} props.tip - טיפ לסטודנט
 * @param {boolean} props.featured - האם מומלץ
 * @param {string[]} props.tags - תגיות
 */
const ResourceCard = ({
  name,
  description,
  category,
  link,
  tip,
  featured = false,
  tags = [],
  className
}) => {
  const [saved, setSaved] = useState(false);
  
  const categoryColors = {
    'טיפוגרפיה': 'bg-tetris-purple',
    'מוקאפים': 'bg-tetris-green',
    'כלי AI': 'bg-tetris-orange',
    'תוכנות': 'bg-tetris-blue'
  };
  
  const handleSave = () => {
    setSaved(!saved);
    // Save to localStorage or API
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (!saved) {
      bookmarks.push({ name, link });
    } else {
      const index = bookmarks.findIndex(b => b.link === link);
      bookmarks.splice(index, 1);
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  };
  
  return (
    <article 
      dir="rtl"
      className={cn(
        "p-6",
        "bg-off-white",
        "border-3 border-off-black",
        featured 
          ? "shadow-[6px_6px_0_#FDE047,9px_9px_0_#1F1F1F]" 
          : "shadow-brutalist",
        "hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]",
        "transition-all duration-200",
        "group",
        "animate-tetris-stack",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-row-reverse items-start justify-between mb-4">
        <div className="flex-1 me-4">
          <h3 className="text-xl font-bold text-off-black text-right mb-2">
            {name}
          </h3>
          <span 
            className={cn(
              "inline-block px-3 py-1",
              "text-xs font-bold",
              "border-2 border-off-black",
              "shadow-[2px_2px_0_#1F1F1F]",
              categoryColors[category] || 'bg-light-gray'
            )}
          >
            {category}
          </span>
        </div>
        
        <button
          onClick={handleSave}
          aria-label={saved ? "בטל שמירה" : "שמור משאב"}
          className={cn(
            "p-2",
            "border-3 border-off-black",
            "shadow-brutalist-sm",
            "transition-all duration-300",
            "hover:rotate-90 hover:scale-110",
            saved ? "bg-tetris-pink" : "bg-off-white"
          )}
        >
          <TetrisIcon 
            icon={saved ? "bookmark-filled" : "bookmark"} 
            size={20}
          />
        </button>
      </div>
      
      {/* Description */}
      <p className="text-base text-dark-gray text-right mb-4 leading-relaxed">
        {description}
      </p>
      
      {/* Link */}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex flex-row-reverse items-center gap-2",
            "text-sm font-medium text-off-black",
            "hover:text-tetris-purple",
            "transition-colors duration-200"
          )}
        >
          <span>קישור למשאב</span>
          <TetrisIcon icon="external-link" size={16} />
        </a>
      )}
      
      {/* Student Tip */}
      {tip && (
        <div className="mt-4 pt-4 border-t-3 border-light-gray">
          <p className="text-sm text-off-black text-right">
            <span className="font-bold">💡 טיפ: </span>
            {tip}
          </p>
        </div>
      )}
      
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-row-reverse flex-wrap gap-2 mt-4">
          {tags.map(tag => (
            <span
              key={tag}
              className={cn(
                "px-3 py-1",
                "bg-light-gray",
                "border-2 border-off-black",
                "shadow-[2px_2px_0_#1F1F1F]",
                "text-xs font-bold",
                "hover:bg-tetris-yellow hover:rotate-[-5deg]",
                "transition-all duration-200 ease-bounce",
                "cursor-pointer"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 -right-3">
          <span className={cn(
            "block px-3 py-1",
            "bg-tetris-yellow",
            "text-off-black text-xs font-bold",
            "border-3 border-off-black",
            "shadow-brutalist-sm",
            "rotate-12",
            "animate-line-clear"
          )}>
            מומלץ ⭐
          </span>
        </div>
      )}
    </article>
  );
};

export default ResourceCard;
```
