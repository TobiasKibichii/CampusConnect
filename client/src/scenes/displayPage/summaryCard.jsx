import React, { useEffect, useState } from "react";
import { CircularProgress, Alert } from "@mui/material";
import Summary from "./summary.jsx"; // This is your display component

const SummaryCard = ({ description, about, whatYoullLearn }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const text = `About: ${about}\n\nWhat You'll Learn: ${whatYoullLearn}`;
        const response = await fetch("http://127.0.0.1:8000/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) throw new Error("Failed to fetch summary");

        const data = await response.json();
        setSummary(`Description: ${description}\n\n${data.summary}`);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [description, about, whatYoullLearn]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return <Summary summary={summary} />;
};

export default SummaryCard;
