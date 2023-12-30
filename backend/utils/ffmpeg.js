import ffmpeg from "fluent-ffmpeg";
import * as dotenv from "dotenv";

dotenv.config();
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);

async function generateThumbnail(
  inputFileName,
  outputFileName,
  currentTime = "00:00:01.000"
) {
  const options = ["-ss", currentTime, "-vframes", "1"];
  await ffmpeg(inputFileName, { timeout: 432000 })
    // .addOptions(["-ss 00:00:01.000", "-vframes 1"])
    .addOptions(options)
    .output(outputFileName)
    .on("end", () => {
      console.log("[info] Finish to make thumbnail");
    })
    .run();

  return outputFileName;
}

function getVideoDuration(inputFileName) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputFileName, function (err, metadata) {
      if (!err) {
        console.log("[info] Duration video: ", metadata.format.duration);
        resolve(metadata.format.duration);
      } else {
        reject(err);
      }
    });
  });
}

function transcodeVideoToHls(inputFileName, exportHlsPath) {
  return new Promise(async (resolve, reject) => {
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
        resolve();
      })
      .run();
  });
}

export { generateThumbnail, getVideoDuration, transcodeVideoToHls };
