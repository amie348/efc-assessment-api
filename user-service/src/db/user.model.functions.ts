import bcrypt from "bcryptjs";
import User from "@models/user.model";
import {
  IUser,
  IUserQuery,
  RegisterUserInput,
  UpdateUserProfileInput,
} from "@customeTypes/user";

export const createUser = async ({
  username,
  email,
  password,
}: RegisterUserInput): Promise<IUser> => {
  const user = new User({
    username,
    email,
    password,
  });

  return await user.save();
};

export const findUser = async (
  payload: IUserQuery,
  projection?: string
): Promise<IUser | null> => {
  return await User.findOne(payload).select(projection || "");
};

// Function to update user profile
export const updateUserById = async (
  userId: string,
  payload: UpdateUserProfileInput
): Promise<IUser | null> => {
  if (payload.password) {
    const salt = await bcrypt.genSalt(10);
    payload.password = await bcrypt.hash(payload.password, salt);
  }

  return await User.findByIdAndUpdate(userId, payload, { new: true });
};
