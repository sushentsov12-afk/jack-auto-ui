import { NextResponse } from "next/server";
import { searchParts } from "@/lib/partsSearch";

export async function POST(req: Request) {
  const { query, car } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "empty query" }, { status: 400 });
  }

  const results = searchParts(query);

  if (results.length === 0) {
    return NextResponse.json({
      type: "not_found",
      message: "Не нашёл точного совпадения. Уточните описание детали",
      questions: [
        "Где находится деталь?",
        "Что именно она делает?",
        "Когда проявляется проблема?",
      ],
      car_considered: !!car,
    });
  }

  return NextResponse.json({
    type: "found",
    results: results.map((r) => ({
      part_name: r.part,
      article: r.article,
      system: r.system,
    })),
    car_considered: !!car,
  });
}
