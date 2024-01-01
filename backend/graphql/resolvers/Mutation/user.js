import { getRefreshToken, getToken } from "../../../utils/helper.js";
import RefreshToken from "../../../model/refreshToken.js";
import User from "../../../model/user.js";

const user = {
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

    const tokenItem = await RefreshToken.findOne({ token: tokenInput });
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
};

export default user;
