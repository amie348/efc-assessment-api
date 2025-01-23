import { Request, Response } from "express";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "@services/blog.service";
import { IUser } from "../types/user";
import { ApiGenericResponse } from "../types/api-generic-response";
import { IBlog } from "../types/blog";

export const fetchAllBlogsController = async (
  req: Request,
  res: Response<ApiGenericResponse<IBlog[]>>
): Promise<void> => {
  try {
    const blogs = await getAllBlogs(req.query);
    res
      .status(200)
      .json({ message: "Blogs fetched successfully", data: blogs });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

// Fetch a single blog by ID
export const fetchBlogByIdController = async (
  req: Request,
  res: Response<ApiGenericResponse<IBlog>>
): Promise<void> => {
  try {
    const blog = await getBlogById(req.params.id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    res.status(200).json({ message: "Blog fetched successfully", data: blog });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

// Create a new blog
export const addBlogController = async (
  req: Request,
  res: Response<ApiGenericResponse<IBlog>>
): Promise<void> => {
  try {
    const blog = await createBlog(req.body, req.user as IUser);
    res.status(201).json({ message: "Blog created successfully", data: blog });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const modifyBlogController = async (
  req: Request,
  res: Response<ApiGenericResponse<IBlog>>
): Promise<void> => {
  try {
    const blog = await updateBlog(req.params.id, req.body);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    res.status(200).json({ message: "Blog updated successfully", data: blog });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const removeBlogController = async (
  req: Request,
  res: Response<ApiGenericResponse<null>>
): Promise<void> => {
  try {
    const blog = await deleteBlog(req.params.id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    res.status(200).json({ message: "Blog deleted successfully" });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};
