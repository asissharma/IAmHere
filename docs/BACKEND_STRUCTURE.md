# Backend Architecture

**Last Updated**: February 10, 2026

---

## Architecture

```
Client (React)
    ↓ HTTP
Next.js API Routes (pages/api/)
    ↓
MongoDB Atlas  ←→  Supabase Storage
    ↓
Google Gemini AI
```

Single-user personal app. No auth tokens, no session management beyond a simple password check.

---

## API Route Map

### Active Routes (Keep)

```
pages/api/
├── auth.ts               # Password authentication
├── chat.ts               # AI chat (Gemini)
├── notes.ts              # Notebook CRUD
├── getDsaQuestion.ts     # Fetch DSA questions
├── saveDsaAnswer.ts      # Save DSA solutions
├── solvedDsaQuestion.ts  # Update question status
├── dsaProgressBar.ts     # DSA stats/progress
├── smartNotes.ts         # AI-enhanced notes
├── upload.ts             # File upload
├── searchUtil.ts         # Search functionality
├── save.ts               # Generic save
└── lib/                  # Shared utilities
    ├── mongodb.ts         # DB connection
    ├── supabase.ts        # Storage client
    └── gemini.ts          # AI client
```

### Routes to Review/Remove

```
├── tasksManager.ts       # ❌ Tasks feature cut
├── dashboard.ts          # ❌ Dashboard feature cut
├── syllabus.ts           # ❌ Learning Paths cut
├── githubContributions.ts # ❌ GitHub integration deprioritized
├── uploadBooks.ts        # ❌ Audio books cut
├── getBooks.ts           # ❌ Audio books cut
├── markAsCompleted.ts    # ⚠️ Merge into solvedDsaQuestion
├── customDocumentation.ts # ⚠️ Merge into notes
├── getText.ts            # ⚠️ Review if still needed
├── import.ts             # ⚠️ Review
├── uploadData.ts         # ⚠️ Review
├── uploadDataInDB.ts     # ⚠️ Review
├── analyser.ts           # ⚠️ Review
├── logs/                 # ⚠️ Review
```

---

## Database Schema

### MongoDB Atlas (M0 Free Tier — 512 MB)

#### Collection: `dsaQuestions`

The heart of the app. Every question lives here.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | auto | Primary key |
| `topic` | String | ✅ | Top-level topic (Arrays, Trees, Graphs) |
| `subtopic` | String | ✅ | Second level (Two Pointers, Traversal) |
| `pattern` | String | | Pattern tag (Sliding Window, etc.) |
| `question` | String | ✅ | Question title |
| `description` | String | | Full problem statement |
| `difficulty` | String | ✅ | `easy` / `medium` / `hard` |
| `link` | String | | External URL (LeetCode, etc.) |
| `mastery` | String | default: `untouched` | `untouched` / `attempted` / `solved` / `understood` / `mastered` |
| `patterns` | String[] | default: [] | Pattern tags applied |
| `lastPracticed` | Date | | Last time this was worked on |
| `nextReview` | Date | | Spaced repetition: when to review |
| `inlineNotes` | String | | Quick notes on this question |
| `linkedNoteIds` | String[] | default: [] | Links to Notebook notes |
| `timeSpentMinutes` | Number | default: 0 | Cumulative time spent |
| `createdAt` | Date | auto | First added |
| `updatedAt` | Date | auto | Last modified |

**Indexes:**
- `{ topic: 1, subtopic: 1, pattern: 1 }` — taxonomy navigation
- `{ mastery: 1 }` — filter by mastery level
- `{ nextReview: 1 }` — spaced repetition queue
- `{ patterns: 1 }` — pattern-based queries
- `{ difficulty: 1 }` — filter by difficulty

---

#### Collection: `dsaSolutions`

Every version of every solution. This is the version history.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | auto | Primary key |
| `questionId` | ObjectId | ✅ | Reference to `dsaQuestions._id` |
| `code` | String | ✅ | Solution code |
| `language` | String | default: `javascript` | Language used |
| `version` | Number | auto-increment | Version number |
| `timeComplexity` | String | | `O(n)`, `O(n log n)`, etc. |
| `spaceComplexity` | String | | `O(1)`, `O(n)`, etc. |
| `duration` | Number | | Time spent on this version (seconds) |
| `createdAt` | Date | auto | When this version was saved |

