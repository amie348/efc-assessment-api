import mongoose, { Document, ObjectId } from "mongoose";

export interface IBlogBasicDetails {
  title: string;
  content: string;
  tags?: string[];
}

export interface IBlogDetails extends IBlogBasicDetails {
  author: string;
  authorId: mongoose.Types.ObjectId;
}

export interface IBlog extends IBlogBasicDetails, Document {
  _id: mongoose.Types.ObjectId;
  author: string;
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
