import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  uploadResume,
  analyzeResume,
} from "../controllers/resumeController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

router.post(
  "/analyze",
  authMiddleware,
  analyzeResume
);

export default router;