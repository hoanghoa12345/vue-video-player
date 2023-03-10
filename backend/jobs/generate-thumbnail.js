import { parentPort } from "node:worker_threads";
import process from "node:process";
import mongoose from "mongoose";
import Job from "../model/job.js";
import { generateThumbnail } from "../utils/ffmpeg.js";

const mongodbUri = process.env.MONGODB_URI;

(async () => {
  console.log("==> Generate thumbnail video");
  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage("done");
  // eslint-disable-next-line unicorn/no-process-exit
  else process.exit(0);
})();
