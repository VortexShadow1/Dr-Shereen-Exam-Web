"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ExamResult {
  id: string;
  name: string;
  parentPhone: string;
  score: number;
  maxScore: number;
  percentage: number;
  tabSwitches: number;
  flagged: boolean;
  timeSpentSeconds: number;
  finishedAt: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("examResult");
    if (!raw) {
      router.replace("/");
      return;
    }
    setResult(JSON.parse(raw));
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">جاري تحميل النتيجة...</div>
      </div>
    );
  }

  const minutes = Math.floor(result.timeSpentSeconds / 60);
  const seconds = result.timeSpentSeconds % 60;
  const isPass = result.percentage >= 50;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-teal-700 text-white py-5 shadow">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">نتيجة الامتحان</h1>
          <p className="text-teal-100 text-sm mt-1">دكتور شيرين</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Score circle */}
            <div
              className={`py-10 text-center ${
                isPass
                  ? "bg-gradient-to-b from-emerald-50 to-white"
                  : "bg-gradient-to-b from-red-50 to-white"
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${
                  isPass
                    ? "border-emerald-400 text-emerald-700"
                    : "border-red-300 text-red-600"
                }`}
              >
                <div>
                  <div className="text-4xl font-extrabold">{result.percentage}%</div>
                  <div className="text-xs font-medium opacity-70">النسبة</div>
                </div>
              </div>
              <p
                className={`mt-4 text-lg font-bold ${
                  isPass ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {isPass ? "مبروك! نجحت" : "حاول مرة أخرى"}
              </p>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 rounded-xl py-3">
                  <div className="text-2xl font-bold text-slate-800">
                    {result.score}
                  </div>
                  <div className="text-xs text-slate-500">الدرجة</div>
                </div>
                <div className="bg-slate-50 rounded-xl py-3">
                  <div className="text-2xl font-bold text-slate-800">
                    {result.maxScore}
                  </div>
                  <div className="text-xs text-slate-500">من أصل</div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">الاسم</span>
                  <span className="font-semibold">{result.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الطالب</span>
                  <span className="font-mono font-semibold text-teal-700">
                    {result.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم ولي الأمر</span>
                  <span className="font-mono" dir="ltr">
                    {result.parentPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الوقت المستغرق</span>
                  <span>
                    {minutes} د : {seconds.toString().padStart(2, "0")} ث
                  </span>
                </div>
                {result.tabSwitches > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>تبديل التبويبات</span>
                    <span className="font-semibold">{result.tabSwitches}</span>
                  </div>
                )}
                {result.flagged && (
                  <div className="bg-red-50 text-red-700 text-center py-2 rounded-lg text-xs font-medium">
                    تم وضع علامة على هذه المحاولة بسبب تجاوز حد الغش
                  </div>
                )}
              </div>

              <Link
                href="/"
                className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition mt-4"
              >
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        دكتور شيرين — {new Date().getFullYear()}
      </footer>
    </div>
  );
}
