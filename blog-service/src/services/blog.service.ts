import {
  findAllBlogs,
  findBlogById,
  createBlogDocument,
  updateBlogDocument,
  deleteBlogDocument,
} from "@db/blog.model.functions";
import { IBlog, IBlogBasicDetails } from "../types/blog";
import { IUser } from "../types/user";
import mongoose from "mongoose";

// Fetch all blogs
export const getAllBlogs = async (
  query: Record<string, any>
): Promise<IBlog[]> => {
  return await findAllBlogs(query);
};

// Fetch a single blog by ID
export const getBlogById = async (id: string): Promise<IBlog | null> => {
  return await findBlogById(id);
};

// Create a new blog
export const createBlog = async (
  data: IBlogBasicDetails,
  user: IUser
): Promise<IBlog> => {
  const blogData = {
    ...data,
    author: user.username,
    authorId: new mongoose.Types.ObjectId(user._id),
  };
  return await createBlogDocument(blogData);
};

// Update a blog
export const updateBlog = async (
  id: string,
  data: Partial<IBlog>
): Promise<IBlog | null> => {
  return await updateBlogDocument(id, data);
};

// Delete a blog by ID
export const deleteBlog = async (id: string): Promise<IBlog | null> => {
  return await deleteBlogDocument(id);
};
