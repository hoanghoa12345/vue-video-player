import { checkAuth } from "../../../utils/helper.js";
import Video from "../../../model/video.js";

const video = {
  createVideo: async (root, args, context) => {
    const user = checkAuth(context.token);
    console.log("user", user);
    try {
      const {
        title,
        description,
        uploadedBy,
        duration,
        thumbnail,
        filePath,
        privacy,
      } = args.video;
      const video = new Video({
        title,
        description,
        uploadedBy,
        duration,
        thumbnail,
        filePath,
        privacy,
      });
      const newVideo = await video.save();
      return newVideo;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: "CREATE_VIDEO_ERROR",
          message: error.message,
          http: {
            status: 400,
          },
        },
      });
    }
  },
  updateVideoView: async (root, args) => {
    const id = args.id;
    try {
      const video = await Video.findById(id);
      let currentView = video.views;
      video.views = currentView + 1;
      const updateVideo = await video.save();
      return updateVideo;
    } catch (error) {
      throw error;
    }
  },
  updateVideo: async (root, args, context) => {
    const user = checkAuth(context.token);
    const { id } = args;
    const {
      title,
      description,
      uploadedBy,
      duration,
      thumbnail,
      filePath,
      privacy,
    } = args.video;

    const video = Video.findById(id);
    if (!video) {
      return new GraphQLError("Video not found", {
        extensions: {
          code: "VIDEO_NOT_FOUND",
          message: "Video not found",
          http: {
            status: 400,
          },
        },
      });
    }
    const updateData = {
      title: title || video.title,
      description: description || video.description,
      filePath: filePath || video.filePath,
      thumbnail: thumbnail || video.thumbnail,
      privacy: privacy || video.privacy,
    };

    return Video.findByIdAndUpdate(id, updateData, { new: true });
  },
  createComment: async (root, args, context) => {
    const user = checkAuth(context.token);
    if (!user._id)
      return new GraphQLError("User not found", {
        extensions: {
          code: "USER_NOT_FOUND",
          message: "User not found",
          http: {
            status: 400,
          },
        },
      });
    const { videoId, comment } = args;
    const video = await Video.findById(videoId);
    if (!video) {
      return new GraphQLError("Video not found", {
        extensions: {
          code: "VIDEO_NOT_FOUND",
          message: "Video not found",
          http: {
            status: 400,
          },
        },
      });
    }
    return await video.addComment(comment, user._id);
  },
  replyComment: async (root, args, context) => {
    const user = checkAuth(context.token);
    if (!user._id)
      return new GraphQLError("User not found", {
        extensions: {
          code: "USER_NOT_FOUND",
          message: "User not found",
          http: {
            status: 400,
          },
        },
      });
    const { videoId, commentId, reply } = args;
    const video = await Video.findById(videoId);
    if (!video) {
      return new GraphQLError("Video not found", {
        extensions: {
          code: "VIDEO_NOT_FOUND",
          message: "Video not found",
          http: {
            status: 400,
          },
        },
      });
    }
    return await video.addReplyToComment(commentId, reply, user._id);
  },
  likeVideo: async (root, args, context) => {
    const user = checkAuth(context.token);
    if (!user._id)
      return new GraphQLError("User not found", {
        extensions: {
          code: "USER_NOT_FOUND",
          message: "User not found",
          http: {
            status: 400,
          },
        },
      });
    const { videoId } = args;
    const video = await Video.findById(videoId);
    if (!video) {
      return new GraphQLError("Video not found", {
        extensions: {
          code: "VIDEO_NOT_FOUND",
          message: "Video not found",
          http: {
            status: 400,
          },
        },
      });
    }
    return await video.like(user._id);
  },
};

export default video;
