import { NextResponse } from "next/server";
import { getMemory, addMemory } from "@/lib/memory";

function safeJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/```json|```/g, "")
      .match(/\{[\s\S]*\}/);

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

  if (!symptom) {
    return NextResponse.json({ error: "empty symptom" }, { status: 400 });
  }

  const history = getMemory();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  let res;

  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ты авто-механик. Отвечай ТОЛЬКО JSON: type, message, diagnosis, probability, explanation, lesson, what_to_do, service_recommendation",
          },
          {
            role: "user",
            content: `История:${JSON.stringify(history)} Симптом:${symptom}`,
          },
        ],
        temperature: 0.3,
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  const parsed = safeJSON(text) || {
    type: "diagnosis",
    message: "",
    diagnosis: "unknown",
    probability: "0%",
    explanation: "",
    lesson: "",
    what_to_do: "",
    service_recommendation: "",
  };

  addMemory({
    symptom,
    diagnosis: parsed.diagnosis,
    time: Date.now(),
  });

  return NextResponse.json({
    symptom,
    ...parsed,
    memory_size: getMemory().length,
  });
}
