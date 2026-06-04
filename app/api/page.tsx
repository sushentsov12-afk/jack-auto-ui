{data && (
  <div className="space-y-3 bg-zinc-900 p-5 rounded-xl">
    {data.type === "question" ? (
      <p className="text-yellow-300">{data.message}</p>
    ) : (
      <>
        <p><b>Диагноз:</b> {data.diagnosis}</p>
        <p><b>Объяснение:</b> {data.explanation}</p>
        <p><b>Урок:</b> {data.lesson}</p>
        <p><b>Что делать:</b> {data.what_to_do}</p>
        <p><b>СТО:</b> {data.service_recommendation}</p>
      </>
    )}
  </div>
)}
