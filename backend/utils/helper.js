import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
const JWT_SECRET = "videoapiserver";
const JWT_REFRESH_SECRET = "refreshtokenvideo";
const getToken = (user) =>
  jwt.sign(
    {
      _id: user._id,
    },
    JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );
const getRefreshToken = (id) =>
  jwt.sign({ userId: id }, JWT_REFRESH_SECRET, { expiresIn: "4h" });

const checkRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw error;
  }
};

const checkAuth = (token) => {
  if (token) {
    const onlyToken = token.slice(7, token.length);
    try {
      return jwt.verify(onlyToken, JWT_SECRET);
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: "JWT_TOKEN_EXPIRED",
          message: error.message,
          http: {
            status: 401,
            headers: {
              "X-Refresh-Token": "null",
            },
          },
        },
      });
    }
  }
  throw new GraphQLError("Token is not supplied", {
    extensions: {
      code: "NOT_TOKEN_SUPPLIED",
      message: "Token is not supplied",
      http: {
        status: 401,
        headers: {
          "X-Refresh-Token": "null",
        },
      },
    },
  });
};
export { getToken, JWT_SECRET, checkAuth, getRefreshToken, checkRefreshToken };
