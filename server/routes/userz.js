

import express from "express";
import {
  

  followEditors
} from "../controllers/users.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


router.put("/followEditors", verifyToken, followEditors);


export default router;
