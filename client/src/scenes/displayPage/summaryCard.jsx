import React, { useEffect, useState } from "react";
import { CircularProgress, Alert } from "@mui/material";
import Summary from "./summary.jsx"; // This is your display component
import { useSelector } from "react-redux";

const SummaryCard = ({ description, about, whatYoullLearn }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const text = `About: ${about}`;
      
        const response = await fetch("http://127.0.0.1:5000/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        });
       
        
        if (!response.ok) throw new Error("Failed to fetch summary");

        const data = await response.json();
        console.log(data)
        setSummary(data.summary);

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

  return (
    <Summary
      summary={summary}
      whatYoullLearn={whatYoullLearn}
    />
  );
};

export default SummaryCard;
