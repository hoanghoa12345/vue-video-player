import Bree from "bree";

const bree = new Bree({
  jobs: [
    {
      name: "hls-transcode",
    },
    {
      name: "generate-thumbnail",
    },
    {
      name: "get-duration",
    },
  ],
});

export default bree;
