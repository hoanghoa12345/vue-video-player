import express from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

import { generateThumbnail, getVideoDuration } from "../utils/ffmpeg.js";

const __dirname = path.resolve(path.dirname(""));
const router = express.Router();

router.post("/process", async (req, res) => {
  if (req.query.path) {
    const inputFileName = req.query.path;
    const outputFileName = uuidv4();
    const hlsFolderPath = "./uploads/" + outputFileName;
    const exportHlsPath = `./uploads/${outputFileName}/${outputFileName}.m3u8`;
    const job = new Job({
      jobType: "hls-transcode",
      inputData: {
        inputFileName,
      },
      outputData: {
        hlsFolderPath,
        exportHlsPath,
      },
      status: "wait",
    });
    const newJob = await job.save();
    await bree.start("hls-transcode");
    res.send({
      message: "Process video",
      jobId: newJob.id,
      filePath: exportHlsPath,
      fileDir: hlsFolderPath,
    });
  } else {
    res.send({
      message: "Please input file path",
      status: "error",
    });
  }
});
/**
 * Get duration of video
 */
router.get("/duration/:videoFile", (req, res) => {
  if (!req.params.videoFile) {
    return res.send("Error");
  }
  const tmpFile = path.join(__dirname, "tmp", req.params.videoFile);

  getVideoDuration(tmpFile)
    .then((duration) => {
      res.send({
        duration: duration,
      });
    })
    .catch((err) => {
      res.send({
        duration: 0,
      });
    });
});

/**
 * Get thumbnail of videos
 */
router.post("/thumbnail/:videoFile", async (req, res) => {
  const filename = uuidv4() + ".png";
  const tmpFile = path.join(__dirname, "tmp", req.params.videoFile);
  const thumbnailPath = path.join(__dirname, "tmp", filename);
  await generateThumbnail(tmpFile, thumbnailPath);
  res.send({
    message: "Generated thumbnail",
    videoFile: req.params.videoFile,
    filename,
  });
});
/**
 * Get video temporarily file
 */
router.get("/tmpfile/:videoFile", (req, res) => {
  const tmpFile = path.join(__dirname, "tmp", req.params.videoFile);

  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  const videoSize = fs.statSync(tmpFile).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(tmpFile, { start, end });
  videoStream.pipe(res);
});

export default router;
