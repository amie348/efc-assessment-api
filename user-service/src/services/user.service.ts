import {
  IUser,
  RegisterUserInput,
  LoginUserInput,
  UpdateUserProfileInput,
  IBasicUserDetails,
  UserProfile,
} from "@customeTypes/user";
import { generateToken } from "@utils/jwt";
import { createUser, findUser, updateUserById } from "@db/user.model.functions";
import bcrypt from "bcryptjs";

// Register a new user
export const registerUser = async ({
  username,
  email,
  password,
}: RegisterUserInput): Promise<UserProfile> => {
  try {
    const user = await createUser({
      username,
      email,
      password,
    });

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    };
  } catch (error) {
    throw error;
  }
};

// Authenticate user and return token
export const loginUser = async ({
  email,
  password,
}: LoginUserInput): Promise<UserProfile | null> => {
  try {
    const user = await findUser({ email });
    if (user && user.matchPassword && (await user.matchPassword(password))) {
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<IUser | null> => {
  try {
    const user = await findUser({ _id: userId }, "-password -__v");

    if (user) {
      return {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        password: user.password,
      };
    }

    return null;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  payload: UpdateUserProfileInput
): Promise<IBasicUserDetails | null> => {
  try {
    const updatedUser = await updateUserById(userId, payload);

    if (!updatedUser) {
      return null;
    }

    return {
      _id: userId,
      username: updatedUser.username,
      email: updatedUser.email,
    };
  } catch (error) {
    throw error;
  }
};

export const getSpecificUser = async (payload: {
  _id?: string;
  email?: string;
}): Promise<IUser | null> => {
  try {
    return await findUser(payload, "-password -__v -createdAt -updatedAt");
  } catch (error) {
    throw error;
  }
};
