"use client";

import { useState } from "react";

const examples = [
  "стучит подвеска на кочках",
  "горит чек и машина троит",
  "скрип при торможении",
  "машина не заводится утром",
  "гудит колесо на скорости",
];

function riskColor(v: string) {
  if (v === "low") return "text-green-400";
  if (v === "medium") return "text-yellow-400";
  if (v === "high") return "text-red-400";
  return "text-zinc-400";
}

function urgencyColor(v: string) {
  if (v === "now") return "text-red-400";
  if (v === "soon") return "text-yellow-400";
  return "text-green-400";
}

function toneLabel(v: string) {
  if (v === "calm") return "Спокойно";
  if (v === "warning") return "Настороженно";
  if (v === "critical") return "Срочно";
  return "";
}

export default function Home() {
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  async function send(text?: string) {
    const value = text || symptom;
    setLoading(true);
    setData(null);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptom: value }),
    });

    setData(await res.json());
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex justify-center p-4">
      <div className="w-full max-w-xl space-y-4">

        <div className="text-xl font-semibold">
          Джек — объясняет автомобиль простым языком
        </div>

        <input
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="Опиши проблему..."
          className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800"
        />

        <button
          onClick={() => send()}
          className="w-full p-4 rounded-xl bg-white text-black font-semibold"
        >
          {loading ? "Анализ..." : "Спросить Джека"}
        </button>

        <div className="flex flex-wrap gap-2">
          {examples.map((e) => (
            <button
              key={e}
              onClick={() => send(e)}
              className="text-xs px-3 py-2 rounded-full bg-zinc-800 border border-zinc-700"
            >
              {e}
            </button>
          ))}
        </div>

        {data && (
          <div className="space-y-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">

            <div className="text-lg font-semibold">
              {data.diagnosis}
            </div>

            <div className="text-sm text-zinc-300 leading-relaxed">
              {data.explanation}
            </div>

            {/* УРОВЕНЬ СОМНЕНИЯ */}
            <div className="text-sm text-zinc-400">
              Уверенность: {data.confidence_level}
            </div>

            {/* ПРИЧИНЫ */}
            <div className="text-sm text-zinc-300">
              <b>Причина:</b> {data.why_it_happened}
            </div>

            {/* АЛЬТЕРНАТИВЫ */}
            <div className="text-sm text-zinc-300">
              <b>Также возможно:</b> {data.alternatives}
            </div>

            {/* РИСК */}
            <div className={`text-sm font-semibold ${riskColor(data.risk_level)}`}>
              Риск: {data.risk}
            </div>

            {/* СРОЧНОСТЬ */}
            <div className={`text-sm font-semibold ${urgencyColor(data.urgency)}`}>
              Срочность: {data.urgency}
            </div>

            {/* ЭКОНОМИКА */}
            <div className="text-sm text-zinc-300">
              💸 Цена ремонта: {data.cost_range}
            </div>

            <div className="text-sm text-red-300">
              💥 Если игнорировать: {data.if_ignore_cost}
            </div>

            {/* ДЕЙСТВИЕ */}
            <div className="text-sm text-zinc-300">
              {data.what_to_do}
            </div>

            {/* САМОПРОВЕРКА */}
            <div className="text-sm text-zinc-400">
              🔎 Самопроверка: {data.self_check}
            </div>

            {/* СТО ФРАЗА */}
            <div className="text-sm text-zinc-300">
              🧾 СТО: "{data.mechanic_phrase}"
            </div>

            {/* ТОН */}
            <div className={`text-sm font-semibold ${riskColor(data.tone)}`}>
              Ситуация: {toneLabel(data.tone)}
            </div>

            {/* МИКРО-УРОК */}
            <div className="text-xs text-zinc-500">
              📚 {data.micro_lesson}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
