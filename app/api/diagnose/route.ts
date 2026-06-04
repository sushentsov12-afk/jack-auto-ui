import { NextResponse } from "next/server";
import { getMemory, addMemory } from "@/lib/memory";

function safeJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

export async function POST(req: Request) {
  const { symptom, car } = await req.json();

  if (!symptom) {
    return NextResponse.json({ error: "empty symptom" }, { status: 400 });
  }

  const history = getMemory();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
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
Ты — Джек, автомобильный диагност и переводчик с языка машины на человеческий.

МИССИЯ:
Сделать автомобиль понятным для каждого, не только для механиков.

ПРИНЦИП:
СИМПТОМ → ОБЪЯСНЕНИЕ → ПОЧЕМУ СЛУЧИЛОСЬ → РИСК → ДЕЙСТВИЕ

ОБЯЗАННОСТИ:
- объяснять простым языком без жаргона
- всегда говорить причину поломки
- всегда объяснять как это работает
- всегда объяснять почему это случилось
- всегда указывать риск (что будет если не делать)
- всегда говорить можно ли ехать дальше

СТИЛЬ:
- коротко
- без сложных терминов
- без запугивания
- честно и понятно
ВАЖНО:
- объяснение должно быть как для человека без знаний авто
- если используешь термин — объясни его в скобках
- текст простой и короткий

ФОРМАТ JSON:
{
"type": "question" | "diagnosis",
"message": "",
"questions": [],
"diagnosis": "",
"explanation": "",
"why_it_happened": "",
"risk": "",
"what_to_do": "",
"can_drive": "yes|no|risky"
}
`.trim(),
        },
        {
          role: "user",
          content: `
CAR:
${JSON.stringify(car)}

HISTORY:
${JSON.stringify(history)}

SYMPTOM:
${symptom}
`.trim(),
        },
      ],
    }),
  });

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  const parsed = safeJSON(text) || {
    type: "question",
    message: "Уточните симптомы",
    questions: ["Что происходит?", "Когда проявляется проблема?"],
    diagnosis: "",
    explanation: "",
    why_it_happened: "",
    risk: "",
    what_to_do: "",
    can_drive: "risky",
  };

  addMemory({
    symptom,
    diagnosis: parsed.diagnosis || "pending",
    time: Date.now(),
  });

return NextResponse.json({
  symptom,
  car,
  diagnosis: parsed.diagnosis,
  explanation: parsed.explanation,
  why_it_happened: parsed.why_it_happened,
  risk: parsed.risk,
  what_to_do: parsed.what_to_do,
  can_drive: parsed.can_drive,
  questions: parsed.questions,
  message: parsed.message,
  memory_size: getMemory().length,
});
