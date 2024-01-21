import express from "express";
import path from "path";
import multer from "multer";
import * as dotenv from "dotenv";

dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const __dirname = path.resolve(path.dirname(""));
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Get video",
    data: null,
  });
});

export default router;
