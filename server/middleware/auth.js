import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
  
    let token = req.header("Authorization");
    console.log("Incoming Authorization header:", token);

    if (!token) {
      console.error("No token provided");
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trimLeft();
    }
    
    console.log("Token after processing:", token);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", verified);

    req.user = verified; // Ensure that the decoded token contains an `id` field.
    next();
    
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(500).json({ error: err.message });
  }
};


export const isAuthenticated = async(req, res, next) => {
  // Ensure req.user is populated after authentication
  if (req.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

export const isEditor = (req, res, next) => {
  console.log("Decoded user:", req.user);
  console.log("Decoded user role:", req.user.role);

  if (req.user && req.user.role === 'editor') {
   return next();
  }
  res.status(403).json({ message: "Access denied. Editors only." });
}


export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};

