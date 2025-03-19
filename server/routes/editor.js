// routes/editorRoutes.js
import express from "express";
import { verifyToken, isEditor } from "../middleware/auth.js";// Ensure you create this middleware to check for role === "editor"
import {
  getGroup,
  updateGroup,
  approveJoinRequest,
  rejectJoinRequest,
  removeMember,
} from "../controllers/editor.js";

const router = express.Router();

router.use(verifyToken)
// All routes below require the user to be an editor
router.use(isEditor)
// Get the editor's group details
router.get("/group", getGroup);

// Update the group's details
router.patch("/group", updateGroup);

// Approve a join request for a user (userId passed as a URL parameter)
router.post("/group/approve-join/:userId", approveJoinRequest);

// Reject a join request for a user
router.post("/group/reject-join/:userId", rejectJoinRequest);

// Remove a member from the group
router.delete("/group/members/:memberId", removeMember);

export default router;
