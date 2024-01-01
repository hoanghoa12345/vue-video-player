import video from "./Mutation/video.js";
import user from "./Mutation/user.js";
import Query from "./Query.js";
import channel from "./Mutation/channel.js";

const graphqlResolvers = {
  Query: Query,
  Mutation: {
    ...user,
    ...video,
    ...channel,
  },
};

export default graphqlResolvers;
