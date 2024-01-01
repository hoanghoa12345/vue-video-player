import { GraphQLError } from "graphql";
import Channel from "../../../model/channel.js";
import { checkAuth } from "../../../utils/helper.js";

const channel = {
  createChannel: async (root, args, context) => {
    try {
      const user = checkAuth(context.token);
      const { name, description, coverImage, avatarImage } = args.channelInput;

      const channel = new Channel({
        name,
        description,
        coverImage,
        avatarImage,
        members: [],
        createdAt: new Date().toISOString(),
        createdBy: user.id,
      });

      return await channel.save();
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: "BAD_USER_INPUT",
          message: error.message,
          http: {
            status: 400,
          },
        },
      });
    }
  },
};

export default channel;
