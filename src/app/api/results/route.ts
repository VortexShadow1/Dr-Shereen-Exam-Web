import { NextRequest, NextResponse } from "next/server";
import { getAttemptsStore } from "@/lib/exam-data";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "shereen2026";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = getAttemptsStore();
  // Return sorted by newest first
  const sorted = [...store].sort(
    (a, b) =>
      new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
  );

  return NextResponse.json({ attempts: sorted });
}
