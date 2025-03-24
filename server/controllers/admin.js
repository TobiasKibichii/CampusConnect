import User from "../models/User.js";
import Group from "../models/Group.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude sensitive info
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
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