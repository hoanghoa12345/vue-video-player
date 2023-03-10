import User from "../../model/user.js";
import Video from "../../model/video.js";
import { checkAuth, getRefreshToken, getToken } from "../../utils/helper.js";
import RefreshToken from "../../model/refreshToken.js";
import { GraphQLError } from "graphql";

const graphqlResolvers = {
  Query: {
    videos: async (root, args, context) => {
      try {
        const videos = await Video.find().populate(["uploadedBy"]);

        return videos;
      } catch (error) {
        throw error;
      }
    },
    video: async (root, args) => {
      try {
        const video = await Video.findById(args.id).populate(["uploadedBy"]);

        return video;
      } catch (error) {
        throw error;
      }
    },
    videosRelated: async (root, args) => {
      try {
        return Video.find().limit(5).populate(["uploadedBy"]);
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
  },
  Mutation: {
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
        } = args.video;
        const video = new Video({
          title,
          description,
          uploadedBy,
          duration,
          thumbnail,
          filePath,
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
    createUser: async (_, args) => {
      const { name, email, password, roles, image } = args.user;
      try {
        const user = new User({
          name,
          email,
          password,
          roles,
          image,
        });
        const userExists = await User.findOne({ email });

        if (userExists) {
          throw Error("User already exists");
        }

        const newUser = await user.save();
        return {
          _id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          roles: newUser.roles,
          image: newUser.image,
          token: getToken(newUser),
        };
      } catch (error) {
        throw error;
      }
    },
    login: async (root, args, context) => {
      try {
        const { email, password } = args.payload;
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
          const refreshToken = getRefreshToken(user.id);
          const saveToken = new RefreshToken({
            token: refreshToken,
            user: user.id,
          });
          saveToken.save();
          return {
            _id: user.id,
            name: user.name,
            email: user.email,
            password: "",
            roles: user.roles,
            image: user.image,
            token: getToken(user),
            refresh_token: refreshToken,
          };
        } else {
          throw new GraphQLError("Invalid email or password", {
            extensions: {
              code: "BAD_REQUEST",
              message: "Invalid email or password",
              http: {
                status: 400,
              },
            },
          });
        }
      } catch (error) {
        throw error;
      }
    },
    refreshToken: async (root, args, context) => {
      const tokenInput = args.token;

      const tokenItem = RefreshToken.findOne({ token: tokenInput });
      if (tokenItem) {
        return getToken({ _id: tokenItem.user });
      }

      throw Error("Cannot refresh token");
    },
    logout: async (root, args) => {
      const tokenInput = args.token;

      const tokenItem = await RefreshToken.findOne({ token: tokenInput });
      if (tokenItem) {
        await tokenItem.remove();
        return "Token removed";
      }
    },
  },
};

export default graphqlResolvers;
