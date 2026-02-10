# Frontend Guidelines

**Last Updated**: February 10, 2026

---

## Design Philosophy

- **Dark mode first** — coder's natural habitat
- **Information density** — show useful data, hide decorations
- **Motion with purpose** — animations guide attention, not distract
- **Keyboard-first intent** — mouse works, keyboard is faster
- **Two feature surfaces** — Playground and Notebook, each gets its own optimized layout

---

## Color System

### Brand (Orange)

```css
--primary-50:  #fff7ed;
--primary-100: #ffedd5;
--primary-200: #fed7aa;
--primary-300: #fdba74;
--primary-400: #fb923c;
--primary-500: #f97316;  /* Primary CTA, active states */
--primary-600: #ea580c;  /* Hover states */
--primary-700: #c2410c;  /* Pressed states */
```

### Dark Mode Surface (Default)

```css
--bg:          #111827;  /* Page background */
--surface:     #1f2937;  /* Cards, panels */
--surface-alt: #374151;  /* Elevated surfaces, borders */
--text:        #f9fafb;  /* Primary text */
--text-muted:  #9ca3af;  /* Secondary text */
--border:      #374151;  /* Borders */
```

### Semantic

```css
--success: #10b981;  /* Mastered, completed */
--warning: #f59e0b;  /* Attempted, in progress */
--error:   #ef4444;  /* Errors, destructive */
--info:    #3b82f6;  /* Links, information */
```

### Mastery Colors (DSA Specific)

```css
--mastery-untouched:  #6b7280;  /* Gray */
--mastery-attempted:  #eab308;  /* Yellow */
--mastery-solved:     #22c55e;  /* Green */
--mastery-understood: #3b82f6;  /* Blue */
--mastery-mastered:   #a855f7;  /* Purple */
```

---

## Typography

| Use | Font | Weight | Size |
|-----|------|--------|------|
| Headings | System sans-serif | 700 | 24-36px |
| Body | System sans-serif | 400 | 16px |
| Labels/UI | System sans-serif | 500 | 14px |
| Code (editor) | `'Fira Code', monospace` | 400 | 14px |
| Code (notes) | `'Fira Code', monospace` | 400 | 13px |
| Captions | System sans-serif | 400 | 12px |

---

## Component Patterns

### DSA Playground Components

#### Question Card

```jsx
<div className="
  flex items-center justify-between
  p-3 rounded-lg
  bg-gray-800 border border-gray-700
  hover:border-gray-600 hover:bg-gray-750
  cursor-pointer transition-all duration-200
">
  {/* Mastery dot */}
  <span className="w-3 h-3 rounded-full bg-purple-500" />

  {/* Title + difficulty */}
  <div className="flex-1 ml-3">
    <p className="text-white text-sm font-medium">Two Sum</p>
    <span className="text-xs text-green-400">Easy</span>
  </div>

  {/* Pattern tags */}
  <div className="flex gap-1">
    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
      Two Pointer
    </span>
  </div>
</div>
```

#### Mastery Selector

```jsx
<div className="flex gap-2">
  {[
    { level: 'attempted', color: 'yellow', icon: '🟡' },
    { level: 'solved', color: 'green', icon: '🟢' },
    { level: 'understood', color: 'blue', icon: '🔵' },
    { level: 'mastered', color: 'purple', icon: '🟣' },
  ].map(m => (
    <button
      key={m.level}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${active === m.level
          ? `bg-${m.color}-500/20 text-${m.color}-300 ring-1 ring-${m.color}-500`
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
      `}
    >
      {m.icon} {m.level}
    </button>
  ))}
</div>
```

#### Pattern Tag

```jsx
<span className="
  inline-flex items-center gap-1
  px-2 py-0.5
  text-xs font-medium
  rounded-full
  bg-orange-500/15 text-orange-300
  border border-orange-500/30
">
  Sliding Window
</span>
```

#### Stats Bar

```jsx
<div className="
  flex items-center gap-4
  px-4 py-2
  bg-gray-800/80 backdrop-blur-sm
  border-b border-gray-700
  text-sm text-gray-400
">
  <span><strong className="text-white">142</strong> solved</span>
  <span><strong className="text-purple-400">23</strong> mastered</span>
  <span className="text-orange-400">🔥 7 day streak</span>
</div>
```

#### Version Timeline

```jsx
<div className="flex items-center gap-2 overflow-x-auto py-2">
  {versions.map((v, i) => (
    <button
      key={v.id}
      className={`
        px-2 py-1 rounded text-xs whitespace-nowrap
        ${active === i
          ? 'bg-orange-500 text-white'
          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
      `}
    >
      v{i + 1} · {v.timestamp}
    </button>
  ))}
</div>
```

### Notebook Components

#### Folder Tree Item

```jsx
<div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800 cursor-pointer">
  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`} />
  <Folder className="w-4 h-4 text-orange-400" />
  <span className="text-sm text-gray-300 truncate">{folder.name}</span>
  <span className="text-xs text-gray-600 ml-auto">{folder.noteCount}</span>
</div>
```

