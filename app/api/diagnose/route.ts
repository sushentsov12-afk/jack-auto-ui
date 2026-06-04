import { NextResponse } from "next/server";
import { getMemory, addMemory } from "@/lib/memory";

function safeJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
    if (!cleaned) return null;
    try {
      return JSON.parse(cleaned[0]);
    } catch {
      return null;
    }
  }
}

export async function POST(req: Request) {
  const { symptom } = await req.json();
  if (!symptom) return NextResponse.json({ error: "empty symptom" }, { status: 400 });

  const history = getMemory();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
Ты — профессиональный авто-диагност уровня СТО + инженер.

Работаешь как ДЕРЕВО РЕШЕНИЙ:

1) Если данных недостаточно:
- задаёшь 1–3 точных уточняющих вопроса
- НЕ даёшь диагноз

2) Если данных достаточно:
- даёшь финальный диагноз
- разбиваешь причину на ветки (engine / electrical / fuel / cooling / transmission)
- указываешь вероятности

ФОРМАТ СТРОГО JSON:

{
"type": "question" | "diagnosis",

"message": "",
"questions": [],

"branches": [
  {
    "system": "engine|electrical|fuel|cooling|transmission",
    "probability": "",
    "reason": ""
  }
],

"diagnosis": "",
"probability": "",
"explanation": "",
"lesson": "",
"what_to_do": "",
"can_drive": "yes|no|risky",
"urgency": "low|medium|high|critical",
"service_recommendation": ""
}
`.trim(),
        },
        {
          role: "user",
          content: `
ИСТОРИЯ:
${JSON.stringify(history)}

СИМПТОМ:
${symptom}
`.trim(),
        },
      ],
    }),
  });

  clearTimeout(timeout);

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  const parsed = safeJSON(text) || {
    type: "question",
    message: "Недостаточно данных",
    questions: ["Опишите звук", "Когда проявляется проблема"],
    branches: [],
    diagnosis: "",
    probability: "0%",
    explanation: "",
    lesson: "",
    what_to_do: "",
    can_drive: "risky",
    urgency: "medium",
    service_recommendation: "",
  };

  addMemory({
    symptom,
    diagnosis: parsed.diagnosis || "pending",
    time: Date.now(),
  });

  return NextResponse.json({
    symptom,
    ...parsed,
    memory_size: getMemory().length,
  });
}
