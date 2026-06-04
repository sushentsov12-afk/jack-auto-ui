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
  const {
    symptom,
    car = {
      make: "",
      model: "",
      year: "",
      mileage: "",
      engine: "",
    },
  } = await req.json();

  if (!symptom) {
    return NextResponse.json({ error: "empty symptom" }, { status: 400 });
  }

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
Ты авто-диагност уровня СТО.

РАБОТА:
1) анализ симптома + истории + автомобиля
2) если мало данных → вопросы
3) если достаточно → диагноз

ОБЯЗАТЕЛЬНО УЧИТЫВАЙ:
- тип авто
- возраст
- пробег

ФОРМАТ JSON:

{
"type": "question" | "diagnosis",

"car_context_used": true,

"message": "",
"questions": [],

"branches": [
  {
    "system": "engine|electrical|fuel|cooling|transmission",
    "probability": "",
    "reason": ""
  }
],

"system_confidence": {
  "engine": 0-100,
  "electrical": 0-100,
  "fuel": 0-100,
  "cooling": 0-100,
  "transmission": 0-100
},

"diagnosis": "",
"probability": "",
"explanation": "",
"lesson": "",
"what_to_do": "",

"can_drive": "yes|no|risky",
"driving_warning_reason": "",

"urgency": "low|medium|high|critical",

"service_recommendation": ""
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

  clearTimeout(timeout);

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  const parsed = safeJSON(text) || {
    type: "question",
    car_context_used: false,
    message: "Недостаточно данных",
    questions: ["Опишите проблему подробнее"],
    branches: [],
    system_confidence: {
      engine: 0,
      electrical: 0,
      fuel: 0,
      cooling: 0,
      transmission: 0,
    },
    diagnosis: "",
    probability: "0%",
    explanation: "",
    lesson: "",
    what_to_do: "",
    can_drive: "risky",
    driving_warning_reason: "Недостаточно данных",
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
    car,
    ...parsed,
    memory_size: getMemory().length,
  });
}
