import Comment from "../models/Comment.js";

export const toggleLikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id; // Assuming authentication middleware adds `req.user`

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.status(200).json({ message: isLiked ? "Like removed" : "Comment liked", likes: comment.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
