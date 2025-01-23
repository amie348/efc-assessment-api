import request from "supertest";
import express from "express";
import { register, login, getProfile, updateProfile } from "./user.controller";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getSpecificUser,
} from "@services/user.service";

jest.mock("@services/user.service");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/register", register);
app.post("/login", login);
app.get("/profile", getProfile);
app.put("/profile", updateProfile);

describe("User Controller", () => {
  const mockUser = {
    _id: "user123",
    username: "testuser",
    email: "test@example.com",
    password: "hashedpassword",
    token: "testToken",
  };

  const mockUserDetails = {
    _id: "user123",
    username: "testuser",
    email: "test@example.com",
  };

  const mockUpdatedUser = {
    _id: "user123",
    username: "updateduser",
    email: "updated@example.com",
  };

  const mockRequestCookies = { user: { _id: mockUser._id } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("should register a user successfully", async () => {
      (getSpecificUser as jest.Mock).mockResolvedValueOnce(null);
      (registerUser as jest.Mock).mockResolvedValueOnce(mockUser);

      const response = await request(app).post("/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Registration successful");
      expect(response.body.data).toEqual(mockUser);
      expect(getSpecificUser).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(registerUser).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should handle internal server error", async () => {
      (getSpecificUser as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      const response = await request(app).post("/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error occurred");
    });
  });

  describe("POST /login", () => {
    it("should log in a user successfully", async () => {
      (loginUser as jest.Mock).mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login Successful");
      expect(response.body.data).toEqual(mockUser);
      expect(loginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should handle internal server error", async () => {
      (loginUser as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      const response = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error occurred");
    });
  });

  describe("GET /profile", () => {
    // it("should fetch the user profile successfully", async () => {
    //   (getUserProfile as jest.Mock).mockResolvedValueOnce(mockUserDetails);

    //   const response = await request(app)
    //     .get("/profile")
    //     .set("Cookie", [`user=${JSON.stringify(mockRequestCookies.user)}`]);

    //   expect(response.status).toBe(200);
    //   expect(response.body.message).toBe("Profile fetched successfully");
    //   expect(response.body.data).toEqual(mockUserDetails);
    // });

    it("should handle internal server error", async () => {
      (getUserProfile as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      const response = await request(app)
        .get("/profile")
        .set("Cookie", [`user=${JSON.stringify(mockRequestCookies.user)}`]);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error occurred");
    });
  });

  describe("PUT /profile", () => {
    // it("should update the user profile successfully", async () => {
    //   (getUserProfile as jest.Mock).mockResolvedValueOnce(mockUserDetails);
    //   (updateUserProfile as jest.Mock).mockResolvedValueOnce(mockUpdatedUser);

    //   const response = await request(app)
    //     .put("/profile")
    //     .send({ username: "updateduser", email: "updated@example.com" })
    //     .set("Cookie", [`user=${JSON.stringify(mockRequestCookies.user)}`]);

    //   expect(response.status).toBe(200);
    //   expect(response.body.message).toBe("User updated successfully");
    //   expect(response.body.data).toEqual(mockUpdatedUser);
    //   expect(updateUserProfile).toHaveBeenCalledWith(mockUser._id, {
    //     username: "updateduser",
    //     email: "updated@example.com",
    //   });
    // });

    it("should handle internal server error", async () => {
      (getUserProfile as jest.Mock).mockResolvedValueOnce(mockUserDetails);
      (updateUserProfile as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      const response = await request(app)
        .put("/profile")
        .send({ username: "updateduser", email: "updated@example.com" })
        .set("Cookie", [`user=${JSON.stringify(mockRequestCookies.user)}`]);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error occurred");
    });
  });
});
