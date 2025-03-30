import User from "../models/User.js";
import Post from "../models/Post.js";

// GET saved posts for the logged-in user
// GET saved posts for the logged-in user
export const getSavedPosts = async (req, res) => {
  try {
    // Retrieve the user from the database using the id attached by your auth middleware
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const k = user.savedPosts
    
    // Fetch all posts that match the savedPosts IDs
    const posts = await Post.find({ _id: { $in: user.savedPosts } })
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        select: "content userId likes replies createdAt",
        populate: [
          { 
            path: "userId", 
            select: "firstName lastName picturePath" 
          },
          { 
            path: "replies",
            select: "content userId likes createdAt",
            populate: { 
              path: "userId", 
              select: "firstName lastName picturePath" 
            }
          }
        ],
      })
      .populate("userId", "firstName lastName picturePath");
console.log(posts)
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id; // Assuming the verifyToken middleware attaches the user ID

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if post is already saved
    const alreadySaved = user.savedPosts.includes(postId);

    if (alreadySaved) {
      // Remove the post from savedPosts
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    } else {
      // Add the post to savedPosts
      user.savedPosts.push(postId);
    }
    await user.save();

    console.log(user.savedPosts)
    res.status(200).json({ savedPosts: user.savedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error toggling saved post" });
  }
}

