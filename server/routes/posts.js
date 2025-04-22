import express from "express";
import {  createPost, getFeedPosts, getUserPosts, likePost, attendEvent, postComments, getPostComments, updateComment, deleteComment, toggleLikeComment} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import Post from "../models/Post.js";



const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets"); // storing in public/assets
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});



const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only the "picture" field
    if (file.fieldname === "picture") {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
  },
});



/* READ */
router.get("/",  verifyToken, getFeedPosts);
router.post(
  "/p",
  verifyToken,
  upload.single("picture"),
  async (req, res, next) => {
    console.log("📌 File:", req.file);
    console.log("📌 Body:", req.body);

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded." });
    }

    try {
      await createPost(req, res);
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({ message: "Post creation failed." });
    }
  }
);


router.get("/user/:userId", verifyToken, getUserPosts);

router.patch("/:postId/attend", verifyToken, attendEvent);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

router.post("/:postId/comments", verifyToken, postComments);
router.get("/:postId/comments", getPostComments)

router.patch("/:postId/comments/:commentId", verifyToken, updateComment)
router.delete("/:postId/comments/:commentId", verifyToken, deleteComment)


router.get("/popularEvents", verifyToken, async (req, res) => {
  try {
    const events = await Post.find({ type: "event" })
      .sort({ "likes": -1, createdAt: -1 }) // sort by likes (assuming likes is a map)
      .exec();

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching popular events:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
