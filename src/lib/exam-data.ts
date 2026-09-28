import { ExamData } from "./types";

// ============================================
// غيّر الأسئلة من هنا فقط
// correctIndex يبدأ من 0 (أول اختيار = 0)
// ============================================

export const examData: ExamData = {
  config: {
    title: "امتحان تجريبي - دكتور شيرين",
    durationMinutes: 30,
    maxTabSwitches: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
  },
  questions: [
    {
      id: "q1",
      text: "ما هو العاصمة الرسمية لجمهورية مصر العربية؟",
      options: ["الإسكندرية", "القاهرة", "الجيزة", "أسوان"],
      correctIndex: 1,
      points: 2,
    },
    {
      id: "q2",
      text: "كم عدد محافظات مصر تقريباً؟",
      options: ["20", "27", "30", "35"],
      correctIndex: 1,
      points: 2,
    },
    {
      id: "q3",
      text: "أي من التالي يعتبر من أكبر الأنهار في العالم؟",
      options: ["نهر النيل", "نهر الأمازون", "نهر المسيسيبي", "نهر اليانغتسي"],
      correctIndex: 0,
      points: 2,
    },
    {
      id: "q4",
      text: "في أي سنة افتتح مترو أنفاق القاهرة؟",
      options: ["1980", "1987", "1990", "1995"],
      correctIndex: 1,
      points: 2,
    },
    {
      id: "q5",
      text: "ما اسم أطول نهر في أفريقيا؟",
      options: ["نهر الكونغو", "نهر الزمبيزي", "نهر النيل", "نهر النيجر"],
      correctIndex: 2,
      points: 2,
    },
  ],
};

declare global {
  // eslint-disable-next-line no-var
  var __attemptsStore: import("./types").StudentAttempt[] | undefined;
}

export function getAttemptsStore(): import("./types").StudentAttempt[] {
  if (!global.__attemptsStore) {
    global.__attemptsStore = [];
  }
  return global.__attemptsStore;
}

export function generateStudentId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DR-${year}-${rand}`;
}
