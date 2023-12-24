import { Schema, model } from "mongoose";

const ReplySchema = new Schema({
  body: { type: String, required: true, maxlength: 1000 },
  user: { type: Schema.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const CommentSchema = new Schema({
  body: { type: String, required: true, maxlength: 1000 },
  video: { type: Schema.ObjectId, ref: "Video" },
  user: { type: Schema.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  replies: [ReplySchema]
});

// CommentSchema.add({ replies: CommentSchema });

const Comment = model("Comment", CommentSchema);

export default Comment
