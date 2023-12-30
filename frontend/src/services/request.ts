import { backendUrl } from "@/services/api";
import axios from "axios";

export const getDurationVideo = async (videoPath: string) =>
  axios.get(backendUrl + "/api/video/duration/" + videoPath);

export const postGenerateThumbnail = async (videoPath: string) =>
  axios.post(backendUrl + "/api/video/thumbnail/" + videoPath, {
    time: "00:00:10.000",
  });

export const getTmpVideo = (videoPath: string) =>
  axios.get(backendUrl + "/api/video/tmpfile/" + videoPath);
