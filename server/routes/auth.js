import express from "express";
import { login, register } from "../controllers/auth.js";

import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets"); // storing in public/assets
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
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
