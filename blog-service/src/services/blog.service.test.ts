import mongoose from "mongoose";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "@services/blog.service";
import * as blogModelFunctions from "@db/blog.model.functions";
import { IBlog, IBlogBasicDetails } from "../types/blog";
import { IUser } from "../types/user";

// Mocking the database model functions
jest.mock("@db/blog.model.functions");

describe("Blog Service", () => {
  const mockUser: IUser = {
    _id: "507f191e810c19729de860ea",
    username: "testuser",
    email: "test@example.com",
  };

  const mockBlog = {
    _id: new mongoose.Types.ObjectId(),
    title: "Test Blog",
    content: "This is a test blog.",
    author: "testuser",
    authorId: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IBlog & mongoose.Document; // Typecast to include Document methods

  const blogData: IBlogBasicDetails = {
    title: "New Blog",
    content: "This is a new blog content.",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllBlogs", () => {
    it("should return all blogs successfully", async () => {
      (blogModelFunctions.findAllBlogs as jest.Mock).mockResolvedValue([
        mockBlog,
      ]);

      const result = await getAllBlogs({});
      expect(result).toEqual([mockBlog]);
      expect(blogModelFunctions.findAllBlogs).toHaveBeenCalledWith({});
    });

    it("should throw an error if fetching blogs fails", async () => {
      (blogModelFunctions.findAllBlogs as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch blogs")
      );

      try {
        await getAllBlogs({});
      } catch (error) {
        expect(error).toEqual(new Error("Failed to fetch blogs"));
      }
    });
  });

  describe("getBlogById", () => {
    it("should return a blog by ID", async () => {
      (blogModelFunctions.findBlogById as jest.Mock).mockResolvedValue(
        mockBlog
      );

      const result = await getBlogById(mockBlog._id.toString());
      expect(result).toEqual(mockBlog);
      expect(blogModelFunctions.findBlogById).toHaveBeenCalledWith(
        mockBlog._id.toString()
      );
    });

    it("should return null if the blog is not found", async () => {
      (blogModelFunctions.findBlogById as jest.Mock).mockResolvedValue(null);

      const result = await getBlogById(mockBlog._id.toString());
      expect(result).toBeNull();
      expect(blogModelFunctions.findBlogById).toHaveBeenCalledWith(
        mockBlog._id.toString()
      );
    });

    it("should throw an error if fetching the blog fails", async () => {
      (blogModelFunctions.findBlogById as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch blog")
      );

      try {
        await getBlogById(mockBlog._id.toString());
      } catch (error) {
        expect(error).toEqual(new Error("Failed to fetch blog"));
      }
    });
  });

  describe("createBlog", () => {
    it("should create a blog successfully", async () => {
      (blogModelFunctions.createBlogDocument as jest.Mock).mockResolvedValue(
        mockBlog
      );

      const result = await createBlog(blogData, mockUser);
      expect(result).toEqual(mockBlog);
      expect(blogModelFunctions.createBlogDocument).toHaveBeenCalledWith({
        ...blogData,
        author: mockUser.username,
        authorId: new mongoose.Types.ObjectId(mockUser._id),
      });
    });

    it("should throw an error if blog creation fails", async () => {
      (blogModelFunctions.createBlogDocument as jest.Mock).mockRejectedValue(
        new Error("Failed to create blog")
      );

      try {
        await createBlog(blogData, mockUser);
      } catch (error) {
        expect(error).toEqual(new Error("Failed to create blog"));
      }
    });
  });

  describe("updateBlog", () => {
    it("should update a blog successfully", async () => {
      const updatedData: Partial<IBlog> = { content: "Updated content" };
      (blogModelFunctions.updateBlogDocument as jest.Mock).mockResolvedValue({
        ...mockBlog,
        ...updatedData,
      });

      const result = await updateBlog(mockBlog._id.toString(), updatedData);
      expect(result).toEqual({ ...mockBlog, ...updatedData });
      expect(blogModelFunctions.updateBlogDocument).toHaveBeenCalledWith(
        mockBlog._id.toString(),
        updatedData
      );
    });

    it("should return null if the blog to update does not exist", async () => {
      (blogModelFunctions.updateBlogDocument as jest.Mock).mockResolvedValue(
        null
      );

      const result = await updateBlog(mockBlog._id.toString(), {
        content: "Updated content",
      });
      expect(result).toBeNull();
    });

    it("should throw an error if updating the blog fails", async () => {
      (blogModelFunctions.updateBlogDocument as jest.Mock).mockRejectedValue(
        new Error("Failed to update blog")
      );

      try {
        await updateBlog(mockBlog._id.toString(), {
          content: "Updated content",
        });
      } catch (error) {
        expect(error).toEqual(new Error("Failed to update blog"));
      }
    });
  });

  describe("deleteBlog", () => {
    it("should delete a blog successfully", async () => {
      (blogModelFunctions.deleteBlogDocument as jest.Mock).mockResolvedValue(
        mockBlog
      );

      const result = await deleteBlog(mockBlog._id.toString());
      expect(result).toEqual(mockBlog);
      expect(blogModelFunctions.deleteBlogDocument).toHaveBeenCalledWith(
        mockBlog._id.toString()
      );
    });

    it("should return null if the blog to delete does not exist", async () => {
      (blogModelFunctions.deleteBlogDocument as jest.Mock).mockResolvedValue(
        null
      );

      const result = await deleteBlog(mockBlog._id.toString());
      expect(result).toBeNull();
    });

    it("should throw an error if deleting the blog fails", async () => {
      (blogModelFunctions.deleteBlogDocument as jest.Mock).mockRejectedValue(
        new Error("Failed to delete blog")
      );

      try {
        await deleteBlog(mockBlog._id.toString());
      } catch (error) {
        expect(error).toEqual(new Error("Failed to delete blog"));
      }
    });
  });
});
