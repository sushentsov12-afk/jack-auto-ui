"use client";

import { useState } from "react";

const examples = [
  "стучит подвеска на кочках",
  "горит чек",
  "скрип при торможении",
  "не заводится утром",
  "гудит колесо",
];

export default function Home() {
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  async function send(text?: string) {
    const value = text || symptom;
    setLoading(true);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptom: value }),
    });

    setData(await res.json());
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 max-w-xl mx-auto">
      <input
        className="w-full p-4 bg-zinc-900"
        value={symptom}
        onChange={(e) => setSymptom(e.target.value)}
      />

      <button onClick={() => send()}>
        {loading ? "Анализ..." : "Спросить"}
      </button>

      <div className="flex gap-2 flex-wrap">
        {examples.map((e) => (
          <button key={e} onClick={() => send(e)}>
            {e}
          </button>
        ))}
      </div>

      {data && (
        <div>
          <h2>{data.diagnosis}</h2>
          <p>{data.explanation}</p>
          <p>{data.risk}</p>
          <p>{data.can_drive}</p>
        </div>
      )}
    </div>
  );
}