**Indexes:**
- `{ questionId: 1, version: -1 }` — get latest or browse versions
- `{ questionId: 1, createdAt: -1 }` — chronological history

---

#### Collection: `notes`

Knowledge vault storage.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | auto | Primary key |
| `title` | String | ✅ | Note title |
| `content` | String | ✅ | Note content (HTML from TipTap) |
| `folderId` | ObjectId | | Parent folder reference |
| `tags` | String[] | default: [] | Tag labels |
| `linkedQuestionIds` | String[] | default: [] | Links to DSA questions |
| `template` | String | | Which template was used |
| `createdAt` | Date | auto | Creation time |
| `updatedAt` | Date | auto | Last save |

**Indexes:**
- `{ title: "text", content: "text" }` — full-text search (MongoDB text index)
- `{ folderId: 1 }` — folder navigation
- `{ tags: 1 }` — tag filtering
- `{ updatedAt: -1 }` — recent notes first

---

#### Collection: `folders`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | auto | Primary key |
| `name` | String | ✅ | Folder name |
| `parentId` | ObjectId | | Parent folder (null = root) |
| `order` | Number | default: 0 | Sort order |
| `color` | String | | Folder color (hex) |
| `createdAt` | Date | auto | Creation time |

**Indexes:**
- `{ parentId: 1, order: 1 }` — tree navigation

---

#### Collection: `dsaPatterns`

Master list of patterns.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | auto | Primary key |
| `name` | String | ✅ | Pattern name |
| `description` | String | | What this pattern is |
| `category` | String | | Grouping (Array, Graph, DP, etc.) |

Seed data:
```javascript
[
  { name: "Two Pointer", category: "Array" },
  { name: "Sliding Window", category: "Array" },
  { name: "Fast & Slow Pointer", category: "Linked List" },
  { name: "Binary Search", category: "Search" },
  { name: "BFS", category: "Graph" },
  { name: "DFS", category: "Graph" },
  { name: "Backtracking", category: "Recursion" },
  { name: "Dynamic Programming", category: "DP" },
  { name: "Greedy", category: "Optimization" },
  { name: "Monotonic Stack", category: "Stack" },
  { name: "Union Find", category: "Graph" },
  { name: "Trie", category: "Tree" },
  { name: "Segment Tree", category: "Tree" },
  { name: "Divide & Conquer", category: "Recursion" },
  { name: "Topological Sort", category: "Graph" },
]
```

---

#### ❌ Removed Collections

| Collection | Was For | Status |
|------------|---------|--------|
| `tasks` | Kanban task manager | ❌ Removed |
| `learningPaths` | Learning path tracking | ❌ Removed |
| `pomodoroSessions` | Focus timer | ❌ Removed |

---

## API Endpoints (Detailed)

### Auth

**POST /api/auth**
```
Request:  { password: string }
Response: { success: true } or 401
```

### DSA Questions

**GET /api/getDsaQuestion**
```
Query: ?topic=Arrays&subtopic=Two%20Pointers&mastery=solved
Response: { questions: [...] }
```

**POST /api/getDsaQuestion** (New: create question)
```
Request: {
  topic, subtopic, pattern, question, difficulty, link, description
}
Response: { success: true, question: {...} }
```

### DSA Solutions

**POST /api/saveDsaAnswer**
```
Request: {
  questionId: string,
  code: string,
  language: string,
  timeComplexity?: string,
  spaceComplexity?: string,
  duration?: number
}
Response: { success: true, solution: {...}, version: number }
```

**GET /api/saveDsaAnswer**
```
Query: ?questionId=xxx
Response: { solutions: [...] }  // All versions, newest first
```

### DSA Status

**POST /api/solvedDsaQuestion** (Renamed: updateDsaStatus)
```
Request: {
  questionId: string,
  mastery: "attempted" | "solved" | "understood" | "mastered",
  patterns?: string[],
  inlineNotes?: string
}
Response: { success: true, nextReview: Date }
```

### DSA Progress

