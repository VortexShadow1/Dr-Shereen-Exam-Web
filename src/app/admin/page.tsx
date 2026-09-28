"use client";

import { useState } from "react";
import type { StudentAttempt } from "@/lib/types";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/results", {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) {
        setError("كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAttempts(data.attempts || []);
      setAuthenticated(true);
    } catch {
      setError("حدث خطأ في الاتصال");
    }
    setLoading(false);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/results", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const data = await res.json();
        setAttempts(data.attempts || []);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <form
          onSubmit={login}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-5"
        >
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">لوحة التحكم</h1>
            <p className="text-sm text-slate-500 mt-1">دكتور شيرين — Admin</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
              autoFocus
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-teal-800 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">لوحة تحكم دكتور شيرين</h1>
            <p className="text-teal-200 text-sm">نتائج الطلاب</p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-600 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {loading ? "جاري التحديث..." : "تحديث"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-slate-500">
          إجمالي المحاولات: <strong>{attempts.length}</strong>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            لا توجد نتائج بعد
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">الاسم</th>
                    <th className="px-4 py-3 font-semibold">رقم الطالب</th>
                    <th className="px-4 py-3 font-semibold">ولي الأمر</th>
                    <th className="px-4 py-3 font-semibold">الدرجة</th>
                    <th className="px-4 py-3 font-semibold">النسبة</th>
                    <th className="px-4 py-3 font-semibold">تبديل</th>
                    <th className="px-4 py-3 font-semibold">الوقت</th>
                    <th className="px-4 py-3 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((a, i) => (
                    <tr
                      key={a.id}
                      className={`hover:bg-slate-50 ${
                        a.flagged ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{a.name}</td>
                      <td className="px-4 py-3 font-mono text-teal-700">
                        {a.id}
                      </td>
                      <td className="px-4 py-3 font-mono" dir="ltr">
                        {a.parentPhone}
                      </td>
                      <td className="px-4 py-3">
                        {a.score}/{a.maxScore}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${
                            a.percentage >= 50
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {a.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {a.tabSwitches > 0 ? (
                          <span className="text-amber-600 font-medium">
                            {a.tabSwitches}
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {Math.floor(a.timeSpentSeconds / 60)}د
                      </td>
                      <td className="px-4 py-3">
                        {a.flagged ? (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                            مشبوه
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                            طبيعي
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-slate-400 text-center">
          كلمة المرور الافتراضية: <code className="bg-slate-100 px-1 rounded">shereen2026</code> — غيّرها عبر متغير البيئة{" "}
          <code className="bg-slate-100 px-1 rounded">ADMIN_PASSWORD</code>
        </p>
      </main>
    </div>
  );
}
