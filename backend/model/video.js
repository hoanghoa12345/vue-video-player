import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
  body: { type: String, required: true, maxlength: 1000 },
  user: { type: Schema.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

CommentSchema.add({ replies: CommentSchema });

const Comment = model("Comment", CommentSchema);

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
    comments: [CommentSchema],
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

videoSchema.methods.addReplyToComment = async function (
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
      user: userId,
    });
    return await targetComment.save();
  } catch (error) {
    throw error;
  }
};

videoSchema.methods.addComment = async function (commentBody, userId) {
  try {
    const newComment = new Comment({
      body: commentBody,
      user: userId,
    });

    this.comments.push(newComment);
    return await this.save();
  } catch (error) {
    throw error;
  }
};

const Video = model("Video", videoSchema);

export default Video;
