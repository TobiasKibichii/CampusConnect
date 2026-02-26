import React, { useEffect, useState } from "react";
import { CircularProgress, Alert } from "@mui/material";
import Summary from "./summary.jsx"; // This is your display component
import { useSelector } from "react-redux";

const SummaryCard = ({ description, about, whatYoullLearn, type }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        // Dynamically choose the text based on the `type` (event or post)
        const text = type === "event" ? about : description;

        const response = await fetch(
          "https://campusconnect-summarizer.onrender.com/summarize",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text }),
          },
        );

        if (!response.ok) throw new Error("Failed to fetch summary");

        const data = await response.json();
        console.log(data);
        setSummary(data.summary);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [description, about, whatYoullLearn, type, token]); // Added `type` to the dependency array

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return <Summary summary={summary} whatYoullLearn={whatYoullLearn} />;
};

export default SummaryCard;
