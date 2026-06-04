import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { symptom } = await req.json();

  return NextResponse.json({
    symptom,
    diagnosis: "Возможная неисправность требует уточнения",
    explanation: "Система пока в базовом режиме без полного AI анализа",
    lesson: "Проверяйте симптомы на ранней стадии",
    what_to_do: "Обратиться к диагностике",
    service_recommendation: "Рекомендуется СТО"
  });
}