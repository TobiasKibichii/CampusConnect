import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";

const NoteEditor = ({ postId }) => {
  const token = useSelector((state) => state.token);
  const userId = useSelector((state) => state.user?.id);
  const [noteContent, setNoteContent] = useState("");
  const [noteId, setNoteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(
          `https://campusconnect-backend.onrender.com/notes/notes/${postId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.data.note) {
          setNoteContent(res.data.note.content);
          setNoteId(res.data.note._id);
        } else {
          setNoteContent("");
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
      if (noteId) {
        // Update existing note
        await axios.put(
          `https://campusconnect-backend.onrender.com/notes/notes/${noteId}`,
          { content: noteContent },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        alert("Note updated!");
      } else {
        // Create new note
        const res = await axios.post(
          `https://campusconnect-backend.onrender.com/notes/notes`,
          { postId, content: noteContent },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setNoteId(res.data._id);
        alert("Note created!");
      }
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const deleteNote = async () => {
    if (!noteId) return;
    try {
      await axios.delete(
        `https://campusconnect-backend.onrender.com/notes/notes/${noteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNoteContent("");
      setNoteId(null);
      alert("Note deleted!");
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {noteId ? "Edit your note" : "Write your note"}
        </Typography>
        <ReactQuill value={noteContent} onChange={setNoteContent} />
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={saveNote}>
            {noteId ? "Update Note" : "Save Note"}
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
