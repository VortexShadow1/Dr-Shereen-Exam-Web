"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  disableCopyPasteAndContextMenu,
  requestExamFullscreen,
  shuffleArray,
} from "@/lib/anti-cheat";
import { examData, generateStudentId } from "@/lib/exam-data";
import type { Question } from "@/lib/types";

interface StudentInfo {
  name: string;
  parentPhone: string;
}

interface ShuffledQuestion extends Question {
  originalOptions: string[];
  optionMap: number[]; // displayed index -> original index
}

export default function ExamPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [studentId, setStudentId] = useState("");
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  // answers: displayed option index (before mapping)
  const [answers, setAnswers] = useState<Record<string, number>>({});
  // locked questions cannot be changed
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  // temporary selection before confirm
  const [pending, setPending] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState("");
  const submittedRef = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("studentInfo");
    if (!raw) {
      router.replace("/");
      return;
    }
    const info: StudentInfo = JSON.parse(raw);
    setStudent(info);
    setStudentId(generateStudentId());

    let qs = [...examData.questions];
    if (examData.config.shuffleQuestions) qs = shuffleArray(qs);

    const prepared: ShuffledQuestion[] = qs.map((q) => {
      if (!examData.config.shuffleOptions) {
        return {
          ...q,
          originalOptions: q.options,
          optionMap: q.options.map((_, i) => i),
        };
      }
      const indices = q.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      return {
        ...q,
        options: shuffledIndices.map((i) => q.options[i]),
        originalOptions: q.options,
        optionMap: shuffledIndices,
      };
    });

    setQuestions(prepared);
    setTimeLeft(examData.config.durationMinutes * 60);
    setStartedAt(new Date());

    const cleanup = disableCopyPasteAndContextMenu();
    requestExamFullscreen();
    return cleanup;
  }, [router]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || !startedAt) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  // Tab switch detection
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && !submittedRef.current) {
        setTabSwitches((c) => {
          const next = c + 1;
          if (next >= examData.config.maxTabSwitches) {
            setWarning(
              `تم تجاوز الحد المسموح من تبديل التبويبات (${examData.config.maxTabSwitches}). سيتم تسليم الامتحان.`
            );
            setTimeout(() => handleSubmit(true), 1500);
          } else {
            setWarning(
              `تحذير: تم رصد تبديل التبويب (${next}/${examData.config.maxTabSwitches}). المزيد قد يؤدي لتسليم تلقائي.`
            );
          }
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset pending when changing question
  useEffect(() => {
    setPending(null);
  }, [currentIndex]);

  const current = questions[currentIndex];
  const isLocked = current ? !!locked[current.id] : false;
  const confirmedAnswer = current ? answers[current.id] : undefined;

  // Is the confirmed answer correct? (map back to original)
  const isCorrect =
    current && confirmedAnswer !== undefined
      ? current.optionMap[confirmedAnswer] === current.correctIndex
      : null;

  const handleSelectPending = (idx: number) => {
    if (isLocked) return;
    setPending(idx);
  };

  const handleConfirm = () => {
    if (pending === null || !current || isLocked) return;
    setAnswers((prev) => ({ ...prev, [current.id]: pending }));
    setLocked((prev) => ({ ...prev, [current.id]: true }));
    setPending(null);
  };

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submittedRef.current || !student || !startedAt) return;
      submittedRef.current = true;
      setSubmitting(true);

      const mappedAnswers: Record<string, number> = {};
      questions.forEach((q) => {
        const displayed = answers[q.id];
        if (displayed !== undefined) {
          mappedAnswers[q.id] = q.optionMap[displayed];
        }
      });

      let score = 0;
      let maxScore = 0;
      questions.forEach((q) => {
        maxScore += q.points;
        if (mappedAnswers[q.id] === q.correctIndex) score += q.points;
      });

      const finishedAt = new Date();
      const timeSpentSeconds = Math.round(
        (finishedAt.getTime() - startedAt.getTime()) / 1000
      );
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const flagged = tabSwitches >= examData.config.maxTabSwitches;

      const payload = {
        id: studentId,
        name: student.name,
        parentPhone: student.parentPhone,
        answers: mappedAnswers,
        score,
        maxScore,
        percentage,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        tabSwitches,
        flagged,
        timeSpentSeconds,
        autoSubmit: auto,
      };

      try {
        await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        /* continue */
      }

      sessionStorage.setItem("examResult", JSON.stringify(payload));
      sessionStorage.removeItem("studentInfo");
      router.replace("/results");
    },
    [student, studentId, answers, questions, startedAt, tabSwitches, router]
  );

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!student || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-lg">جاري تحميل الامتحان...</div>
      </div>
    );
  }

  const lockedCount = Object.keys(locked).length;
  const progress = Math.round((lockedCount / questions.length) * 100);
  const allLocked = lockedCount === questions.length;

  return (
    <div className="min-h-screen bg-slate-100 no-select relative">
      {/* Watermark */}
      <div className="exam-watermark" aria-hidden>
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} className="rotate-[-25deg] m-8 text-slate-800">
            {studentId} — {student.name}
          </span>
        ))}
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-teal-800 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm">
            <span className="font-bold">{student.name}</span>
            <span className="mx-2 opacity-60">|</span>
            <span className="font-mono text-teal-200">{studentId}</span>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`font-mono text-lg font-bold tabular-nums ${
                timeLeft <= 60 ? "text-red-300 animate-pulse" : ""
              }`}
            >
              ⏱ {formatTime(timeLeft)}
            </div>
            <div className="text-sm bg-teal-900/50 px-3 py-1 rounded-full">
              {lockedCount}/{questions.length}
            </div>
          </div>
        </div>
        <div className="h-1 bg-teal-900">
          <div
            className="h-full bg-teal-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {warning && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium z-30 relative">
          {warning}
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                سؤال {currentIndex + 1} من {questions.length}
              </span>
              <span className="text-xs text-slate-400">{current.points} درجة</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-800 leading-relaxed">
              {current.text}
            </h2>
          </div>

          {/* Feedback after lock */}
          {isLocked && isCorrect !== null && (
            <div
              className={`mx-6 mt-3 px-4 py-3 rounded-xl text-sm font-bold ${
                isCorrect
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {isCorrect ? "✓ إجابة صحيحة" : "✗ إجابة خاطئة — لا يمكن التعديل"}
            </div>
          )}

          <div className="px-6 py-5 space-y-3">
            {current.options.map((opt, idx) => {
              const isPending = pending === idx;
              const isConfirmed = confirmedAnswer === idx;
              const showAsCorrect =
                isLocked && current.optionMap[idx] === current.correctIndex;
              const showAsWrong = isLocked && isConfirmed && !isCorrect;

              let cls =
                "w-full text-right px-5 py-4 rounded-xl border-2 transition-all text-base ";

              if (isLocked) {
                if (showAsCorrect) {
                  cls +=
                    "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
                } else if (showAsWrong) {
                  cls += "border-red-400 bg-red-50 text-red-800";
                } else {
                  cls += "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
                }
              } else if (isPending) {
                cls +=
                  "border-teal-500 bg-teal-50 text-teal-900 font-medium shadow-sm";
              } else {
                cls +=
                  "border-slate-200 hover:border-teal-300 hover:bg-slate-50 text-slate-700 cursor-pointer";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPending(idx)}
                  disabled={isLocked}
                  className={cls}
                >
                  <span className="inline-flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 ${
                        isPending || isConfirmed
                          ? isLocked && showAsCorrect
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : isLocked && showAsWrong
                            ? "border-red-400 bg-red-400 text-white"
                            : "border-teal-500 bg-teal-500 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {isPending || isConfirmed
                        ? isLocked
                          ? showAsCorrect
                            ? "✓"
                            : showAsWrong
                            ? "✗"
                            : "✓"
                          : "✓"
                        : ["أ", "ب", "ج", "د", "هـ", "و"][idx] || idx + 1}
                    </span>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Confirm button */}
          {!isLocked && (
            <div className="px-6 pb-4">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending === null}
                className="w-full py-3 rounded-xl font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed bg-teal-600 hover:bg-teal-700"
              >
                {pending === null
                  ? "اختر إجابة ثم اضغط تأكيد"
                  : "تأكيد الإجابة (لن تتمكن من التعديل)"}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium disabled:opacity-40 hover:bg-white transition"
            >
              السابق
            </button>

            <div className="flex gap-1.5 flex-wrap justify-center">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                    i === currentIndex
                      ? "bg-teal-600 text-white"
                      : locked[q.id]
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                }
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition"
              >
                التالي
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting || !allLocked}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 transition"
                title={!allLocked ? "يجب تأكيد كل الإجابات أولاً" : ""}
              >
                {submitting
                  ? "جاري التسليم..."
                  : allLocked
                  ? "تسليم الامتحان"
                  : "أكد كل الإجابات أولاً"}
              </button>
            )}
          </div>
        </div>

        {allLocked && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="text-emerald-700 font-semibold underline hover:text-emerald-900"
            >
              أكدت كل الأسئلة — اضغط هنا للتسليم النهائي
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
