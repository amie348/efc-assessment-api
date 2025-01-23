import { string } from "joi";
import mongoose, { Document, Schema } from "mongoose";
import { IBlog } from "@customeTypes/blog";

const blogSchema: Schema<IBlog> = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tags: [String],
  },
  { timestamps: true }
);

const Blog = mongoose.model<IBlog>("Blog", blogSchema);

export default Blog;
