import { Request, Response } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import {
  fetchAllBlogsController,
  fetchBlogByIdController,
  addBlogController,
  modifyBlogController,
  removeBlogController,
} from "@controllers/blog.controller";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "@services/blog.service";
import { IUser } from "@customeTypes/user";
import { IBlog } from "@customeTypes/blog";

// Mock all the service functions
jest.mock("@services/blog.service");

const userId = new mongoose.Types.ObjectId();
const blogId = new mongoose.Types.ObjectId();

describe("Blog Controllers", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mongoServer: MongoMemoryServer;

  const mockUser: IUser = {
    _id: userId.toString(),
    username: "testuser",
    email: "test@example.com",
  };

  const mockBlog: IBlog = {
    _id: blogId,
    title: "Test Blog",
    content: "Test Content",
    author: mockUser.username,
    authorId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IBlog & mongoose.Document;

  beforeAll(async () => {
    // Create MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("fetchAllBlogsController", () => {
    beforeEach(() => {
      mockRequest = {
        query: {},
      };
    });

    it("should return all blogs successfully", async () => {
      const mockBlogs = [mockBlog];
      (getAllBlogs as jest.Mock).mockResolvedValueOnce(mockBlogs);

      await fetchAllBlogsController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Blogs fetched successfully",
        data: mockBlogs,
      });
      expect(getAllBlogs).toHaveBeenCalledWith({});
    });

    it("should handle errors and return 500", async () => {
      (getAllBlogs as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

      await fetchAllBlogsController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("fetchBlogByIdController", () => {
    beforeEach(() => {
      mockRequest = {
        params: { id: mockBlog._id.toString() },
      };
    });

    it("should return a blog by id successfully", async () => {
      (getBlogById as jest.Mock).mockResolvedValueOnce(mockBlog);

      await fetchBlogByIdController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Blog fetched successfully",
        data: mockBlog,
      });
      expect(getBlogById).toHaveBeenCalledWith(mockBlog._id.toString());
    });

    it("should return 404 when blog not found", async () => {
      (getBlogById as jest.Mock).mockResolvedValueOnce(null);

      await fetchBlogByIdController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Blog not found",
      });
    });

    it("should handle errors and return 500", async () => {
      (getBlogById as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

      await fetchBlogByIdController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("addBlogController", () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          title: mockBlog.title,
          content: mockBlog.content,
        },
        user: mockUser,
      };
    });

    it("should create a blog successfully", async () => {
      (createBlog as jest.Mock).mockResolvedValueOnce(mockBlog);

      await addBlogController(mockRequest as Request, mockResponse as Response);

      expect(createBlog).toHaveBeenCalledWith(mockRequest.body, mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Blog created successfully",
        data: mockBlog,
      });
    });

    it("should handle errors and return 500", async () => {
      (createBlog as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

      await addBlogController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("modifyBlogController", () => {
    beforeEach(() => {
      mockRequest = {
        params: { id: mockBlog._id.toString() },
        body: { title: "Updated Title" },
      };
    });

    it("should update a blog successfully", async () => {
      const updatedBlog = { ...mockBlog, title: "Updated Title" };
      (updateBlog as jest.Mock).mockResolvedValueOnce(updatedBlog);

      await modifyBlogController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(updateBlog).toHaveBeenCalledWith(
        mockRequest.params?.id as string,
        mockRequest.body
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Blog updated successfully",
        data: updatedBlog,
      });
    });

    it("should return 404 when blog not found", async () => {
      (updateBlog as jest.Mock).mockResolvedValueOnce(null);

      await modifyBlogController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Blog not found",
      });
    });

    it("should handle errors and return 500", async () => {
      (updateBlog as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

      await modifyBlogController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("removeBlogController", () => {
    beforeEach(() => {
      mockRequest = {
        params: { id: mockBlog._id.toString() },
      };
    });

    it("should delete a blog successfully", async () => {
      (deleteBlog as jest.Mock).mockResolvedValueOnce(true);

      await removeBlogController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(deleteBlog).toHaveBeenCalledWith(mockRequest.params?.id as string);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Blog deleted successfully",
      });
    });

    it("should return 404 when blog not found", async () => {
      (deleteBlog as jest.Mock).mockResolvedValueOnce(null);

      await removeBlogController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Blog not found",
      });
    });

    it("should handle errors and return 500", async () => {
      (deleteBlog as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

      await removeBlogController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });
});
