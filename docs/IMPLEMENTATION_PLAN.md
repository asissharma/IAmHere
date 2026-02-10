# Implementation Plan (Final)

## Architecture

```
Homepage (exists) → Playground → Notebook
```

---

## Phase 1: Clean Nav (Week 1)

### Update Home.tsx

**Keep in menuOrder:**
- playground
- notebook
- trial (stays as default, not in menu)
- upload
- editor

**Remove:**
- dashboard
- learningpathsandgoals

**Also:**
- Zero build warnings
- Sanitize innerHTML
- Clean CSS

---

## Phase 2: DSA Playground — Make It One in a Million (Week 2-4)

### 2.1 Question Taxonomy Engine

Not a flat list. A real knowledge tree.

```
Arrays
 ├── Sorting
 │    ├── Quick Sort Problems
 │    └── Merge Sort Problems
 ├── Two Pointers
 │    ├── Opposite Direction
 │    └── Same Direction (Sliding Window)
 └── Binary Search
      ├── Search Space Reduction
      └── Answer Binary Search
```

- Collapsible tree sidebar
- Each node shows completion % and mastery distribution
- One-click to add new topic branches

### 2.2 Mastery System (Not Binary "Solved")

| Level | Meaning | Visual |
|-------|---------|--------|
| ⬜ Untouched | Haven't tried | Gray |
| 🟡 Attempted | Tried, didn't finish | Yellow dot |
| 🟢 Solved | Got it right | Green dot |
| 🔵 Understood | Can explain the WHY | Blue dot |
| 🟣 Mastered | Can solve variants in under 10 min | Purple dot |

- Level selector after saving solution
- Mastery heatmap per topic (like GitHub contributions but for DSA)
- "Decay" — mastery drops after 30 days without revisiting (spaced repetition trigger)

### 2.3 Pattern Recognition System

Patterns are the real skill. Not memorizing problems — recognizing WHICH pattern applies.

**Core Patterns:**
- Two Pointer
- Sliding Window
- Fast & Slow Pointer
- Binary Search
- BFS / DFS
- Backtracking
- Dynamic Programming (Top-down / Bottom-up)
- Greedy
- Stack / Monotonic Stack
- Union Find
- Trie
- Segment Tree
- Divide & Conquer
- Topological Sort

**Features:**
- Tag every solution with 1-3 patterns
- "Pattern View" — see ALL questions grouped by pattern, not topic
- Pattern frequency chart — which patterns you're strong/weak at
- "Similar Problems" — auto-suggest based on shared patterns

### 2.4 Solution Studio

Not just a code editor. A workspace.

**Split Layout:**
```
┌──────────────────────────────────────────────┐
│  Question          │  Monaco Editor          │
│  ─────────         │  ─────────────          │
│  Problem text      │  Your code              │
│  Examples          │                         │
│  Constraints       │                         │
│  ─────────         │  ─────────────          │
│  Hints (AI)        │  Language selector      │
│  Your Notes        │  Ctrl+S to save         │
│  Pattern Tags      │  Version: v3 ▾          │
└──────────────────────────────────────────────┘
```

**Features:**
- **Version Timeline** — every save creates a version, slider to scrub through attempts
- **Diff View** — side-by-side diff between any two versions
- **Time Tracking** — how long you spent on each attempt (auto, not manual)
- **Complexity Annotation** — mark your solution's time/space complexity
- **Multi-language** — save solutions in multiple languages, toggle between them

### 2.5 AI That Actually Helps

Not a generic chatbot. Context-aware assistance.

| Command | What It Does |
|---------|-------------|
| **"Explain"** | Explain the approach, not just the code |
| **"Why This Pattern?"** | Why sliding window and not two pointer? |
| **"Optimize"** | Point out inefficiencies, suggest improvements |
| **"Edge Cases"** | What inputs would break this? |
| **"Similar"** | 3 problems that use the same pattern |
| **"Hint"** | Nudge toward the right pattern without spoiling |
| **"Pseudocode"** | High-level approach before coding |

AI gets full context: question text, your code, your notes, the pattern tags.

### 2.6 Spaced Repetition

The feature nobody builds but everyone needs.

- Questions you marked "Mastered" show up again after 7, 14, 30 days
- Questions you marked "Solved" show up after 3, 7 days
- "Attempted" shows up daily until resolved
- Daily review queue: "You have 5 questions to revisit today"
- Can snooze or re-rate mastery on revisit

### 2.7 Progress Analytics (Inside Playground)

Not a separate dashboard. Built INTO the playground.

- **Topic Mastery Grid** — colored grid showing mastery per topic/subtopic
- **Pattern Strength Radar** — radar chart of pattern proficiency
- **Streak Tracker** — days of consecutive practice
- **Weakness Detector** — "You haven't practiced DP in 12 days"
- **Stats Bar** — always visible: `142 solved | 23 mastered | 🔥 7 day streak`

---