#### Search Result

```jsx
<div className="p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-orange-500/50 cursor-pointer">
  <p className="text-sm font-medium text-white">{note.title}</p>
  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
    ...matching <mark className="bg-orange-500/30 text-orange-200 rounded px-0.5">content</mark> here...
  </p>
  <div className="flex gap-1 mt-2">
    {note.tags.map(tag => (
      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">{tag}</span>
    ))}
  </div>
</div>
```

### Shared Components

#### Primary Button

```jsx
<button className="
  px-4 py-2 rounded-lg
  bg-orange-600 hover:bg-orange-700 active:bg-orange-800
  text-white font-medium text-sm
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Save Solution
</button>
```

#### Card

```jsx
<div className="
  bg-gray-800 border border-gray-700
  rounded-xl p-6
  hover:border-gray-600 hover:shadow-lg
  transition-all duration-200
">
  {children}
</div>
```

#### Modal

```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
  <div className="
    relative bg-gray-800 border border-gray-700
    rounded-lg shadow-2xl p-6
    max-w-md w-full mx-4
  ">
    {children}
  </div>
</div>
```

#### Toast

Using `react-toastify` with dark theme. All toasts auto-dismiss in 3 seconds.

---

## Layout Patterns

### Playground Layout (Desktop)

```
┌─────────────────────────────────────────────┐
│ Stats Bar: 142 solved | 23 mastered | 🔥 7  │
├────────┬────────────────┬───────────────────┤
│ Topic  │ Question Panel │ Monaco Editor     │
│ Tree   │                │                   │
│ (250px)│ (flex 1)       │ (flex 2)          │
│        │                │                   │
│        │ [Notes]        │ [Version Bar]     │
│        │ [AI Panel]     │ [Language Sel]    │
├────────┴────────────────┴───────────────────┤
│ FAB (fixed bottom-right)                    │
└─────────────────────────────────────────────┘
```

### Notebook Layout (Desktop)

```
┌─────────────────────────────────────────────┐
│ Toolbar: Search (Ctrl+K)  |  + New Note     │
├────────┬────────────────────────────────────┤
│ Sidebar│ TipTap Editor                      │
│ ───────│                                    │
│ Folders│ [Content Area]                     │
│ Notes  │                                    │
│ (280px)│                                    │
│ Tags   │                                    │
├────────┴────────────────────────────────────┤
│ FAB (fixed bottom-right)                    │
└─────────────────────────────────────────────┘
```

### Mobile Layout

```
Single panel, full width.
- Sidebar becomes a drawer (slide from left)
- Question panel and editor stack vertically
- Swipe between panels on Playground
- FAB is larger (56px touch targets)
```

---

## Animation System

### Framer Motion Variants

```javascript
// Container with stagger
const containerVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 12 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 400, damping: 28, staggerChildren: 0.06 }
  }
};

// Items
const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 700, damping: 30 } },
  exit: { opacity: 0, y: 6, scale: 0.95, transition: { duration: 0.12 } }
};
```

### CSS Transitions

```css
/* Default: color changes */
transition-colors duration-200

/* Transforms (hover effects) */
transition-transform duration-200

/* Layout changes (careful, can be expensive) */
transition-all duration-200
```

### Rules

- Only animate `transform` and `opacity` for 60fps
- Respect `prefers-reduced-motion`
- No animation longer than 600ms (except page transitions)
- Mastery dot gets a 400ms color pulse on level change

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Color contrast | 4.5:1 minimum for text |
| Focus indicators | 2px orange ring on all interactive elements |
| Keyboard nav | `Tab` through all controls, `Enter` to activate |
| Screen readers | Semantic HTML, `aria-label` on icon buttons |
| Touch targets | Minimum 44×44px, FAB 56×56px |

---

## Icon System

**Primary:** `lucide-react` for clean, consistent icons
**Secondary:** `react-icons` (Fi set) for supplementary icons

| Size | Class | Use |
|------|-------|-----|
| 16px | `w-4 h-4` | Inline text, badges |
| 20px | `w-5 h-5` | Buttons, nav items |
| 24px | `w-6 h-6` | Feature icons, headings |

---

## Dark Mode

Dark mode is the **default**. Light mode exists but is secondary.

```javascript
// Persisted in localStorage
const darkMode = localStorage.getItem('darkMode') !== 'false'; // default true

// Applied via body class
document.body.classList.toggle('dark', darkMode);
```

All components use `dark:` Tailwind prefix. Dark mode colors are defined in `tailwind.config.js`.

---

## Monaco Editor Styling

```jsx
<Editor
  height="100%"
  defaultLanguage="javascript"
  theme="vs-dark"
  options={{
    fontSize: 14,
    fontFamily: "'Fira Code', monospace",
    minimap: { enabled: false },
    padding: { top: 16, bottom: 16 },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true,
  }}
/>
```

Container:
```jsx
<div className="h-full rounded-lg overflow-hidden border border-gray-700">
  {/* Monaco fills this */}
</div>
```
