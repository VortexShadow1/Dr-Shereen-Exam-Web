export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number; // 0-based
  points: number;
}

export interface ExamConfig {
  title: string;
  durationMinutes: number;
  maxTabSwitches: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface StudentAttempt {
  id: string; // auto generated e.g. DR-2026-0001
  name: string;
  parentPhone: string;
  answers: Record<string, number>; // questionId -> selected option index
  score: number;
  maxScore: number;
  percentage: number;
  startedAt: string;
  finishedAt: string;
  tabSwitches: number;
  flagged: boolean;
  timeSpentSeconds: number;
}

export interface ExamData {
  config: ExamConfig;
  questions: Question[];
}
