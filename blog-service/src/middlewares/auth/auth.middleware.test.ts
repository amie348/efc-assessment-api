import request from "supertest";
import express from "express";
import axios from "axios";
import authMiddleware from "@middlewares/auth/auth.middleware";
import { IUser } from "@customeTypes/user";

// Create a mock Express app for testing
const app = express();
app.use(express.json());
app.use(authMiddleware); // Apply the authMiddleware to all routes
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Authorized" });
});

jest.mock("axios");

describe("Auth Middleware", () => {
  let mockAxios: jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockAxios = axios as jest.Mocked<typeof axios>;
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/test");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should return 401 if the token is invalid", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("Authentication failed"));

    const res = await request(app)
      .get("/test")
      .set("Authorization", "Bearer invalid.token");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Authentication failed");
  });

  it("should attach user to the request and allow the request to pass if the token is valid", async () => {
    const mockUser: IUser = {
      _id: "507f191e810c19729de860ea",
      email: "test@example.com",
      username: "testuser",
    };
    mockAxios.get.mockResolvedValueOnce({
      data: { data: mockUser },
    });

    const res = await request(app)
      .get("/test")
      .set("Authorization", "Bearer valid.token");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Authorized");
  });
});
