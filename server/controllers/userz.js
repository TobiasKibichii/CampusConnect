import User from "../models/User.js";
import mongoose from "mongoose";


export const followEditors = async (req, res) => {
  console.log("followEditors endpoint hit");
  try {
    console.log("=== followEditors START ===");
    console.log("Request user:", req.user.id);
    console.log("Request body:", req.body);

    const { editors } = req.body;
    if (!editors || !Array.isArray(editors)) {
      console.error("Invalid editors array received:", editors);
      return res.status(400).json({ message: "Editors must be an array." });
    }

    console.log("Editors to follow:", editors);
    const userId = req.user.id;
    console.log("Updating followed editors for user with ID:", userId);

    // Convert incoming editor IDs (assumed to be strings) into ObjectId's.
    const objectIds = editors.map((id) => mongoose.Types.ObjectId(id));

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { friends: objectIds } },
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
