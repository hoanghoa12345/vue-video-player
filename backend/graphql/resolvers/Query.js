import Video from "../../model/video.js";
import { GraphQLError } from "graphql";

const Query = {
  videos: async (root, args, context) => {
    try {
      const videos = await Video.find().populate(["uploadedBy"]);

      return videos;
    } catch (error) {
      throw error;
    }
  },
  video: async (root, args) => {
    const { userId } = args;
    try {
      const video = await Video.findById(args.id).populate([
        {
          path: "uploadedBy",
        },
        {
          path: "comments",
          populate: [
            {
              path: "user",
              model: "User",
            },
            {
              path: "replies",
              populate: {
                path: "user",
                model: "User",
              },
            },
          ],
        },
      ]);
      // console.log("[UserId]:", userId);
      // console.log("[video.likes]:", video.likes);
      if (userId && Array.isArray(video.likes)) {
        const isLike = video.likes.some((like) => {
          if (like.user) return like.user.toString() === userId;
          return false;
        });
        video.isLike = isLike;
      } else {
        video.isLike = false;
      }
      return video;
    } catch (error) {
      throw error;
    }
  },
  videosRelated: async (root, args) => {
    try {
      return Video.find()
        .where("_id")
        .nin(args.id)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate(["uploadedBy"]);
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: "VIDEO_RELATIVE_ERROR",
          message: error.message,
          http: {
            status: 400,
          },
        },
      });
    }
  },
};

export default Query;
