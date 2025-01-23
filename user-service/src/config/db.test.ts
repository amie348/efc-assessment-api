import mongoose from "mongoose";
import connectDB from "./db";

jest.mock("mongoose");

describe("connectDB", () => {
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  const processExitSpy = jest
    .spyOn(process, "exit")
    .mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`Process exited with code: ${code}`);
    });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to MongoDB successfully", async () => {
    // Mock the successful connection
    (mongoose.connect as jest.Mock).mockResolvedValueOnce({});

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      process.env.MONGO_URI as string
    );
    expect(consoleLogSpy).toHaveBeenCalledWith("MongoDB connected");
  });

  it("should handle connection failure and exit the process", async () => {
    // Mock a failed connection
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(
      new Error("Connection failed")
    );

    await expect(connectDB()).rejects.toThrow("Process exited with code: 1");

    expect(mongoose.connect).toHaveBeenCalledWith(
      process.env.MONGO_URI as string
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
