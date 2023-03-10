import { parentPort } from "node:worker_threads";
import process from "node:process";
import { transcodeVideoToHls } from "../utils/ffmpeg.js";
import Job from "../model/job.js";
import mongoose from "mongoose";
import fs from "fs";

const mongodbUri = process.env.MONGODB_URI;

(async () => {
  console.log("==> Execute Hls transcode worker");
  await mongoose.connect(mongodbUri);
  const job = await Job.findOne({
    jobType: "hls-transcode",
    status: "wait",
  }).sort({ createdAt: -1 });

  console.log("Job", job);

  if (job) {
    const inputFileName = job.inputData.inputFileName;
    const exportHlsPath = job.outputData.exportHlsPath;
    const hlsFolderPath = job.outputData.hlsFolderPath;

    if (!fs.existsSync(hlsFolderPath)) {
      console.log("** Make new dir **");
      fs.mkdirSync(hlsFolderPath);
    }
    console.log("==> Start transcode video");
    await transcodeVideoToHls(inputFileName, exportHlsPath);
    console.log("==> End transcode video");
    job.status = "done";
    await job.save();
  }
  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage("done");
  // eslint-disable-next-line unicorn/no-process-exit
  else process.exit(0);
})();
