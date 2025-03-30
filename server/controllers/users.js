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


export const getEditors = async (req, res) => {
  try {
    // Case-insensitive query to ensure we capture "editor" regardless of case
    const editors = await User.find({ role: { $regex: new RegExp("^editor$", "i") } })
      .select("_id firstName lastName picturePath");
    
    res.status(200).json(editors);
  } catch (err) {
    console.error("Error fetching editors:", err);
    res.status(500).json({ message: err.message });
  }
};

export const followEditors = async (req, res) => {
  console.log("followEditors endpoint hit");
  try {
    console.log("=== followEditors START ===");
    console.log("Request user:", req.user);
    console.log("Request body:", req.body);

    const { editors } = req.body;
    if (!editors || !Array.isArray(editors)) {
      console.error("Invalid editors array received:", editors);
      return res.status(400).json({ message: "Editors must be an array." });
    }

    console.log("Editors to follow:", editors);

    const userId = req.user.id;
    console.log("Updating followed editors for user with ID:", userId);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { friends: editors } },
      { new: true }
    );

    if (!updatedUser) {
      console.error("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Updated user document:", updatedUser);
    console.log("=== followEditors END ===");
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error in followEditors:", err);
    res.status(500).json({ message: err.message });
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

