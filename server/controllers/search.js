import User from "../models/User.js";

export const usersSearch =async (req, res) => {
  const { q, role } = req.query;
  console.log("Received search query:", q, "with role:", role); // Log incoming query parameters
  let filter = {};

  // Apply role filter if provided
  if (role) {
    filter.role = role;
  }

  // If a search term is provided, build a regex filter for multiple fields
  if (q) {
    filter.$or = [
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { occupation: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }

  try {
    const users = await User.find(filter);
    console.log("Users found:", users); // Log found users
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Log full error object
    res.status(500).json({ error: "Error fetching users", details: error.message });
  }
}