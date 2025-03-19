import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;
    console.log(req.body)
    const updatedUser = await User.findByIdAndUpdate(id, updatedFields, { new: true });
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;

    // Exit function early if the user is trying to add themselves
    if (id === friendId) return;

    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) return;

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((fid) => fid.toString() !== friendId);
      friend.friends = friend.friends.filter((fid) => fid.toString() !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    await user.save();
    await friend.save();
  } catch (err) {
    console.error(err.message); // Log error for debugging
  }
};


export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("savedPosts") // populate posts details
      .populate("savedEvents"); // if you have events
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optionally, limit the posts/events for the homepage preview
    const previewPosts = user.savedPosts.slice(0, 5);
    const previewEvents = user.savedEvents.slice(0, 5);

    res.status(200).json({
      savedPosts: user.savedPosts,
      savedEvents: user.savedEvents,
      previewPosts,
      previewEvents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching saved items" });
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

    res.status(200).json({ savedPosts: user.savedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error toggling saved post" });
  }
}