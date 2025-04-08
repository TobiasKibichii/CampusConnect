import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";

const NoteEditor = ({ postId }) => {
  const token = useSelector((state) => state.token);
  // Assume the user's id is available in state.user.id
  const userId = useSelector((state) => state.user?.id);
  const [noteContent, setNoteContent] = useState("");
  const [noteId, setNoteId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the note for the given post and user
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(`/api/notes/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.note) {
          setNoteContent(res.data.note.content);
          setNoteId(res.data.note._id);
        } else {
          setNoteContent(""); // Prompt to write a note
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching note:", err);
        setLoading(false);
      }
    };
    if (postId && token) {
      fetchNote();
    }
  }, [postId, token]);

  const saveNote = async () => {
    try {
      const res = await axios.post(
        "/api/notes",
        { postId, content: noteContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNoteId(res.data._id);
      alert("Note saved!");
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const deleteNote = async () => {
    if (!noteId) return;
    try {
      await axios.delete(`/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNoteContent("");
      setNoteId(null);
      alert("Note deleted!");
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  if (loading) return <Typography>Loading note...</Typography>;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {noteContent ? "Edit your note" : "Write your note"}
        </Typography>
        <ReactQuill value={noteContent} onChange={setNoteContent} />
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={saveNote}>
            Save Note
          </Button>
          {noteContent && noteId && (
            <Button variant="outlined" color="error" onClick={deleteNote}>
              Delete Note
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NoteEditor;
