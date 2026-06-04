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
Ты авто-диагност.

Если данных мало → задай вопросы.
Если достаточно → дай диагноз.

ФОРМАТ JSON:
{
"type": "question" | "diagnosis",
"message": "",
"questions": [],
"diagnosis": "",
"probability": "",
"explanation": "",
"what_to_do": "",
"can_drive": "yes|no|risky"
}
`.trim(),
        },
        {
          role: "user",
          content: `CAR:${JSON.stringify(car)} HISTORY:${JSON.stringify(history)} SYMPTOM:${symptom}`,
        },
      ],
    }),
  });

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  const parsed = safeJSON(text) || {
    type: "question",
    message: "Уточните симптомы",
    questions: ["Что происходит?", "Когда начинается проблема?"],
    diagnosis: "",
    probability: "0%",
    explanation: "",
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
    ...parsed,
    memory_size: getMemory().length,
  });
}
