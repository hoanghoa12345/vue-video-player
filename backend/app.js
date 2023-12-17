import express from "express";
import { createYoga } from "graphql-yoga";
import mongoose from "mongoose";
import graphqlSchema from "./graphql/schema/index.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import * as dotenv from "dotenv";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { getVideoDuration } from "./utils/ffmpeg.js";
import bree from "./utils/breeWorker.js";
import Job from "./model/job.js";
import videoRoute from "./routes/videoRoute.js";

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});
const __dirname = path.resolve(path.dirname(""));
dotenv.config();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: function (req, res) {
    res.status(429).send({
      status: 429,
      message: "Too many requests, please try again later.!",
    });
  },
});

const app = express();

const allowOrigin = /*process.env.ALLOW_ORIGIN_URL ||*/ "*";
app.use(cors({ origin: allowOrigin, optionsSuccessStatus: 200 }));
// Apply the rate limiting middleware to all requests
app.use(limiter);

const graphQLServer = createYoga({
  schema: graphqlSchema,
  context: ({ req }) => ({
    token: req.headers.authorization,
  }),
  maskedErrors: {
    isDev: true,
  },
  graphiql: true,
  logging: false,
});

app.use("/graphql", graphQLServer);

app.post("/api/upload_test", upload.single("file"), async (req, res) => {
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

app.post("/api/upload", upload.single("file"), async (req, res) => {
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

app.use("/api/video", videoRoute);

const mongodbUri = process.env.MONGODB_URI;

const options = {};
const port = process.env.PORT || 4000;

mongoose
  .connect(mongodbUri, options)
  .then(() =>
    app.listen(port, () =>
      console.log(`GraphQL server is running on port ${port}.`)
    )
  )
  .catch((error) => {
    throw error;
  });
