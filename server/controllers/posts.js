import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath, type, eventDate, eventLocation } = req.body;
    const user = await User.findById(userId);

    // Check role permissions
    if (type === "event" && user.role !== "editor" && user.role !== "admin") {
      return res.status(403).json({ message: "Only editors and admins can create events." });
    }

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      type, // "post" or "event"
      eventDate: type === "event" ? eventDate : null,
      eventLocation: type === "event" ? eventLocation : null,
      likes: {},
      comments: [],
      attendees: [],
    });

    await newPost.save();
    const posts = await Post.find();
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ - Get all posts and events */
export const getFeedPosts = async (req, res) => {
  try {
    const { type, userId } = req.query;
    let query = {};

    if (type === "events") {
      query.type = "event"; // Fetch only events
    } else if (type === "friends" && userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      query.userId = { $in: [...user.friends, userId] }; // Fetch user's and friends' posts
    } else {
      const adminEditors = await User.find({ role: { $in: ["admin", "editor"] } }).select("_id");
      const adminEditorIds = adminEditors.map(user => user._id);
      
      query.$or = [
        { userId: { $in: adminEditorIds } }, // Admins & Editors' posts
        { type: "event" } // All events
      ];
    }

    // 🔥 Fix: Populate comments with user details
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        populate: { path: "userId", select: "firstName", select:"lastName" }, // ✅ Ensure user details in comments
      })
      .populate("userId", "firstName", "lastName"); // ✅ Populate post owner details
console.log(posts)
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Get posts by a specific user

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch posts only from the specified user, sorted by most recent
    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        populate: { path: "userId", select: "firstName lastName" }, // ✅ Populate user details in comments
      })
      .populate("userId", "firstName lastName"); // ✅ Populate post owner details

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


/* LIKE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.get(userId)) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* ATTEND EVENT */
export const attendEvent = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Event not found" });

    // Ensure it's an event before updating attendance
    if (post.type !== "event") {
      return res.status(400).json({ message: "This post is not an event" });
    }

    // Toggle user attendance
    const isAttending = post.attendees.includes(userId);
    if (isAttending) {
      post.attendees = post.attendees.filter((id) => id !== userId);
    } else {
      post.attendees.push(userId);
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const postComments = async (req, res) => {
  try {
    const { userId, content, parentCommentId = null } = req.body;
    const postId = req.params.postId;

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(400).json({ message: "Parent comment not found" });
      }
      // Prevent replying to replies (only allow top-level comments to have replies)
      if (parentComment.parentCommentId) {
        return res.status(400).json({ message: "Replies can only be one level deep." });
      }
    }

    // Create new comment
    const newComment = new Comment({
      postId,
      userId,
      content,
      parentCommentId,
    });

    console.log("New Comment Saved:", newComment);

    await newComment.save();

    // Push the new comment to the post
    // Populate the comments with user firstName and lastName
const updatedPost = await Post.findByIdAndUpdate(
  postId,
  { $push: { comments: newComment._id } }, // Update the post's comments array
  { new: true } // Return the updated post
).populate({
  path: "comments",
  populate: { path: "userId", select: "firstName lastName" }, // ✅ Fix: Select correct user fields
});

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};