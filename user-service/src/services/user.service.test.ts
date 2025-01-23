import * as userService from "@services/user.service";
import * as userModelFunctions from "@db/user.model.functions";
import * as jwtUtils from "@utils/jwt";
import bcrypt from "bcryptjs";
import {
  IUser,
  RegisterUserInput,
  LoginUserInput,
  UpdateUserProfileInput,
  IBasicUserDetails,
  UserProfile,
} from "@customeTypes/user";

jest.mock("@db/user.model.functions");
jest.mock("@utils/jwt");

describe("User Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user and return the user profile with a token", async () => {
      const mockUser: IUser = {
        _id: "user123",
        username: "testuser",
        email: "testuser@example.com",
        password: "hashedpassword",
        matchPassword: jest.fn(),
      };

      jest.spyOn(userModelFunctions, "createUser").mockResolvedValue(mockUser);
      jest.spyOn(jwtUtils, "generateToken").mockReturnValue("mockToken");

      const input: RegisterUserInput = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };

      const result = await userService.registerUser(input);

      expect(result).toEqual({
        _id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        token: "mockToken",
      });

      expect(userModelFunctions.createUser).toHaveBeenCalledWith(input);
      expect(jwtUtils.generateToken).toHaveBeenCalledWith(mockUser._id);
    });

    it("should throw an error if user creation fails", async () => {
      jest
        .spyOn(userModelFunctions, "createUser")
        .mockRejectedValue(new Error("User creation failed"));

      const input: RegisterUserInput = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };

      await expect(userService.registerUser(input)).rejects.toThrow(
        "User creation failed"
      );
    });
  });

  describe("loginUser", () => {
    it("should authenticate a user and return the user profile with a token", async () => {
      const mockUser: IUser = {
        _id: "user123",
        username: "testuser",
        email: "testuser@example.com",
        password: "hashedpassword",
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(mockUser);
      jest.spyOn(jwtUtils, "generateToken").mockReturnValue("mockToken");

      const input: LoginUserInput = {
        email: "testuser@example.com",
        password: "password123",
      };

      const result = await userService.loginUser(input);

      expect(result).toEqual({
        _id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        token: "mockToken",
      });

      expect(userModelFunctions.findUser).toHaveBeenCalledWith({
        email: input.email,
      });
      expect(mockUser.matchPassword).toHaveBeenCalledWith(input.password);
    });

    it("should return null if the user does not exist", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(null);

      const input: LoginUserInput = {
        email: "testuser@example.com",
        password: "password123",
      };

      const result = await userService.loginUser(input);

      expect(result).toBeNull();
    });

    it("should return null if the password is incorrect", async () => {
      const mockUser: IUser = {
        _id: "user123",
        username: "testuser",
        email: "testuser@example.com",
        password: "hashedpassword",
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(mockUser);

      const input: LoginUserInput = {
        email: "testuser@example.com",
        password: "wrongpassword",
      };

      const result = await userService.loginUser(input);

      expect(result).toBeNull();
    });
  });

  describe("getUserProfile", () => {
    it("should return the user profile without sensitive data", async () => {
      const mockUser: IUser = {
        _id: "user123",
        username: "testuser",
        email: "testuser@example.com",
        password: "hashedpassword",
        matchPassword: jest.fn(),
      };

      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(mockUser);

      const result = await userService.getUserProfile("user123");

      expect(result).toEqual({
        _id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        password: mockUser.password,
      });
    });

    it("should return null if the user is not found", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(null);

      const result = await userService.getUserProfile("user123");

      expect(result).toBeNull();
    });
  });

  describe("updateUserProfile", () => {
    it("should update the user profile and return basic details", async () => {
      const mockUpdatedUser: IUser = {
        _id: "user123",
        username: "updatedUsername",
        email: "updatedEmail@example.com",
        password: "hashedpassword",
        matchPassword: jest.fn(),
      };

      jest
        .spyOn(userModelFunctions, "updateUserById")
        .mockResolvedValue(mockUpdatedUser);

      const payload: UpdateUserProfileInput = {
        username: "updatedUsername",
        email: "updatedEmail@example.com",
      };

      const result = await userService.updateUserProfile("user123", payload);

      expect(result).toEqual({
        _id: "user123",
        username: "updatedUsername",
        email: "updatedEmail@example.com",
      });
    });

    it("should return null if the user is not found", async () => {
      jest.spyOn(userModelFunctions, "updateUserById").mockResolvedValue(null);

      const payload: UpdateUserProfileInput = {
        username: "updatedUsername",
        email: "updatedEmail@example.com",
      };

      const result = await userService.updateUserProfile("user123", payload);

      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user by email", async () => {
      const mockUser: IUser = {
        _id: "user123",
        username: "testuser",
        email: "testuser@example.com",
        password: "hashedpassword",
        matchPassword: jest.fn(),
      };

      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(mockUser);

      const result = await userService.getSpecificUser({
        email: "testuser@example.com",
      });

      expect(result).toEqual(mockUser);
    });

    it("should return null if no user is found", async () => {
      jest.spyOn(userModelFunctions, "findUser").mockResolvedValue(null);

      const result = await userService.getSpecificUser({
        email: "testuser@example.com",
      });

      expect(result).toBeNull();
    });
  });
});
