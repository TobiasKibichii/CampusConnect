export const getSummary = async (text) => {
  const res = await fetch(
    "https://campusconnect-summarizer.onrender.com/summarize",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
  );
  const data = await res.json();
  return data.summary;
};
