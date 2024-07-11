import axios from "axios";

export const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

export const getDurationVideo = async (videoPath: string) =>
  axios.get(backendUrl + "/api/video/duration/" + videoPath);

export const postGenerateThumbnail = async (videoPath: string) =>
  axios.post(backendUrl + "/api/video/thumbnail/" + videoPath, {
    time: "00:00:10.000",
  });

export const getTmpVideo = (videoPath: string) =>
  axios.get(backendUrl + "/api/video/tmpfile/" + videoPath);

const request = axios.create({
  baseURL: backendUrl,
});

export const READ_KEY = import.meta.env.VITE_API_READ_KEY || "";

if(!READ_KEY) {
  console.error("Missing READ_KEY");
}

request.interceptors.request.use(
  function (config) {
    if(config.method === "get") {
      config.params["read_key"] = READ_KEY;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default request;