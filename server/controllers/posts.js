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

    // Populate comments, including the likes field for both comments and nested replies
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        select: "content userId likes replies createdAt", // Ensure likes is included
        populate: [
          { 
            path: "userId", 
            select: "firstName lastName picturePath" 
          },
          { 
            path: "replies",
            select: "content userId likes createdAt", // Include likes for replies as well
            populate: { 
              path: "userId", 
              select: "firstName lastName picturePath" 
            }
          }
        ],
      })
      .populate("userId", "firstName lastName picturePath");

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

    console.log(req.body);
    // This variable will determine which comment gets updated in the replies array.
    let actualParentCommentId = parentCommentId;
    let parentComment = null;

    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(400).json({ message: "Parent comment not found" });
      }
      // If replying to a reply, set the actual parent to the top-level comment.
      if (parentComment.parentCommentId) {
        actualParentCommentId = parentComment.parentCommentId;
      }
    }

    // Create the new comment
    const newComment = new Comment({
      postId,
      userId,
      content,
      parentCommentId: actualParentCommentId, // If null, it's a top-level comment; otherwise, it's a reply to a top-level comment.
    });

    await newComment.save();

    if (actualParentCommentId) {
      // Update the top-level comment's replies array.
      await Comment.findByIdAndUpdate(actualParentCommentId, { 
        $push: { replies: newComment._id } 
      });
    } else {
      // Push top-level comment to post
      await Post.findByIdAndUpdate(postId, { 
        $push: { comments: newComment._id } 
      });
    }

    // Fetch the updated post with nested comments
    const updatedPost = await Post.findById(postId)
      .populate({
        path: "comments",
        populate: [
          { path: "userId", select: "firstName lastName" },
          { 
            path: "replies",
            populate: { path: "userId", select: "firstName lastName" }
          }
        ],
      })
      .populate("userId", "firstName lastName");

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // Fetch only top-level comments for the post, including likes and nested replies
    const comments = await Comment.find({ postId, parentCommentId: null })
      .select("content userId likes replies createdAt") // Ensure likes are included
      .populate("userId", "firstName lastName picturePath")
      .populate({
        path: "replies",
        select: "content userId likes createdAt", // Include likes for replies as well
        populate: { path: "userId", select: "firstName lastName picturePath" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // assuming you've attached user info from token

    // Fetch the comment
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    
    // Check ownership (or admin privileges)
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update comment content and timestamp
    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();

    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id; // assuming you have a middleware that attaches the user

    // Fetch the comment
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if user is authorized to delete (own comment or admin)
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Remove comment reference from parent document
    if (comment.parentCommentId) {
      await Comment.findByIdAndUpdate(comment.parentCommentId, { $pull: { replies: commentId } });
    } else {
      await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


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


