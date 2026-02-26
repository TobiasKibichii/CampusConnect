import express from "express";
import { login, register } from "../controllers/auth.js";

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "users",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only the "picture" field
    if (file.fieldname === "picture") {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
  },
});

router.post("/login", login);
router.post("/register", upload.single("picture"), register);

export default router;
