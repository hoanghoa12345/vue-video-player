# Video API server

## Introduction

**Video API Server** with **GraphQL** and **MongoDB** database and FFmpeg to processing video.

## Environment setup

Open env file and change following content:

```
MONGODB_URI=
PORT=3000
ALLOW_ORIGIN_URL=
NODE_ENV=development
FFMPEG_PATH=
FFPROBE_PATH=
```

> Please install Mongo database to your device and add connection string to the env file.
> Note: Please install FFmpeg in your system to process video to HLS and add location to env file.

### Install FFMPEG for video processing

```bash
npm install fluent-ffmpeg
```

### NPM Command

- `npm run dev` to start dev server
- `npm run start` to start local server

## Task list

1. Setting up GraphQL with GraphQL Yoga
2. Setup Express JS and MongoDB
3. Implement FFmpeg
4. Create API to upload video
5. Implement generate thumbnail of video automatically
6. Create API for manage the videos
