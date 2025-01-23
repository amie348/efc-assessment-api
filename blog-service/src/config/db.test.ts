import mongoose from "mongoose";
import connectDB from "@config/db";

// Mock console functions
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockExit = jest.spyOn(process, "exit").mockImplementation(((
  code?: number
) => {
  throw new Error(`Process exited with code: ${code}`);
}) as any);

jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

describe("connectDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to MongoDB successfully when MONGO_URI is defined", async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/testdb";
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(undefined);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      "mongodb://localhost:27017/testdb"
    );
    expect(mockConsoleLog).toHaveBeenCalledWith("MongoDB connected");
    expect(mockConsoleError).not.toHaveBeenCalled();
    expect(mockExit).not.toHaveBeenCalled();
  });

  it("should throw an error and exit if MONGO_URI is not defined", async () => {
    delete process.env.MONGO_URI;

    await expect(connectDB()).rejects.toThrow("Process exited with code: 1");

    expect(mongoose.connect).not.toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith(
      "MongoDB connection error: MONGO_URI is not defined in environment variables."
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should handle a connection error and exit the process", async () => {
    process.env.MONGO_URI = "mongodb://invalid_uri";
    const error = new Error("Failed to connect to MongoDB");
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(error);

    await expect(connectDB()).rejects.toThrow("Process exited with code: 1");

    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://invalid_uri");
    expect(mockConsoleError).toHaveBeenCalledWith(
      `MongoDB connection error: ${error.message}`
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should handle unknown errors and exit the process", async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/testdb";
    const unknownError = { some: "unknown error" };
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(unknownError);

    await expect(connectDB()).rejects.toThrow("Process exited with code: 1");

    expect(mongoose.connect).toHaveBeenCalledWith(
      "mongodb://localhost:27017/testdb"
    );
    expect(mockConsoleError).toHaveBeenCalledWith(
      "An unknown error occurred while connecting to MongoDB"
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
