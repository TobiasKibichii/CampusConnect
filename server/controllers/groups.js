import Group from "../models/Group.js";
import mongoose from "mongoose";

export const getGroups = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user.id);

    let myGroups;

    if (req.user.role === "editor") {
      // Editors own one group max
      const group = await Group.findOne({ createdBy: userId });
      myGroups = group ? [group] : [];
    } else {
      myGroups = await Group.find({ members: userId });
    }

    const allGroups = await Group.find();

    const myGroupIds = myGroups.map((g) => g._id.toString());

    const suggestedGroups = allGroups
      .filter((group) => !myGroupIds.includes(group._id.toString()))
      .map((group) => {
        const requested = group.joinRequests?.some(
          (reqId) => reqId.toString() === userId.toString()
        );

        return {
          ...group.toObject(),
          requested: requested || false,
        };
      });

    res.json({ myGroups, suggestedGroups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const postGroup = async (req, res) => {
  try {
    // Restrict group creation to editors only.
    if (req.user.role !== "editor") {
      return res
        .status(403)
        .json({ message: "Only editors can create groups" });
    }

    // Check if the editor already has a group
    const existingGroup = await Group.findOne({ createdBy: req.user._id });
    if (existingGroup) {
      return res
        .status(400)
        .json({ message: "Group already exists for this user" });
    }

    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Group name is required" });
    }

    const newGroup = new Group({
      name,
      createdBy: req.user.id,
      members: [req.user.id], // Optionally, add the creator as a member
    });

    await newGroup.save();
    res.status(201).json({ group: newGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const joinGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id; // assuming token payload includes 'id'

    // Find the group by its ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is already in the group
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User already a member of this group" });
    }

    // For simplicity, add the user directly to the group's members array.
    // If you prefer to send a join request for approval, you can implement that logic here.
    group.members.push(userId);
    await group.save();

    res.json({ message: "Joined group successfully", group });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const requestJoinGroup = async (req, res) => {
  try {
    console.log("wstrfyuio")
    const { groupId } = req.params;
    const userId = req.user.id; // Assuming you set req.user from token
    
    // Find the group and update its joinRequests
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user already requested or is a member
    if (group.joinRequests.includes(userId) || group.members.includes(userId)) {
      return res.status(400).json({ message: "Already requested or a member" });
    }

    group.joinRequests.push(userId);
    await group.save();

    // Optionally, send a notification to the group creator here

    res.status(200).json({ message: "Join request sent", group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
