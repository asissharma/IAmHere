# Product Requirements Document (PRD)

## 1. Product Overview

- **Project**: IAmHere — Personal Developer Hub
- **Version**: 2.0
- **Last Updated**: February 10, 2026
- **Owner**: Asis Sharma

---

## 2. What Is This?

Two things. Not three. Not seven. Two.

```
Homepage (Portfolio) → already exists, already good
         ↓
┌──────────────────────────────────────┐
│  DSA Playground — Coding Dojo       │  ← HERO
│  Notebook — Knowledge Vault         │  ← CORE
└──────────────────────────────────────┘
```

Homepage is the portfolio landing page. It exists. It works. No dashboard needed on top of it.

---

## 3. Why This Exists

Every DSA platform is the same: question left, editor right, submit. Binary — solved or not.

**What they all miss:**

| Gap | Why It Matters |
|-----|---------------|
| No pattern awareness | You solve 50 problems but can't recognize a pattern in a new one |
| No mastery tracking | "Solved" doesn't mean "understood" — you'll forget in 2 weeks |
| No version history | You can't look back at how your thinking evolved |
| Notes are separate | The insight is disconnected from the code |
| No spaced repetition | You solved it once 3 months ago, now it's gone |

IAmHere fixes all of that.

---

## 4. Goals

| Goal | Metric | Target |
|------|--------|--------|
| Deep DSA mastery | Questions at "Mastered" level | 200+ |
| Pattern recognition | Patterns tagged per question | 100% coverage |
| Knowledge vault | Searchable, linked notes | 100+ notes |
| Consistency | Daily practice streak | 30+ days |
| Premium feel | Personal satisfaction | "I built this for me" |

---

## 5. Features

### 🔥 DSA Playground (Hero Feature)

Not a LeetCode clone. A personal coding dojo.

#### Question Taxonomy

```
Topic (Arrays, Trees, Graphs...)
  └── Subtopic (Two Pointers, Traversal...)
       └── Pattern (Sliding Window, Fast & Slow...)
            └── Questions
```

Every question lives in a hierarchy. You don't just solve problems — you recognize which pattern applies and WHY.

#### Mastery System

| Level | Meaning | Visual | Decay |
|-------|---------|--------|-------|
| ⬜ Untouched | Never attempted | Gray | — |
| 🟡 Attempted | Tried, incomplete | Yellow | — |
| 🟢 Solved | Got accepted answer | Green | 14 days |
| 🔵 Understood | Can explain the approach | Blue | 30 days |
| 🟣 Mastered | Can solve variants under pressure | Purple | 60 days |

Mastery **decays**. If you haven't revisited a "Mastered" question in 60 days, it drops back to "Understood". This drives spaced repetition.

#### Solution Studio

```
┌──────────────────────────────────────────────┐
│  Question Panel      │  Monaco Editor        │
│  ───────────         │  ─────────────        │
│  Problem statement   │  Your solution        │
│  Examples            │                       │
│  Constraints         │  Language: JS ▾       │
│  ───────────         │  Version: v3 ◀ ▶      │
│  Pattern tags        │  Time: 23 min         │
│  Mastery: 🔵         │  Complexity: O(n)     │
│  ───────────         │  ─────────────        │
│  Inline Notes        │  Ctrl+S to save       │
│  AI Panel (toggle)   │                       │
└──────────────────────────────────────────────┘
```

Features:
- **Version timeline** — every save is a version, scrub through attempts
- **Diff view** — compare any two versions side-by-side
- **Time tracking** — auto-tracked per session, not manual
- **Complexity annotation** — mark your solution's Big-O
- **Multi-language** — save solutions in JS, Python, Java, C++

#### Pattern System

15+ core patterns:

```
Two Pointer · Sliding Window · Fast & Slow · Binary Search
BFS · DFS · Backtracking · Dynamic Programming
Greedy · Stack/Monotonic Stack · Union Find · Trie
Segment Tree · Divide & Conquer · Topological Sort
```

- Tag every solution with 1-3 patterns
- "Pattern View" — browse ALL questions grouped by pattern
- Pattern strength radar — which patterns are you weak at?
- "Similar Problems" — auto-suggest based on shared patterns

#### Context-Aware AI

| Command | What It Does |
|---------|-------------|
| Explain | Explain the approach, not the code |
| Why This Pattern? | Why sliding window and not two pointer? |
| Optimize | Point out inefficiencies |
| Edge Cases | What inputs would break this? |
| Similar | 3 problems that use the same pattern |
| Hint | Nudge toward the pattern without spoiling |
| Pseudocode | High-level approach before coding |

AI gets full context: question text, your code, your notes, the pattern tags.

#### Spaced Repetition

- Mastered → review after 7, 14, 30, 60 days
- Understood → review after 3, 7, 14 days
- Solved → review after 1, 3, 7 days
- Attempted → daily until resolved
- "You have 5 questions to revisit today"

#### In-Playground Analytics

Not a separate dashboard. Embedded in the playground itself.

- Topic mastery grid (colored cells per topic × mastery level)
- Pattern strength radar chart
- Streak counter (always visible)
- Weakness detector: "You haven't practiced DP in 12 days"
- Stats bar: `142 solved | 23 mastered | 🔥 7 day streak`

