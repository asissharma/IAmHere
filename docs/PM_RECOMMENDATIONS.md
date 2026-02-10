# PM Recommendations (Final)

## The Decision

**Cut everything except:**
1. DSA Playground
2. Notebook

**Homepage = Portfolio. That's the overview. No separate dashboard.**

---

## Kill List

| Feature | Status |
|---------|--------|
| Dashboard | ❌ KILL - Homepage is sufficient |
| Learning Paths | ❌ KILL - Use Notebook folders |
| Task Manager | ❌ KILL - Use Todoist |
| Pomodoro Timer | ❌ KILL - Use timer apps |
| Text Editor | ❌ KILL - Merged into Notebook |
| Audio Books | ❌ KILL - Out of scope |
| Stealth Mode | ❌ KILL - Maybe v3 |
| File Upload | ⚠️ MINIMAL - Only for DSA assets |

---

## Focus List

| Feature | Target State |
|---------|-------------|
| **DSA Playground** | Topic hierarchy, mastery levels, pattern tags, version history, inline notes |
| **Notebook** | Folders, search, DSA integration, bi-directional links |
| **Homepage** | Already done. No changes. |

---

## DSA Playground Vision

| Aspect | Current | Target |
|--------|---------|--------|
| Organization | Flat list | Topic → Subtopic → Pattern |
| Status | Solved/Not | 4 mastery levels |
| Patterns | None | Tag every solution |
| History | None | Full version diffs |
| Notes | Separate | Inline per question |

---

## Notebook Vision

| Feature | Priority |
|---------|----------|
| Folders | P0 |
| Search | P0 |
| DSA linking | P1 |
| Bi-directional links | P1 |

---

## Action Plan

### Week 1
- Remove Dashboard, Learning Paths, Task Manager, Pomodoro from nav
- Clean build

### Week 2-3
- DSA Playground: taxonomy, mastery, patterns, versions

### Week 4
- Notebook: folders, search

### Week 5
- Polish, mobile, deploy

---

## Dependencies to Remove

```
@lexical/react, react-quill, quill
chart.js, react-chartjs-2, d3
konva, react-konva, three
epub2, tesseract.js
```

## Dependencies to Keep

```
@tiptap/* - Notebook
@monaco-editor/react - DSA
framer-motion - Animations
recharts - Minimal charts if needed
mongodb, mongoose - Database
@google/generative-ai - AI
```

---

## What NOT to Do

1. Don't add Dashboard back
2. Don't add Task Manager
3. Don't add Pomodoro
4. Don't add new features until DSA Playground is exceptional
5. Don't chase feature parity with anything
