"use client";

import { useState } from "react";

const examples = [
  "стучит подвеска на кочках",
  "горит чек и машина троит",
  "скрип при торможении",
  "машина не заводится утром",
  "гудит колесо на скорости",
];

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

    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-4">

        <div className="text-xl font-semibold">
          Джек — объясняет машину простым языком
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
          {loading ? "Анализ..." : "Спросить"}
        </button>

        <div className="flex flex-wrap gap-2">
          {examples.map((e, i) => (
            <button
              key={i}
              onClick={() => send(e)}
              className="text-xs px-3 py-2 rounded-full bg-zinc-800 border border-zinc-700"
            >
              {e}
            </button>
          ))}
        </div>

        {data && (
          <div className="space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">

            <div className="text-lg font-semibold">
              {data.diagnosis}
            </div>

            <div className="text-sm text-zinc-300">
              {data.explanation}
            </div>

            <div className="text-sm text-zinc-400">
              Риск: {data.risk}
            </div>

            <div className="text-sm text-zinc-400">
              Можно ехать: <b>{data.can_drive}</b>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
