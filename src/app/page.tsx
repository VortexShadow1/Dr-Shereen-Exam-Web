"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const phone = parentPhone.trim().replace(/\s/g, "");

    if (trimmedName.length < 3) {
      setError("من فضلك اكتب الاسم الكامل (3 أحرف على الأقل)");
      return;
    }
    if (!/^01[0125][0-9]{8}$/.test(phone)) {
      setError("رقم ولي الأمر غير صحيح. يجب أن يكون رقم مصري يبدأ بـ 01");
      return;
    }

    setLoading(true);

    try {
      // Store in sessionStorage so exam page can pick it up
      sessionStorage.setItem(
        "studentInfo",
        JSON.stringify({ name: trimmedName, parentPhone: phone })
      );
      router.push("/exam");
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              دكتور شيرين
            </h1>
            <p className="text-teal-100 text-sm mt-0.5">منصة الامتحانات الآمنة</p>
          </div>
          <div className="hidden sm:block text-left text-sm text-teal-100">
            <a
              href="mailto:vortexshadow.dev@gmail.com"
              className="hover:text-white transition"
            >
              vortexshadow.dev@gmail.com
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-l from-teal-600 to-teal-700 px-6 py-5 text-white">
              <h2 className="text-xl font-bold">تسجيل الدخول للامتحان</h2>
              <p className="text-teal-100 text-sm mt-1">
                اكتب بياناتك بدقة قبل البدء
              </p>
            </div>

            <form onSubmit={handleStart} className="p-6 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  اسم الطالب الكامل
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-base"
                  autoComplete="name"
                  dir="rtl"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  رقم ولي الأمر (موبايل)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-base"
                  dir="ltr"
                  inputMode="numeric"
                />
                <p className="text-xs text-slate-400 mt-1">
                  رقم مصري صحيح (يبدأ بـ 010 / 011 / 012 / 015)
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-3.5 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {loading ? "جاري التحضير..." : "ابدأ الامتحان"}
              </button>
            </form>
          </div>

          {/* Rules */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="text-lg">⚠️</span> تعليمات هامة قبل البدء
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-amber-800">
              <li>ممنوع استخدام أي أدوات ذكاء اصطناعي أو مساعدة خارجية</li>
              <li>ممنوع فتح تبويبات أخرى أو تطبيقات أثناء الامتحان</li>
              <li>سيتم تسجيل أي محاولة غش (تبديل التبويب / النسخ)</li>
              <li>الوقت محدد — عند انتهاء الوقت يتم التسليم تلقائياً</li>
              <li>بعد التسليم ستظهر نتيجتك فوراً</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        <p>
          منصة دكتور شيرين © {new Date().getFullYear()} — تطوير{" "}
          <a
            href="mailto:vortexshadow.dev@gmail.com"
            className="text-teal-600 hover:underline"
          >
            vortexshadow.dev
          </a>
        </p>
      </footer>
    </div>
  );
}