## Phase 3: Notebook — Knowledge Vault (Week 4-5)

### 3.1 Folder System

- Nested folders (unlimited depth)
- Drag-drop reordering
- Folder icons/colors
- "Smart folders" — auto-collect notes by tag

### 3.2 Search That Works

- Full-text fuzzy search (Fuse.js)
- Search by tag, folder, date
- Results show preview snippet with match highlighted
- `Ctrl+K` to open search from anywhere

### 3.3 Tagging System

- Create custom tags
- Multi-tag notes
- Filter by tag
- Tag cloud visualization

### 3.4 DSA ↔ Notebook Integration

This is the glue. This is what makes it unique.

- **From Playground**: "Create Note" button on any question → pre-filled with question title, your code, your approach
- **From Notebook**: `[[DSA: Two Sum]]` link syntax → click to jump to that DSA question
- **Sidebar Widget**: when viewing a DSA question, see all linked notes
- **When revisiting**: your notes appear alongside the question

### 3.5 Templates

Pre-built note templates:

| Template | Contents |
|----------|----------|
| **DSA Approach** | Pattern, Intuition, Steps, Complexity, Code |
| **Topic Summary** | Key Concepts, Common Patterns, Mistakes |
| **Interview Prep** | Company, Role, Topics, Questions, Notes |
| **Debug Log** | Problem, What I Tried, What Worked, Lesson |

### 3.6 Markdown Export

- Export single note as `.md`
- Export folder as zip of `.md` files
- Copy as markdown to clipboard

---

## Phase 4: Mobile (Week 5-6)

Not just "it doesn't break on mobile." Actually usable.

### What Needs Fixing
- Homepage sections need responsive grid
- Playground editor needs mobile layout (question top, editor bottom)
- Notebook needs responsive sidebar (drawer pattern)
- FAB needs proper touch targets (56px minimum)
- Text needs to be readable without zooming

### Test
- iPhone SE (375px)
- iPad (768px)
- Desktop (1280px+)

---

## Phase 5: Polish & Ship (Week 6-7)

### Dependency Cleanup
Remove: `@lexical/react`, `react-quill`, `quill`, `chart.js`, `react-chartjs-2`, `d3`, `konva`, `react-konva`, `three`, `epub2`, `tesseract.js`

### Performance
- Lazy load Monaco (it's heavy)
- Code split Playground and Notebook
- Lighthouse > 80

### Deploy
- Production build
- Update README with real screenshots
- Verify Vercel env vars

---

## New Features to Build (After Core is Solid)

These are NOT bloat. These are features that directly enhance the two core pillars.

### For DSA Playground

| Feature | Why It Matters | Effort |
|---------|---------------|--------|
| **Contest Mode** | Timed practice with random questions from weak patterns | Medium |
| **Code Templates** | Start with boilerplate per language (class Solution, etc.) | Low |
| **Test Case Runner** | Write input/output pairs, validate locally | High |
| **Company Tags** | Tag questions by company (Google, Amazon, etc.) | Low |
| **Interview Simulator** | Random question + 45 min timer + no AI | Medium |
| **Daily Challenge** | Auto-pick one question from your weak areas each day | Medium |
| **Solution Sharing** | Export your solution + notes as a clean markdown/image | Low |
| **Keyboard Shortcuts** | Ctrl+S save, Ctrl+Enter next question, Ctrl+H hints | Low |

### For Notebook

| Feature | Why It Matters | Effort |
|---------|---------------|--------|
| **Graph View** | Visualize connections between notes (like Obsidian) | High |
| **Backlinks Panel** | See all notes that link to current note | Medium |
| **Daily Note** | Auto-create a dated note for daily learnings | Low |
| **Code Execution** | Run code blocks inside notes (sandboxed) | High |
| **PDF/Image Embed** | Attach references directly in notes | Medium |
| **Revision History** | See past versions of any note | Medium |
| **Collaboration-ready** | Exportable format that works with Obsidian/Notion | Low |

### For the Platform

| Feature | Why It Matters | Effort |
|---------|---------------|--------|
| **Global Cmd+K** | Quick launcher for ANY action (search, navigate, create) | Medium |
| **Keyboard-First UX** | Navigate entire app without mouse | Medium |
| **Data Export** | Export everything as JSON/Markdown for portability | Low |
| **Offline Mode (PWA)** | Practice without internet | High |
| **Theme Engine** | Custom editor themes, UI theme toggle beyond dark/light | Medium |

---

## Success Criteria

1. ✅ Only needed sections in FAB
2. ✅ DSA has: hierarchy, mastery, patterns, versions, notes, spaced repetition, AI
3. ✅ Notebook has: folders, search, tags, DSA links, templates
4. ✅ Homepage unchanged (already good)
5. ✅ Mobile works (need to make it the best possible, currently it's gibberish)
6. ✅ Clean build
7. ✅ Feels like a tool built BY a developer, not a tutorial project
