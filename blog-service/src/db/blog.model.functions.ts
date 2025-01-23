import Blog from "@models/blog.model";
import { IBlog, IBlogDetails } from "../types/blog";

// Fetch all blogs based on query parameters
export const findAllBlogs = async (
  query: Record<string, any>
): Promise<IBlog[]> => {
  return await Blog.find(query);
};

// Fetch a single blog by ID
export const findBlogById = async (id: string): Promise<IBlog | null> => {
  return await Blog.findById(id);
};

// Create a new blog
export const createBlogDocument = async (
  data: IBlogDetails
): Promise<IBlog> => {
  return await Blog.create(data);
};

// Update an existing blog
export const updateBlogDocument = async (
  id: string,
  data: Partial<IBlog>
): Promise<IBlog | null> => {
  return await Blog.findByIdAndUpdate(id, data, { new: true });
};

// Delete a blog by ID
export const deleteBlogDocument = async (id: string): Promise<IBlog | null> => {
  return await Blog.findByIdAndDelete(id);
};
