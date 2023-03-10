import { buildSchema } from "graphql";
import { createSchema } from "graphql-yoga";
import graphqlResolvers from "../resolvers/index.js";

const graphqlSchema = createSchema({
  typeDefs: /* GraphQL */ `
    type Video {
      _id: ID!
      title: String!
      description: String!
      uploadedBy: User!
      filePath: String!
      duration: String!
      privacy: Int!
      thumbnail: String!
      createdAt: String!
      category: Category!
      views: Int!
    }
    type User {
      _id: ID!
      name: String!
      email: String!
      password: String!
      roles: [String!]!
      profilePic: String
      token: String!
      refresh_token: String!
    }

    type Category {
      _id: ID!
      name: String!
      createdAt: String!
    }

    input UserInput {
      name: String!
      email: String!
      password: String!
      roles: [String!]!
      profilePic: String!
    }

    input VideoInput {
      title: String!
      description: String!
      filePath: String!
      duration: String!
      thumbnail: String!
      uploadedBy: String!
    }

    type Query {
      videos: [Video!]
      video(id: String): Video!
      videosRelated(id: String): [Video!]
    }

    input LoginPayload {
      email: String!
      password: String!
    }

    type Mutation {
      createVideo(video: VideoInput): Video
      updateVideoView(id: ID): Video
      createUser(user: UserInput): User
      login(payload: LoginPayload): User
      refreshToken(token: String): String
      logout(token: String): String
    }

    schema {
      query: Query
      mutation: Mutation
    }
  `,
  resolvers: graphqlResolvers,
});

export default graphqlSchema;
