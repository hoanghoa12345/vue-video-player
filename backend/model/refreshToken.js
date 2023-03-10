import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    token: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);
const RefreshToken = model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
