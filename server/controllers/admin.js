import User from "../models/User.js";
import Group from "../models/Group.js";
import Venue from "../models/Venue.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude sensitive info
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};


export const editUser =   async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required." });
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};


export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Error fetching groups" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    await Group.findByIdAndDelete(id);
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Error deleting group" });
  }
};


export const getAnalytics = async (req, res) => {
  try {
    // Compute basic metrics
    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();
    // Uncomment if you have a Post model:
    // const totalPosts = await Post.countDocuments();

    // For demonstration, we’ll just send these metrics.
    const analytics = {
      totalUsers,
      totalGroups,
      // totalPosts,
    };

    res.json({ analytics });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};

export const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find({});
    res.json({ venues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVenue = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    const newVenue = new Venue({ name, capacity, available: true });
    await newVenue.save();
    res.json({ message: "Venue added", venue: newVenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
