import { Schema, model } from "mongoose";
import Comment from "./comment.js";

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
    comments: [{ type: Schema.ObjectId, ref: "Comment" }],
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

videoSchema.methods.addReplyToComment = async function(
  commentId,
  replyBody,
  userId
) {
  try {
    const targetComment = await Comment.findById(commentId);

    if (!targetComment) {
      throw new Error("Comment not found.");
    }
    targetComment.replies.push({
      body: replyBody,
      video: this._id,
      user: userId,
    });
    return await targetComment.save();
  } catch (error) {
    throw error;
  }
};

videoSchema.methods.addComment = async function(commentBody, userId) {
  try {
    const newComment = new Comment({
      body: commentBody,
      video: this._id,
      user: userId,
      replies: []
    });

    return await newComment.save();
  } catch (error) {
    throw error;
  }
};

const Video = model("Video", videoSchema);

export default Video;
