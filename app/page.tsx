"use client";

import { useState } from "react";

export default function Home() {
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

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
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-4">

        <input
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="Опиши проблему с машиной..."
          className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800"
        />

        <button
          onClick={send}
          className="w-full p-4 rounded-xl bg-white text-black font-semibold"
        >
          {loading ? "Анализ..." : "Спросить Джека"}
        </button>

        {data && (
          <div className="space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">

            {data.diagnosis && (
              <div>
                <div className="text-sm text-zinc-400">Проблема</div>
                <div className="text-lg font-semibold">{data.diagnosis}</div>
              </div>
            )}

            {data.explanation && (
              <div>
                <div className="text-sm text-zinc-400">Объяснение</div>
                <div>{data.explanation}</div>
              </div>
            )}

            {data.why_it_happened && (
              <div>
                <div className="text-sm text-zinc-400">Почему это случилось</div>
                <div>{data.why_it_happened}</div>
              </div>
            )}

            {data.risk && (
              <div>
                <div className="text-sm text-zinc-400">Риск</div>
                <div>{data.risk}</div>
              </div>
            )}

            {data.what_to_do && (
              <div>
                <div className="text-sm text-zinc-400">Что делать</div>
                <div>{data.what_to_do}</div>
              </div>
            )}

            {data.can_drive && (
              <div className="pt-2 text-sm">
                Можно ехать: <b>{data.can_drive}</b>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
