// routes/groups.js
import express from 'express';
const router = express.Router();
import { isAuthenticated, isEditor, verifyToken } from '../middleware/auth.js';
import {getGroups, postGroup, joinGroup, requestJoinGroup} from "../controllers/groups.js";
import Group from "../models/Group.js";


// GET /api/groups/my - Retrieve the group for the logged-in user
router.get('/', verifyToken, isAuthenticated, getGroups);



router.get('/:groupId', verifyToken, isAuthenticated, async (req, res) => {
  try {
    const { groupId, groupName } = req.query;

    let group;

    if (groupId) {
      group = await Group.findById(groupId);
    } else if (groupName) {
      group = await Group.findOne({ name: groupName });
    } else {
      return res.status(400).json({ message: "Group ID or Group Name required" });
    }

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST /api/groups - Create a new group (only for editors)
router.post('/postGroup', verifyToken, isAuthenticated, isEditor, postGroup);

// Join group (for any authenticated user)
router.post("/:groupId/join", verifyToken, isAuthenticated, joinGroup);
router.post("/:groupId/requestJoin", verifyToken, isAuthenticated, requestJoinGroup);

export default router;
