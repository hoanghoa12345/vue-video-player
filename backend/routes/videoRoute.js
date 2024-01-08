import express from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import multer from "multer";
import { getVideoDuration } from "../utils/ffmpeg.js";
import bree from "../utils/breeWorker.js";
import Job from "../model/job.js";
import { generateThumbnail, getVideoDuration } from "../utils/ffmpeg.js";

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

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
  await generateThumbnail(tmpFile, thumbnailPath, req.body.time);
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

app.get("/video/:videoDir/:videoFile", (req, res) => {
  const dir = req.params.videoDir;
  const file = req.params.videoFile;
  // const videoPath = path.join(dir, file);

  const filePath = path.join(__dirname, "uploads", dir, file);

  fs.readFile(filePath, function (error, content) {
    res.writeHead(200);
    if (error) {
      if (error.code === "ENOENT") {
        res.end("File not found");
      } else {
        res.writeHead(500);
        res.end(
          "Sorry, check with the site admin for error: " + error.code + " ..\n"
        );
        res.end();
      }
    } else {
      res.end(content);
    }
  });
});

app.get("/image/:imageFile", (req, res) => {
  const filePath = path.join(__dirname, "tmp", req.params.imageFile);
  try {
    res.sendFile(filePath);
  } catch (error) {
    throw error;
  }
});

app.post("/api/thumbnail", upload.single("file"), (req, res) => {
  console.log("[info] upload thumbnail");
  if (!req.file) return res.send("Error");
  const originalname = req.file.originalname;
  fs.writeFileSync(path.join(__dirname, "tmp", originalname), req.file.buffer);
  res.send({
    message: "Upload thumbnail successful!",
    originalname,
    fileSize: req.file.size,
  });
});

app.get("/duration/:videoFile", (req, res) => {
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

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("[info] file uploaded: ", req.file.originalname);
  const originalFilename = req.file.originalname;
  const fileExtension = originalFilename.split(".").pop();
  const fileNameOnly = originalFilename.replace(fileExtension, "");
  const filename = fileNameOnly.replace(/(\W+)/gi, "-") + "." + fileExtension;
  const videoData = req.file.buffer;

  const inputFileName = `./tmp/${filename}`;
  const outputFileName = uuidv4();
  const hlsFolderPath = "./uploads/" + outputFileName;
  const exportHlsPath = `./uploads/${outputFileName}/${outputFileName}.m3u8`;

  if (!fs.existsSync(inputFileName)) {
    fs.writeFileSync(inputFileName, videoData);
  }

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

  return res.send({
    message: "File uploaded: " + exportHlsPath,
    filePath: `${outputFileName}/${outputFileName}.m3u8`,
    fileDir: outputFileName,
    tmpFile: filename,
    jobId: newJob.id,
  });
});

app.post("/upload_test", upload.single("file"), async (req, res) => {
  console.log("[info] file uploaded: ", req.file.originalname);

  const videoData = req.file.buffer;

  const inputFileName = `./tmp/${req.file.originalname}`;
  const outputFileName = uuidv4();
  const hlsFolderPath = "./uploads/" + outputFileName;
  const exportHlsPath = `./uploads/${outputFileName}/${outputFileName}.m3u8`;

  if (!fs.existsSync(inputFileName)) {
    fs.writeFileSync(inputFileName, videoData);
  }

  if (!fs.existsSync(hlsFolderPath)) {
    fs.mkdirSync(hlsFolderPath);
  }

  await ffmpeg(inputFileName, { timeout: 432000 })
    .addOptions([
      "-profile:v baseline", // baseline profile (level 3.0) for H264 video codec
      "-level 3.0",
      "-start_number 0", // start the first .ts segment at index 0
      "-hls_time 10", // 10 second segment duration
      "-hls_list_size 0", // Maxmimum number of playlist entries (0 means all entries/infinite)
      "-f hls", // HLS format
    ])
    .output(exportHlsPath)
    .on("end", () => {
      console.log("[info] Finish to make m3u8 file");
    })
    .run();

  return res.send({
    message: "File uploaded: " + exportHlsPath,
    filePath: `${outputFileName}/${outputFileName}.m3u8`,
    fileDir: outputFileName,
  });
});

export default router;
