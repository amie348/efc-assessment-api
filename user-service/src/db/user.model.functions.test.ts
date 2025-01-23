import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getSpecificUser,
} from "@services/user.service";
import * as userModelFunctions from "@db/user.model.functions";
import { generateToken } from "@utils/jwt";
import bcrypt from "bcryptjs";

// Mock dependencies
jest.mock("@db/user.model.functions");
jest.mock("@utils/jwt", () => ({
  generateToken: jest.fn(),
}));

describe("User Service", () => {
  const mockUser = {
    _id: "user123",
    username: "testuser",
    email: "test@example.com",
    password: "hashedPassword",
    matchPassword: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should create a user and return their profile with a token", async () => {
      const createUserMock = jest
        .spyOn(userModelFunctions, "createUser")
        .mockResolvedValue(mockUser);

      (generateToken as jest.Mock).mockReturnValue("testToken");

      const input = {
        username: "testuser",
        email: "test@example.com",
        password: "testPassword",
      };

      const result = await registerUser(input);

      expect(createUserMock).toHaveBeenCalledWith(input);
      expect(generateToken).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual({
        _id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        token: "testToken",
      });
    });

    it("should throw an error if creating a user fails", async () => {
      jest
        .spyOn(userModelFunctions, "createUser")
        .mockRejectedValue(new Error("Error creating user"));

      await expect(
        registerUser({
          username: "testuser",
          email: "test@example.com",
          password: "testPassword",
        })
      ).rejects.toThrow("Error creating user");
    });
  });

  describe("loginUser", () => {
    it("should authenticate a user and return their profile with a token", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(mockUser);
      mockUser.matchPassword.mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue("testToken");

      const result = await loginUser({
        email: "test@example.com",
        password: "testPassword",
      });

      expect(userModelFunctions.findUser).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(mockUser.matchPassword).toHaveBeenCalledWith("testPassword");
      expect(generateToken).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual({
        _id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        token: "testToken",
      });
    });

    it("should return null if user is not found", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(null);

      const result = await loginUser({
        email: "nonexistent@example.com",
        password: "testPassword",
      });

      expect(result).toBeNull();
    });

    it("should return null if password does not match", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(mockUser);
      mockUser.matchPassword.mockResolvedValue(false);

      const result = await loginUser({
        email: "test@example.com",
        password: "wrongPassword",
      });

      expect(result).toBeNull();
    });
  });

  describe("getUserProfile", () => {
    it("should return user details excluding password", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(mockUser);

      const result = await getUserProfile("user123");

      expect(userModelFunctions.findUser).toHaveBeenCalledWith(
        { _id: "user123" },
        "-password -__v"
      );
      expect(result).toEqual({
        _id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        password: mockUser.password,
      });
    });

    it("should return null if user is not found", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(null);

      const result = await getUserProfile("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("updateUserProfile", () => {
    it("should update a user's profile and return basic details", async () => {
      const updatedUser = {
        _id: "mockUserId123",
        username: "mockUpdatedUsername",
        email: "mockUpdatedEmail@example.com",
        password: "mockHashedPassword",
      };

      jest
        .spyOn(userModelFunctions, "updateUserById")
        .mockResolvedValue(updatedUser);

      const result = await updateUserProfile("user123", {
        username: "mockUpdatedUsername",
        email: "mockUpdatedEmail@example.com",
        password: "mockHashedPassword",
      });

      expect(userModelFunctions.updateUserById).toHaveBeenCalledWith(
        "user123",
        {
          username: "mockUpdatedUsername",
          email: "mockUpdatedEmail@example.com",
          password: "mockHashedPassword",
        }
      );
      expect(result).toEqual({
        _id: "user123",
        username: "mockUpdatedUsername",
        email: "mockUpdatedEmail@example.com",
      });
    });

    it("should return null if user update fails", async () => {
      jest.spyOn(userModelFunctions, "updateUserById").mockResolvedValue(null);

      const result = await updateUserProfile("user123", {
        username: "newuser",
        password: "njkdsnck",
      });

      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user by their email", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(mockUser);

      const result = await getSpecificUser({ email: "test@example.com" });

      expect(userModelFunctions.findUser).toHaveBeenCalledWith(
        {
          email: "test@example.com",
        },
        "-password -__v -createdAt -updatedAt"
      );
      expect(result).toEqual(mockUser);
    });

    it("should return null if no user is found", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(null);

      const result = await getSpecificUser({
        email: "nonexistent@example.com",
      });

      expect(result).toBeNull();
    });
  });
});
