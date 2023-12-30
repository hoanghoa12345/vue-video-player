import { createSchema } from "graphql-yoga";
import graphqlResolvers from "../resolvers/index.js";
import path from "path";
import fs from "fs";
const __dirname = path.resolve();

const schemaPath = path.join(__dirname, "graphql/typeDefs/schema.graphql");
const typeDefs = fs.readFileSync(schemaPath, "utf8");

const graphqlSchema = createSchema({
  typeDefs: typeDefs,
  resolvers: graphqlResolvers,
});

export default graphqlSchema;
