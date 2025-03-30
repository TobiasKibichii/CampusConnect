import User from "../models/User.js";

import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  updateUserProfile,
  getEditors,
  followEditors
} from "../controllers/users.js";
import {  usersSearch } from "../controllers/search.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


router.get("/editors", getEditors);
router.put("/followEditors", verifyToken, followEditors);

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);

router.patch("/:id", verifyToken, updateUserProfile);

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

router.get("/:userId/profileImage", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("picturePath");
    console.log(user.picturePath)
    if (!user || !user.picturePath) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.set("Content-Type", "image/jpeg"); // or image/png as appropriate
    res.send(user.picturePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/search", verifyToken, usersSearch);




export default router;
