import axios from "axios";

export const searchAI = async (req, res) => {
  const { query } = req.body;

  try {
    const response = await axios.post("http://localhost:8000/search", {
      question: query,
    });

    return res.status(200).json({ results: response.data.results });
  } catch (error) {
    console.error("AI Search error:", error.message);
    return res.status(500).json({ message: "AI Search failed" });
  }
};

