export interface DSAQuestion {
    _id: string;
    sno: number;
    topic: string;
    subtopic: string;
    pattern: string;
    problem: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    link: string;
    isSolved: boolean;
    solvedBy: string;
    code?: string;
    mastery: 'untouched' | 'attempted' | 'solved' | 'understood' | 'mastered';
    patterns: string[];
    lastPracticed?: string;
    nextReview?: string;
    inlineNotes?: string;
    linkedNoteIds: string[];
    timeSpentMinutes: number;
}

export interface DSASolution {
    _id: string;
    questionId: string;
    code: string;
    language: string;
    version: number;
    timeComplexity?: string;
    spaceComplexity?: string;
    duration?: number;
    createdAt: string;
}

export interface DSATree {
    [topic: string]: {
        [subtopic: string]: {
            [pattern: string]: DSAQuestion[];
        };
    };
}

export interface DSAStats {
    easy: number;
    medium: number;
    hard: number;
    totalSolved: number;
    totalQuestions: number;
    mastery: {
        untouched: number;
        attempted: number;
        solved: number;
        understood: number;
        mastered: number;
    };
}
