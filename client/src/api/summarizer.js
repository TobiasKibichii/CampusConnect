export const getSummary = async (text) => {
  const res = await fetch(
    "https://huggingface.co/spaces/evolving8/campusconnect-summarizer/summarize",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
  );
  const data = await res.json();
  return data.summary;
};
