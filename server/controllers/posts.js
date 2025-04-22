import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import Venue from "../models/Venue.js"; 

/* CREATE */
// Create Post/Event
export const createPost = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    // Extract fields from the request body
    const { 
      userId, 
      description,           // For events, this is the event title.
      picturePath, 
      type, 
      eventDate,             // Expecting a date string, e.g. "2025-04-18"
      location,              // This field contains the venueId for events
      eventTimeFrom,         // ISO string, e.g. "2025-04-18T06:00:00.000Z"
      eventTimeTo,           // ISO string, e.g. "2025-04-18T08:00:00.000Z"
      about,                 // Detailed "About" information for the event
      whatYoullLearn         // "What You'll Learn" content (rich HTML, e.g., from ReactQuill)
    } = req.body;
    
    // Validate required fields for both regular posts and events.
    if (!userId || !description) {
      return res.status(400).json({ message: "User ID and description are required." });
    }
    
    // For events, enforce that the eventDate is at least one week from now.
    if (type === "event") {
      const now = new Date();
      const oneWeekAhead = new Date(now);
      oneWeekAhead.setDate(now.getDate() + 7);

      const providedDate = new Date(eventDate);
      if (providedDate < oneWeekAhead) {
        return res.status(400).json({ 
          message: "Event must be scheduled at least one week in advance." 
        });
      }
    }

    // Find the user who is creating the post/event.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // For events, check if the user has the proper role.
    if (type === "event" && user.role !== "editor" && user.role !== "admin") {
      return res.status(403).json({ message: "Only editors and admins can create events." });
    }
    
    // Set default values
    let locationValue = user.location; // For regular posts, fallback to user's own location.
    let venueId = null;
    let startDateTime = null;
    let endDateTime = null;
    
    if (type === "event") {
      // Look up the venue using the provided venueId (from the 'location' field).
      const venue = await Venue.findById(location);
      if (venue) {
        locationValue = venue.name;
        venueId = venue._id;
      } else {
        return res.status(404).json({ message: "Venue not found." });
      }
      
      // Convert the provided ISO time strings into Date objects.
      startDateTime = new Date(eventTimeFrom);
      endDateTime = new Date(eventTimeTo);
      
      // Validate that the dates are valid.
      if (isNaN(startDateTime.getTime())) {
        return res.status(400).json({ message: "Invalid start time." });
      }
      if (isNaN(endDateTime.getTime())) {
        return res.status(400).json({ message: "Invalid end time." });
      }
      
      // Validate business hours: event must be scheduled between 8 AM and 6 PM on the given date.
      const businessStart = new Date(`${eventDate}T08:00:00`);
      const businessEnd = new Date(`${eventDate}T18:00:00`);
      if (startDateTime < businessStart || endDateTime > businessEnd) {
        return res.status(400).json({ message: "Event must be scheduled between 8 AM and 6 PM." });
      }
      
      // Check for conflicts: ensure that the venue is not already booked in the time slot.
      const conflict = await Post.findOne({
        type: "event",
        venueId: venueId,
        eventDate: eventDate,
        eventTimeFrom: { $lt: endDateTime },
        eventTimeTo: { $gt: startDateTime }
      });
      
      if (conflict) {
        return res.status(409).json({
          message: "The selected venue is already booked for the chosen time slot."
        });
      }
      
      // Mark the venue as booked (optional; depends on your business logic).
      venue.available = false;
      await venue.save();
    }
    
    // Create a new Post document.
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: type === "event" ? locationValue : user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath: req.file?.filename || null,
      type, // "post" or "event"
      eventDate: type === "event" ? eventDate : null,
      eventTimeFrom: type === "event" ? startDateTime : null,
      eventTimeTo: type === "event" ? endDateTime : null,
      venueId: type === "event" ? venueId : null,
      about: type === "event" ? about : null,
      whatYoullLearn: type === "event" ? whatYoullLearn : null,
      likes: {},
      comments: [],
      attendees: [],
      status: type === "event" ? "Scheduled" : undefined,
      processed: false,
    });
    
    const savedPost = await newPost.save();
    
    // Optionally, create notifications for friends.
    if (user.friends && user.friends.length > 0) {
      const notifications = user.friends.map((friendId) => ({
        userId: friendId,
        friendId: user._id,
        postId: savedPost._id,
        message: `${user.firstName} ${user.lastName} just posted a new update.`,
      }));
      await Notification.insertMany(notifications);
    }
    
    // Fetch all posts in descending order to update the feed.
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(201).json(posts);
    
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Something went wrong, please try again later." });
  }
};






/* READ - Get all posts and events */
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
      const adminEditorIds = adminEditors.map((user) => user._id);
      query.$or = [
        { userId: { $in: adminEditorIds } }, // Admins & Editors' posts
        { type: "event" } // All events
      ];
    }

    // Fetch posts with comments, user details, and populate the location (venue) details
    const posts = await Post.find(query)
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
      .populate("userId", "firstName lastName picturePath")
      // Populate location from the Venue model (adjust the fields as needed)
      .populate("location", "name capacity address");

    
    res.status(200).json(posts);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// Get posts by a specific user

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching posts for user:", userId);

    // Fetch posts only from the specified user, sorted by most recent
    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        populate: { path: "userId", select: "firstName lastName" }, // Populate user details in comments
      })
      .populate("userId", "firstName lastName")
      // Populate the location (venue) details if available
      .populate("location", "name capacity address");

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

    // Toggle user attendance with proper comparison
    const isAttending = post.attendees.some(
      (attendeeId) => attendeeId.toString() === userId
    );
    if (isAttending) {
      post.attendees = post.attendees.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.attendees.push(userId);
    }

    await post.save();
    console.log("Updated post attendees:", post.attendees);
    res.status(200).json(post);
  } catch (err) {
    console.error("Error toggling attendance:", err);
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


