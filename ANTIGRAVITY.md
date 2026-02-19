# Tetris Design Hub - Project Overview for Antigravity

## 🎮 Project Summary
**Tetris Design Hub** is a Hebrew-first, RTL resource hub for graphic design students, built with a unique Neo-Brutalist aesthetic and a Tetris theme. The project serves as a central repository for design resources, tools, tips, and inspiration.

- **Stack:** React 18 + Vite, Tailwind CSS
- **Backend:** Notion API (via serverless functions)
- **Design Style:** Neo-Brutalism + Tetris Theme
- **Language:** Hebrew (RTL)

## 🚀 Progress Report

### ✅ Completed Features
*   **Core Infrastructure**
    *   Vite + React project setup with Tailwind CSS.
    *   RTL support configured globally (`dir="rtl"`).
    *   Custom Tailwind configuration for the Neo-Brutalist design system.
    *   Notion API integration client (`src/lib/notion.js`).

*   **Design System & UI**
    *   **Neo-Brutalist Components:** Buttons, Inputs, Badges with hard shadows and thick borders.
    *   **Tetris Theme:** Custom SVG components for all 7 Tetris blocks (`I`, `O`, `T`, `S`, `Z`, `J`, `L`).
    *   **Animations:** Custom "blocky" animations and transitions.

*   **Component Library**
    *   **Layout:** Responsive `Header` and `Footer`.
    *   **Cards:** Specialized cards for different resource types:
        *   `ResourceCard` (General resources)
        *   `BookCard` (Recommended reading)
        *   `LocationCard` (Physical locations/print shops)
        *   `TipCard` (Quick design tips)
        *   `DesignerCard` (Featured designers)
        *   `ToolboxCard` (Software and tools)
    *   **Sections:** `ToolboxSection` for filtering and displaying tools.

*   **Logic & Hooks**
    *   `useData`: Hook for fetching and managing data from Notion.
    *   `useSearch`: Client-side search functionality supporting Hebrew text.

### 🚧 In Progress / Next Steps
*   Refining the Notion API data transformation.
*   Finalizing the mobile menu implementation.
*   Adding more interactive Tetris animations (e.g., clearing lines on interaction).
*   Comprehensive accessibility testing (ARIA labels, keyboard navigation).

## 📏 Rules & Standards

We follow a strict set of rules to ensure consistency and quality:

### 1. Design Principles
*   **RTL-First:** All layouts must be built for Right-to-Left directionality (`flex-row-reverse`, `text-right`, logical properties like `ms-4`).
*   **Neo-Brutalism:**
    *   **Borders:** 3px solid `#1F1F1F` (Off-Black).
    *   **Shadows:** Hard, offset shadows (6px for default, 3px for hover).
    *   **No Rounded Corners:** Sharp edges only (except for specific Tetris shapes).
*   **Tetris Theme:**
    *   Use Tetris block shapes for decoration and layout.
    *   Colors map to categories (Purple=Typography, Green=Mockups, etc.).
    *   Rotations restricted to 90° increments.

### 2. Coding Standards
*   **File Naming:** PascalCase for Components (`ResourceCard.jsx`), camelCase for hooks/utils (`useSearch.js`).
*   **Component Structure:**
    ```jsx
    const Component = ({ className, ...props }) => {
      return (
        <div dir="rtl" className={cn("base-classes", className)}>
          {/* Content */}
        </div>
      );
    };
    ```
*   **Performance:**
    *   Lazy loading for images and heavy components.
    *   `will-change` for animated elements.
    *   Memoization for expensive calculations (`useMemo`, `useCallback`).

### 3. Git Conventions
*   **Commit Messages:** `type: Description` (e.g., `feat: Add Tetris loader`, `fix: RTL alignment`).
*   **Types:** `feat`, `fix`, `style`, `refactor`, `docs`, `test`.

## 📂 Project Structure
```
src/
├── assets/          # SVG icons and static assets
├── components/
│   ├── cards/       # Resource display cards
│   ├── layout/      # Header, Footer, etc.
│   ├── sections/    # Page sections
│   ├── tetris/      # Tetris-themed components
│   └── ui/          # Basic UI primitives (Button, Input)
├── hooks/           # Custom React hooks
├── lib/             # Utilities and API clients
└── styles/          # Global styles and Tailwind config
```
