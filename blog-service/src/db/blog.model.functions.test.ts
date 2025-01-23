import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Blog from "@models/blog.model";
import {
  findAllBlogs,
  findBlogById,
  createBlogDocument,
  updateBlogDocument,
  deleteBlogDocument,
} from "./blog.model.functions";
import { IBlogDetails, IBlog } from "../types/blog";

let mongoServer: MongoMemoryServer;
let blogId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const blogData: IBlogDetails = {
    title: "Test Blog",
    content: "This is a it blog content.",
    tags: ["it"],
    author: "John Doe",
    authorId: new mongoose.Types.ObjectId(),
  };
  const blog = await createBlogDocument(blogData);
  blogId = blog._id.toString();
});

afterEach(async () => {
  await Blog.deleteMany({});
});

describe("Blog Model Functions", () => {
  it("should fetch all blogs", async () => {
    const blogs = await findAllBlogs({});
    expect(blogs).toHaveLength(1);
    expect(blogs[0]).toHaveProperty("title", "Test Blog");
  });

  it("should fetch a blog by ID", async () => {
    const blog = await findBlogById(blogId);
    expect(blog).not.toBeNull();
    expect(blog?.title).toBe("Test Blog");
  });

  it("should return null when fetching a blog with invalid ID", async () => {
    const invalidId = "60d5f3a1b8d10bfcf8d9f112";
    const blog = await findBlogById(invalidId);
    expect(blog).toBeNull();
  });

  it("should create a new blog", async () => {
    const newBlogData: IBlogDetails = {
      title: "New Blog",
      content: "New blog content",
      tags: ["new", "blog"],
      author: "Jane Doe",
      authorId: new mongoose.Types.ObjectId(),
    };
    const newBlog = await createBlogDocument(newBlogData);
    expect(newBlog).toHaveProperty("title", "New Blog");
    expect(newBlog).toHaveProperty("author", "Jane Doe");
    expect(newBlog.tags).toEqual(["new", "blog"]);
  });

  it("should update an existing blog", async () => {
    const updatedBlogData = { title: "Updated Blog Title" };
    const updatedBlog = await updateBlogDocument(blogId, updatedBlogData);
    expect(updatedBlog).not.toBeNull();
    expect(updatedBlog?.title).toBe("Updated Blog Title");
  });

  it("should return null when updating a blog with invalid ID", async () => {
    const invalidId = "60d5f3a1b8d10bfcf8d9f112";
    const updatedBlog = await updateBlogDocument(invalidId, {
      title: "New Title",
    });
    expect(updatedBlog).toBeNull();
  });

  it("should delete a blog by ID", async () => {
    const deletedBlog = await deleteBlogDocument(blogId);
    expect(deletedBlog).not.toBeNull();
    expect(deletedBlog?.title).toBe("Test Blog");

    // Verify if the blog is deleted
    const blog = await findBlogById(blogId);
    expect(blog).toBeNull();
  });

  it("should return null when deleting a blog with invalid ID", async () => {
    const invalidId = "60d5f3a1b8d10bfcf8d9f112";
    const deletedBlog = await deleteBlogDocument(invalidId);
    expect(deletedBlog).toBeNull();
  });
});