---

### 📓 Notebook (Core Feature)

Your knowledge vault. Not "notes" — a second brain for DSA and development.

#### Folders + Tags

- Nested folders (unlimited depth)
- Multi-tag notes
- Smart folders (auto-collect by tag)
- Drag-drop reordering

#### Search

- Full-text fuzzy search (Fuse.js)
- Filter by tag, folder, date
- `Ctrl+K` to search from anywhere
- Highlighted match previews

#### DSA ↔ Notebook Integration

This is the glue. This is what makes IAmHere unique.

- **From Playground**: "Create Note" → pre-filled with question, code, approach
- **From Notebook**: `[[DSA: Two Sum]]` → click to jump to DSA question
- **In Playground sidebar**: see all linked notes for current question
- **On revisit**: your notes appear alongside the question automatically

#### Templates

| Template | Pre-filled Structure |
|----------|---------------------|
| DSA Approach | Pattern, Intuition, Steps, Complexity, Code |
| Topic Summary | Key Concepts, Common Patterns, Common Mistakes |
| Interview Prep | Company, Role, Topics to Cover, Questions |
| Debug Log | Problem, What I Tried, What Worked, Lesson |

#### Export

- Single note → `.md` file
- Folder → `.zip` of markdown files
- Copy as markdown to clipboard

---

### 🏠 Homepage

Exists. Works. No changes needed. It's the portfolio landing page and entry point to Playground and Notebook.

---

## 6. Removed Features

| Feature | Status | Reason |
|---------|--------|--------|
| Dashboard | ❌ CUT | Homepage is the overview |
| Learning Paths | ❌ CUT | Notebook folders do this better |
| Task Manager | ❌ CUT | Use Todoist |
| Pomodoro Timer | ❌ CUT | Use any timer app |
| Text Editor | ❌ CUT | Merged into Notebook |
| Audio Books | ❌ CUT | Out of scope |
| Stealth Mode | ❌ CUT | Maybe v3 |

---

## 7. Future Features (After Core Is Exceptional)

### For Playground

| Feature | Value | Effort |
|---------|-------|--------|
| Contest Mode | Timed practice from weak patterns | Medium |
| Interview Simulator | Random question + 45 min + no AI | Medium |
| Daily Challenge | Auto-pick from weak areas | Medium |
| Company Tags | Tag by Google, Amazon, etc. | Low |
| Code Templates | Language boilerplate | Low |
| Solution Sharing | Export as clean markdown/image | Low |
| Test Case Runner | Validate solutions locally | High |

### For Notebook

| Feature | Value | Effort |
|---------|-------|--------|
| Graph View | Visualize note connections | High |
| Backlinks Panel | See all notes linking to current | Medium |
| Daily Note | Auto-create dated note | Low |
| Revision History | Past versions of any note | Medium |
| Code Execution | Run code blocks in notes | High |

### For Platform

| Feature | Value | Effort |
|---------|-------|--------|
| Global `Cmd+K` | Quick launcher for everything | Medium |
| Keyboard-First UX | Navigate without mouse | Medium |
| Data Export | Everything as JSON/Markdown | Low |
| Offline PWA | Practice without internet | High |
| Theme Engine | Custom themes beyond dark/light | Medium |

---

## 8. User Scenarios

### Morning DSA Session

1. Open IAmHere → Homepage loads
2. Click Playground → Auth → DSA Dojo
3. "5 questions need review" → spaced repetition queue
4. Pick first: "Sliding Window Maximum" — marked 🔵 last month
5. Remember the approach, solve in 8 minutes
6. Re-mark as 🟣 Mastered
7. Pick next from the queue
8. Notice a pattern weakness → "DP: 3/20 mastered"
9. Open a DP question, struggle, use AI hint: "Think about subproblems"
10. Solve it, tag as "Memoization", write inline note about the insight
11. Create full Notebook note: "When to use Top-Down vs Bottom-Up"
12. 45 minutes done. `Stats: 🔥 12 day streak | 156 solved | 28 mastered`

### Deep Dive Learning

1. Studying "Graph Algorithms" topic in Playground
2. See subtopics: BFS, DFS, Dijkstra, Topological Sort
3. Work through 5 BFS problems
4. Notice pattern: "BFS is for shortest path in unweighted graphs"
5. Create Notebook note: "Graph Algorithm Selection Guide"
6. Link note to all 5 BFS questions
7. Later, when revisiting a BFS problem, the note appears in sidebar

---

## 9. Constraints

| Constraint | Limit | Mitigation |
|------------|-------|------------|
| MongoDB Atlas | 512 MB free | Efficient schemas, no bloat |
| image uploader | 1 GB storage | upload files only |
| Gemini API | Rate limited | Throttle, cache responses |
| Vercel | Hobby tier | Sufficient for personal use |
| Solo developer | One person | Two features, not ten |

---

## 10. Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| Performance | Page load < 3s, editor input < 100ms |
| Security | DOMPurify, no eval(), env vars secured |
| Accessibility | WCAG AA, keyboard navigable |
| Mobile | Usable on 375px (not just "doesn't break") |
| Build | Zero warnings, zero errors |
