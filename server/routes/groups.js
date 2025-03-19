// routes/groups.js
import express from 'express';
const router = express.Router();
import { isAuthenticated, isEditor, verifyToken } from '../middleware/auth.js';
import {getGroups, postGroup, joinGroup} from "../controllers/groups.js";

// GET /api/groups/my - Retrieve the group for the logged-in user
router.get('/', verifyToken, isAuthenticated, getGroups);

// POST /api/groups - Create a new group (only for editors)
router.post('/postGroup', verifyToken, isAuthenticated, isEditor, postGroup);

// Join group (for any authenticated user)
router.post("/:groupId/join", verifyToken, isAuthenticated, joinGroup);

export default router;
