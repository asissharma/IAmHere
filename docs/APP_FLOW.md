# Application Flow

## Architecture

```
┌─────────────────────────────────────────────┐
│              Homepage (Trial)               │
│         Portfolio · Public Landing          │
│              [Auth Trigger]                 │
└──────────────┬──────────────┬───────────────┘
               │              │
        ┌──────▼──────┐ ┌────▼──────┐
        │  Playground  │ │ Notebook  │
        │  DSA Dojo    │ │ Knowledge │
        │  (Auth)      │ │ Vault     │
        │              │ │ (Auth)    │
        └──────────────┘ └───────────┘
               │              │
               └──────┬───────┘
                      │
              [Bi-directional Links]
```

Two features behind auth. Homepage is public. That's it.

---

## Flow 1: Authentication

```
User on Homepage
    → Clicks Playground or Notebook
    → Auth Modal
    → Enter password
    → Valid? → Navigate to section
    → Invalid? → Error, retry
```

**States after auth:**
- `isAuthenticated = true`
- `isMenuUnlocked = true`
- FAB menu shows: Playground, Notebook (+ upload, editor as utility)

---

## Flow 2: DSA Practice Session (Hero Flow)

This is the primary journey. Every detail matters.

### 2a. Enter Playground

```
FAB Menu → Playground
    → Topic Hierarchy Sidebar loads
    → Stats bar visible: "142 solved | 23 mastered | 🔥 7 day streak"
```

### 2b. Navigate to Question

```
Topic (e.g. Arrays)
    → Subtopic (e.g. Two Pointers)
        → Pattern (e.g. Opposite Direction)
            → Question List
                → Each shows: title, difficulty, mastery dot, pattern tags
```

**Special entry: Spaced Repetition Queue**
```
"5 questions need review" banner at top
    → Click to see review queue
    → Questions sorted by urgency (overdue first)
    → Complete review → queue shrinks
```

### 2c. Solution Studio

```
┌─────────────────────────────────────┐
│ Question Panel  │  Monaco Editor    │
│                 │                   │
│ Problem text    │  function solve() │
│ Examples        │    // your code   │
│ Constraints     │                   │
│─────────────────│───────────────────│
│ Pattern: [Tag]  │  Lang: JS ▾      │
│ Mastery: 🔵     │  Version: v3 ◀▶  │
│ Notes: (expand) │  Time: 23 min    │
│ AI: (toggle)    │  O(n) / O(1)     │
└─────────────────────────────────────┘
```

### 2d. Save & Track

```
Ctrl+S → Save version
    → New version created (v4)
    → Can view diff: v3 ↔ v4
    → Set mastery level
    → Tag patterns used
    → Auto-track time spent
    → Write inline note (optional)
    → Link to Notebook note (optional)
```

### 2e. AI Assistance

```
Click AI Panel
    → "Explain" → Approach explanation
    → "Why This Pattern?" → Pattern reasoning
    → "Optimize" → Performance suggestions
    → "Edge Cases" → Breaking inputs
    → "Similar" → 3 related problems
    → "Hint" → Nudge without spoiling
```

AI has full context: question + your code + your notes + pattern tags.

---

## Flow 3: Notebook

### 3a. Open Notebook

```
FAB Menu → Notebook
    → Sidebar: Folder tree + Notes list
    → Search bar (Ctrl+K)
    → Templates dropdown
```

### 3b. Create Note

```
"+ New Note" → Choose template or blank
    → TipTap editor loads
    → Type content
    → Auto-save every 2s
    → Add tags
    → Place in folder
```

### 3c. Search

```
Ctrl+K → Search overlay
    → Type query
    → Fuzzy matches appear instantly
    → Highlighted preview snippets
    → Click to navigate
```

### 3d. DSA Integration

```
From Playground:
    "Create Note" button on question
    → New note pre-filled: question title, your code, approach
    → Bi-directional link created

From Notebook:
    Type [[DSA: Two Sum]]
    → Link to DSA question
    → Click to jump there

In Playground sidebar:
    "Linked Notes" section
    → Shows all notes referencing this question
```

---

## Flow 4: Navigation

### FAB Menu Items

| Item | Section | Icon |
|------|---------|------|
| Playground | DSA Dojo | Code icon |
| Notebook | Knowledge Vault | Book icon |
| Upload | File upload (utility) | Upload icon |
| Editor | Text editor (utility) | Edit icon |

Homepage (Trial) is the default landing, accessed by going "back" or refreshing.

### Keyboard Shortcuts (Target)

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Global search |
| `Ctrl+S` | Save (context-aware) |
| `Ctrl+1` | Go to Playground |
| `Ctrl+2` | Go to Notebook |
| `Escape` | Close panel/modal |

---

## Error Handling

| Scenario | User Sees | System Does |
|----------|-----------|-------------|
| API save fails | Toast: "Save failed, retrying..." | Auto-retry 3x, then manual retry button |
| Monaco won't load | Fallback textarea | Log error, basic functionality preserved |
| AI service down | "AI unavailable" in panel | Non-blocking, solution submission still works |
| Network offline | Offline indicator banner | Queue saves, retry on reconnection |
| Auth expired | Auth modal on next action | Re-authenticate, preserve pending action |

---

## State Management

```javascript
// Core application state
{
  activeSection: "playground" | "notebook" | "trial" | "upload" | "editor",
  isAuthenticated: boolean,
  isMenuUnlocked: boolean,
  darkMode: boolean,

  // Playground state
  selectedTopic: string | null,
  selectedSubtopic: string | null,
  selectedPattern: string | null,
  activeQuestion: QuestionId | null,
  reviewQueue: QuestionId[],

  // Notebook state
  activeNote: NoteId | null,
  activeFolder: FolderId | null,
  searchQuery: string,
}
```

---

## Responsive Behavior

| Component | Desktop (1280px+) | Tablet (768px) | Mobile (375px) |
|-----------|-------------------|----------------|----------------|
| Playground | Side-by-side panels | Stacked, collapsible sidebar | Single panel, swipe between |
| Notebook | Sidebar + editor | Drawer sidebar | Single panel |
| FAB Menu | Bottom-right, hover labels | Same | Larger touch targets (56px) |
| Monaco Editor | Full height | Reduced height | Horizontal scroll enabled |

---

## Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Section change | Fade + slide | 300ms |
| Modal open | Scale up + fade | 200ms (spring) |
| FAB menu items | Stagger entrance | 60ms per item |
| Cards | Hover shadow elevation | 200ms |
| Mastery dot | Color pulse on change | 400ms |
| Save confirmation | Check mark + fade | 600ms |
