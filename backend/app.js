import express from "express";
import { createYoga } from "graphql-yoga";
import mongoose from "mongoose";
import graphqlSchema from "./graphql/schema/index.js";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";
import videoRoute from "./routes/videoRoute.js";

const __dirname = path.resolve(path.dirname(""));
dotenv.config();

const app = express();

const allowOrigin = process.env.ALLOW_ORIGIN_URL || "*";
app.use(cors({ origin: allowOrigin, optionsSuccessStatus: 200 }));

const optionsStatic = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html", "css", "js", "ico", "jpg", "jpeg", "png", "svg"],
  index: ["index.html"],
  maxAge: "1m",
  redirect: false,
};

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "../frontend/dist"), optionsStatic)
  );
}

const graphQLServer = createYoga({
  schema: graphqlSchema,
  context: ({ req }) => ({
    token: req.headers.authorization,
  }),
  maskedErrors: {
    isDev: true,
  },
  graphiql: process.env.NODE_ENV === "production" ? false : true,
  logging: false,
});

app.use("/graphql", graphQLServer);

app.use("/api/videos", videoRoute);
if (process.env.NODE_ENV === "production") {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

const mongodbUri = process.env.MONGODB_URI;

const options = {};
const port = process.env.PORT || 3000;

mongoose.set("strictQuery", true);
mongoose
  .connect(mongodbUri, options)
  .then(() =>
    app.listen(port, () =>
      console.log(`GraphQL server is running on port ${port}.`)
    )
  )
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    app.listen(port, () =>
      console.log(`GraphQL server is running on port ${port}.`)
    );
  });