**GET /api/dsaProgressBar**
```
Response: {
  total: number,
  byMastery: { untouched: n, attempted: n, solved: n, understood: n, mastered: n },
  byTopic: { Arrays: { total: n, mastered: n }, ... },
  byPattern: { "Two Pointer": { total: n, solved: n }, ... },
  streak: number,
  reviewDue: number
}
```

### Notes

**GET /api/notes**
```
Query: ?folderId=xxx&tag=dsa&search=binary+search
Response: { notes: [...] }
```

**POST /api/notes**
```
Request: { title, content, folderId?, tags?, linkedQuestionIds?, template? }
Response: { success: true, note: {...} }
```

**PUT /api/notes**
```
Request: { id, title?, content?, folderId?, tags? }
Response: { success: true, note: {...} }
```

**DELETE /api/notes**
```
Query: ?id=xxx
Response: { success: true }
```

### AI Chat

**POST /api/chat**
```
Request: {
  message: string,
  context: {
    questionText?: string,
    userCode?: string,
    language?: string,
    patterns?: string[],
    notes?: string
  },
  command?: "explain" | "optimize" | "edgecases" | "similar" | "hint" | "pseudocode" | "whypattern",
  history?: Array<{ role: string, content: string }>
}
Response: { response: string }
```

### File Upload

**POST /api/upload**
```
Request: Multipart form data
Response: { success: true, file: { filename, url, mimeType } }
```

---

## Database Connection

```typescript
// lib/mongodb.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
```

Usage:
```typescript
const client = await clientPromise;
const db = client.db('iamhere');
const questions = db.collection('dsaQuestions');
```

---

## Spaced Repetition Logic

```typescript
function getNextReviewDate(mastery: string): Date {
  const now = new Date();
  const intervals: Record<string, number[]> = {
    attempted: [1],           // review tomorrow
    solved:    [1, 3, 7],     // 1d, 3d, 7d
    understood: [3, 7, 14],   // 3d, 7d, 14d
    mastered:  [7, 14, 30, 60], // 7d, 14d, 30d, 60d
  };

  // Pick next interval based on consecutive successful reviews
  const days = intervals[mastery]?.[reviewCount] ?? 30;
  now.setDate(now.getDate() + days);
  return now;
}
```

Query for due reviews:
```typescript
const reviewQueue = await db.collection('dsaQuestions')
  .find({
    nextReview: { $lte: new Date() },
    mastery: { $ne: 'untouched' }
  })
  .sort({ nextReview: 1 })
  .toArray();
```

---

## Error Handling

```typescript
// Standard API response pattern
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET' } });
  }

  try {
    const client = await clientPromise;
    const db = client.db('iamhere');
    const data = await db.collection('dsaQuestions').find({}).toArray();
    return res.status(200).json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal error' } });
  }
}
```

---

## Content Limits

| Field | Max |
|-------|-----|
| Note title | 500 chars |
| Note content | 100,000 chars |
| Solution code | 50,000 chars |
| Inline notes | 5,000 chars |
| Question title | 500 chars |
| Question description | 10,000 chars |

---

## AI Integration

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Context-aware prompt building
function buildDSAPrompt(command: string, context: DSAContext): string {
  const base = `You are a DSA expert assistant. The user is working on:
Question: ${context.questionText}
Language: ${context.language}
Patterns: ${context.patterns?.join(', ')}

Their code:
\`\`\`${context.language}
${context.userCode}
\`\`\``;

  const commands: Record<string, string> = {
    explain: `${base}\n\nExplain the approach to solve this problem. Focus on the WHY, not just the HOW.`,
    optimize: `${base}\n\nPoint out inefficiencies and suggest optimizations.`,
    edgecases: `${base}\n\nWhat edge cases could break this solution?`,
    hint: `${base}\n\nGive a subtle hint about the right approach WITHOUT giving the solution.`,
    whypattern: `${base}\n\nExplain why ${context.patterns?.[0]} is the right pattern for this problem.`,
    similar: `${base}\n\nSuggest 3 similar problems that use the same pattern.`,
  };

  return commands[command] || base;
}
```

---

## Supabase Storage

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Upload
const { data } = await supabase.storage.from('uploads').upload(`files/${filename}`, file);

// Get URL
const { data } = supabase.storage.from('uploads').getPublicUrl(`files/${filename}`);
```
