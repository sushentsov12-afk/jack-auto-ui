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
