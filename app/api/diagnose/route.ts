import { NextResponse } from "next/server";

function detect(symptom: string) {
  const s = symptom.toLowerCase();

  if (s.includes("троит") || s.includes("вибрация")) {
    return {
      diagnosis: "Вероятны пропуски зажигания",
      probability: "70%",
    };
  }

  if (s.includes("не заводится")) {
    return {
      diagnosis: "Проблема стартера или аккумулятора",
      probability: "65%",
    };
  }

  if (s.includes("перегрев")) {
    return {
      diagnosis: "Система охлаждения (термостат/антифриз)",
      probability: "75%",
    };
  }

  return {
    diagnosis: "Требуется уточнение симптомов",
    probability: "40%",
  };
}

export async function POST(req: Request) {
  const { symptom } = await req.json();
  const result = detect(symptom);

  return NextResponse.json({
    symptom,
    ...result,
    explanation: "Симптом сопоставлен с базой типовых неисправностей",
    lesson: "Ранние симптомы снижают стоимость ремонта в 3–10 раз",
    what_to_do: "Проверить узел и провести диагностику",
    service_recommendation: "Рекомендуется проверенное СТО",
  });
}
import { NextResponse } from "next/server";

type Result = {
  diagnosis: string;
  probability: string;
  explanation: string;
  lesson: string;
  what_to_do: string;
  service_recommendation: string;
};

function detect(symptom: string): Result {
  const s = symptom.toLowerCase();

  if (s.includes("троит") || s.includes("вибрация")) {
    return {
      diagnosis: "Пропуски зажигания",
      probability: "70%",
      explanation: "Смесь в цилиндрах воспламеняется нестабильно",
      lesson: "Катушки и свечи — расходники, игнорирование ведёт к катализатору",
      what_to_do: "Проверить свечи и катушки",
      service_recommendation: "Диагностика двигателя на СТО",
    };
  }

  if (s.includes("не заводится")) {
    return {
      diagnosis: "Аккумулятор / стартер / питание",
      probability: "65%",
      explanation: "Нет достаточного тока для запуска двигателя",
      lesson: "Аккумулятор умирает постепенно — можно отследить заранее",
      what_to_do: "Проверить аккумулятор и клеммы",
      service_recommendation: "Электрик СТО",
    };
  }

  if (s.includes("перегрев")) {
    return {
      diagnosis: "Система охлаждения",
      probability: "75%",
      explanation: "Нарушена циркуляция охлаждающей жидкости",
      lesson: "Перегрев за 10 минут может убить мотор",
      what_to_do: "Проверить термостат и уровень антифриза",
      service_recommendation: "Срочно СТО",
    };
  }

  return {
    diagnosis: "Недостаточно данных",
    probability: "40%",
    explanation: "Симптом не сопоставлен с базой",
    lesson: "Чем точнее описание — тем точнее диагноз",
    what_to_do: "Уточнить звук, поведение, условия",
    service_recommendation: "Диагностика",
  };
}

export async function POST(req: Request) {
  const { symptom } = await req.json();

  const result = detect(symptom);

  return NextResponse.json({
    symptom,
    ...result,
  });
}
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { symptom } = await req.json();

  const prompt = `
Ты авто-механик помощник.
Верни JSON строго:

{
"diagnosis": "",
"probability": "",
"explanation": "",
"lesson": "",
"what_to_do": "",
"service_recommendation": ""
}

Симптом: ${symptom}
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  const data = await res.json();

  const text = data.choices?.[0]?.message?.content || "{}";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {
      diagnosis: "Ошибка анализа",
      probability: "0%",
      explanation: "Неверный формат ответа AI",
      lesson: "",
      what_to_do: "",
      service_recommendation: "",
    };
  }

  return NextResponse.json({
    symptom,
    ...parsed,
  });
}
import { NextResponse } from "next/server";
import { addMemory, getMemory } from "@/lib/memory";

export async function POST(req: Request) {
  const { symptom } = await req.json();

  const history = getMemory();

  const prompt = `
Ты авто-диагност.

История:
${JSON.stringify(history)}

Симптом:
${symptom}

Верни JSON:
{
"diagnosis": "",
"probability": "",
"explanation": "",
"lesson": "",
"what_to_do": "",
"service_recommendation": ""
}
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "{}";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {
      diagnosis: "error",
      probability: "0%",
      explanation: "",
      lesson: "",
      what_to_do: "",
      service_recommendation: "",
    };
  }

  addMemory({
    symptom,
    diagnosis: parsed.diagnosis,
    time: Date.now(),
  });

  return NextResponse.json({
    symptom,
    ...parsed,
    memory_size: history.length + 1,
  });
}
