import { NextResponse } from "next/server";
import { searchParts } from "@/lib/partsSearch";

export async function POST(req: Request) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "empty query" }, { status: 400 });
  }

  const results = searchParts(query);

  if (results.length === 0) {
    return NextResponse.json({
      type: "not_found",
      message: "Не найдено. Уточните описание детали",
      questions: [
        "Где находится деталь?",
        "Что именно происходит?",
      ],
    });
  }

  return NextResponse.json({
    type: "found",
    results: results.map((r) => ({
      part_name: r.part,
      article: r.article,
      system: r.system,
    })),
  });
}
