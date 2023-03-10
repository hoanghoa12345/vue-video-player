import { Schema, model } from "mongoose";

const videoSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 400 },
    description: { type: String, required: true, maxlength: 1000 },
    uploadedBy: { type: Schema.ObjectId, ref: "User", required: true },
    duration: { type: Number, default: 0 },
    thumbnail: { type: String, required: true },
    views: { type: Number, default: 0 },
    filePath: { type: String, require: true },
    privacy: { type: Number, require: true },
    category: { type: Schema.ObjectId, ref: "Category" },
    comments: [
      {
        body: { type: String, required: true, maxlength: 1000 },
        user: { type: Schema.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
        replies: [
          {
            body: { type: String, required: true, maxlength: 1000 },
            user: { type: Schema.ObjectId, ref: "User" },
            createdAt: { type: Date, default: Date.now },
          },
        ],
      },
    ],
    likes: [
      {
        user: { type: Schema.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Video = model("Video", videoSchema);
export default Video;
