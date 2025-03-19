
import express from "express";
import { usersSearch } from "../controllers/search.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, usersSearch);


export default router;