import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import protect from "@middlewares/auth/auth.middleware";
import { getSpecificUser } from "@services/user.service";
import { getMockReq, getMockRes } from "@jest-mock/express";

// Mock environment variable
process.env.JWT_SECRET =
  "b1a7f43b8a2c4d3c4a3e5e5c2e6f12b7458f4b59e1cd6789f1427b4e0f8c6a1a";

// Mock the getSpecificUser function
jest.mock("@services/user.service", () => ({
  getSpecificUser: jest.fn(),
}));

describe("Auth Middleware - protect", () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = getMockRes().res as unknown as Response;
  });

  it("should authenticate valid token and set user in request", async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string);
    const mockUser = {
      _id: userId,
      username: "testuser",
      email: "test@example.com",
    };

    mockRequest = getMockReq({
      headers: {
        authorization: `Bearer ${token}`,
      },
    }) as unknown as Request;

    (getSpecificUser as jest.Mock).mockResolvedValueOnce(mockUser);

    await protect(mockRequest, mockResponse, nextFunction);

    expect(getSpecificUser).toHaveBeenCalledWith({ _id: userId });
    expect(mockRequest.user).toEqual({
      _id: mockUser._id,
      email: mockUser.email,
      username: mockUser.username,
    });
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should return 401 if no token is provided", async () => {
    mockRequest = getMockReq({ headers: {} }) as unknown as Request;

    await protect(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Not authorized, no token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", async () => {
    mockRequest = getMockReq({
      headers: {
        authorization: "Bearer invalid-token",
      },
    }) as unknown as Request;

    await protect(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Not authorized, token failed",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if Bearer token is malformed", async () => {
    mockRequest = getMockReq({
      headers: {
        authorization: "Bearer",
      },
    }) as unknown as Request;

    await protect(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Not authorized, no token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if user is not found", async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string);

    mockRequest = getMockReq({
      headers: {
        authorization: `Bearer ${token}`,
      },
    }) as unknown as Request;

    (getSpecificUser as jest.Mock).mockResolvedValueOnce(null);

    await protect(mockRequest, mockResponse, nextFunction);

    expect(getSpecificUser).toHaveBeenCalledWith({ _id: userId });
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Not authorized, user not found",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should handle JWT verification errors in the catch block", async () => {
    const token = "malformed-token";

    mockRequest = getMockReq({
      headers: {
        authorization: `Bearer ${token}`,
      },
    }) as unknown as Request;

    jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
      throw new Error("JWT verification error");
    });

    await protect(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Not authorized, token failed",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should handle database errors in the catch block", async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string);

    mockRequest = getMockReq({
      headers: {
        authorization: `Bearer ${token}`,
      },
    }) as unknown as Request;

    (getSpecificUser as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await protect(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Not authorized, token failed",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
