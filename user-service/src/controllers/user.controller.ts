import { Request, Response } from "express";
import { AuthResponse } from "@customeTypes/response";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getSpecificUser,
} from "@services/user.service";
import { IBasicUserDetails } from "@customeTypes/user";
import { ApiGenericResponse } from "@customeTypes/controller";

// Register a new user
export const register = async (
  req: Request,
  res: Response<ApiGenericResponse<AuthResponse>>
): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const isUserExist = await getSpecificUser({ email });

    if (isUserExist) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await registerUser({ username, email, password });
    res.status(201).json({ message: "Registration successful", data: user });
  } catch (error) {
    //    console.error(error);
    res.status(500).json({ message: "Internal server error occurred" });
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response<ApiGenericResponse<AuthResponse>>
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.status(200).json({ message: "Login Successful", data: user });
  } catch (error) {
    //    console.error(error);
    res.status(500).json({ message: "Internal server error occurred" });
  }
};

// Get user profile
export const getProfile = async (
  req: Request,
  res: Response<ApiGenericResponse<IBasicUserDetails>>
): Promise<void> => {
  try {
    const user = await getUserProfile(req.user?._id as string);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Profile fetched successfully", data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error occurred" });
  }
};

// Update user profile
export const updateProfile = async (
  req: Request,
  res: Response<ApiGenericResponse<IBasicUserDetails>>
): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const user = await updateUserProfile(req.user?._id as string, {
      username,
      email,
      password,
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User updated successfully", data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error occurred" });
  }
};
