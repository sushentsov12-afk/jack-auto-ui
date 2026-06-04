"use client";

import { useState } from "react";

export default function Page() {
  const [symptom, setSymptom] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    setData(null);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptom }),
    });

    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Джек</h1>
        <p className="text-zinc-400">Симптом → Диагноз → Объяснение</p>

        <input
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          className="w-full p-4 bg-zinc-900 rounded-xl"
          placeholder="Опиши проблему"
        />

        <button
          onClick={send}
          className="w-full p-4 bg-white text-black rounded-xl"
        >
          {loading ? "Анализ..." : "Получить"}
        </button>

        {data && (
          <div className="space-y-3 bg-zinc-900 p-5 rounded-xl">
            <p><b>Диагноз:</b> {data.diagnosis}</p>
            <p><b>Объяснение:</b> {data.explanation}</p>
            <p><b>Урок:</b> {data.lesson}</p>
            <p><b>Что делать:</b> {data.what_to_do}</p>
            <p><b>СТО:</b> {data.service_recommendation}</p>
          </div>
        )}
      </div>
    </main>
  );
}