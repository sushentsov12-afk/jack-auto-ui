export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Джек</h1>
        <p className="text-zinc-400">Симптом → Диагноз → Объяснение</p>

        <input className="w-full p-4 bg-zinc-900 rounded-xl" placeholder="Что с машиной?" />

        <button className="w-full p-4 bg-white text-black rounded-xl">Получить</button>
      </div>
    </main>
  );
}