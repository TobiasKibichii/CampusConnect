import express from "express";
import { getAllUsers, deleteUser, getAllGroups, deleteGroup, getAnalytics, getAllVenues, createVenue } from "../controllers/admin.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", verifyToken, isAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

router.get("/groups", verifyToken, isAdmin, getAllGroups);
router.delete("/groups/:id", verifyToken, isAdmin, deleteGroup);

router.get("/analytics", verifyToken, isAdmin, getAnalytics);

router.get('/venues', verifyToken, isAdmin, getAllVenues);
router.post('/venues', verifyToken, isAdmin, createVenue);

export default router;
