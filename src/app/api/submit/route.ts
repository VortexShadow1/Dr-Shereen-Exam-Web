import { NextRequest, NextResponse } from "next/server";
import { getAttemptsStore } from "@/lib/exam-data";
import type { StudentAttempt } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const attempt: StudentAttempt = {
      id: body.id,
      name: body.name,
      parentPhone: body.parentPhone,
      answers: body.answers || {},
      score: body.score ?? 0,
      maxScore: body.maxScore ?? 0,
      percentage: body.percentage ?? 0,
      startedAt: body.startedAt,
      finishedAt: body.finishedAt,
      tabSwitches: body.tabSwitches ?? 0,
      flagged: body.flagged ?? false,
      timeSpentSeconds: body.timeSpentSeconds ?? 0,
    };

    const store = getAttemptsStore();
    // Prevent duplicate by same id
    const existing = store.findIndex((a) => a.id === attempt.id);
    if (existing >= 0) {
      store[existing] = attempt;
    } else {
      store.push(attempt);
    }

    return NextResponse.json({ success: true, id: attempt.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Failed to save attempt" },
      { status: 500 }
    );
  }
}
