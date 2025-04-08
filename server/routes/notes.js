import express from "express";
import Note from "../models/Note.js";
import { verifyToken } from "../middleware/auth.js"; // Ensure you have this

const router = express.Router();

// GET a note for a specific post for the authenticated user
router.get("/notes/:postId", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const note = await Note.findOne({ userId, postId });
    if (!note) {
      return res.status(200).json({ message: "No note found", note: null });
    }
    res.json({ note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST (upsert) a note: if it exists, update; otherwise, create
router.post("/notes", verifyToken, async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;
    const note = await Note.findOneAndUpdate(
      { userId, postId },
      { content, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT for explicit editing of an existing note by its ID
router.put("/notes/:noteId", verifyToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { content, updatedAt: new Date() },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE a note by its ID
router.delete("/notes/:noteId", verifyToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    const note = await Note.findOneAndDelete({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
