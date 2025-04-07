import express from "express";
const router = express.Router();
import { searchAI } from "../controllers/aiSearchController.js";

router.post("/search-ai", searchAI);

export default router;
