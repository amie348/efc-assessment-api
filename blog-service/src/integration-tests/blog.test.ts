/**
 * @file user.service.test.ts
 * @description This file contains comprehensive integration tests for the Blog Service API endpoints.
 * The tests ensure robust validation and correctness of functionalities related to blog creation, updation,
 * deletion, and retericals . It uses `supertest` to test HTTP requests and responses in a
 * simulated environment and `mongodb-memory-server` for an in-memory MongoDB database to ensure test isolation.
 */

import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import Blog from "@models/blog.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import axios from "axios";
import { IUser } from "../types/user";

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OGY0NjczZmM2NjVjYTYzN2VkMzdjZCIsImlhdCI6MTczNzQ0MjkzMSwiZXhwIjoxNzM3NTI5MzMxfQ.WNZncGSaioFqA8X-xlXBqg6Ugn4jhYDlG0SIDZrrynE";
const invalidId = "507f191e810c19729de860ea";
const invalidToken = "invalid.token.here";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Blog.deleteMany();
});

jest.mock("axios"); // Mock Axios

describe("Blog API - Create", () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          _id: "507f191e810c19729de860ea",
          username: "amie348",
          email: "ahmadyaqoob89@gmail.com",
        } as IUser,
      },
    });
  });

  it("should create a new blog", async () => {
    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        title: "Test Blog",
        content: "This is a test blog.",
        tags: ["test"],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("_id");
  });

  it("should not create a blog with Authentication failed", async () => {
    (axios.get as jest.Mock).mockRejectedValue({
      response: { status: 401, data: { message: "Authentication failed" } },
    });

    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${invalidToken}`)
      .send({
        title: "Test Blog",
        content: "This is a test blog.",
        tags: ["test"],
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Authentication failed");
  });

  it("should not create a blog with missing fields", async () => {
    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        content: "Missing title",
      });

    expect(res.statusCode).toBe(400);
  });
});

describe("Blog API - Read", () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          _id: "507f191e810c19729de860ea",
          username: "amie348",
          email: "ahmadyaqoob89@gmail.com",
        } as IUser,
      },
    });
  });

  it("should fetch all blogs", async () => {
    await Blog.create({
      title: "Sample",
      content: "Test",
      author: "ahmad",
      authorId: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .get("/api/blogs")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("should fetch a single blog", async () => {
    const blog = await Blog.create({
      title: "Sample",
      content: "Test",
      author: "ahmad",
      authorId: new mongoose.Types.ObjectId(),
    });
    const res = await request(app)
      .get(`/api/blogs/${blog._id}`)
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe("Sample");
  });

  it("should return 404 for fetching a non-existent blog", async () => {
    const res = await request(app)
      .get(`/api/blogs/${invalidId}`)
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Blog not found");
  });

  it("should not fetch a blog with Authentication failed", async () => {
    (axios.get as jest.Mock).mockRejectedValue({
      response: { status: 401, data: { message: "Authentication failed" } },
    });
    const blog = await Blog.create({
      title: "Sample",
      content: "Test",
      author: "ahmad",
      authorId: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .get(`/api/blogs/${blog._id}`)
      .set("Authorization", `Bearer ${invalidToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Authentication failed");
  });
});

describe("Blog API - Update", () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          _id: "507f191e810c19729de860ea",
          username: "amie348",
          email: "ahmadyaqoob89@gmail.com",
        } as IUser,
      },
    });
  });

  it("should update a blog", async () => {
    const blog = await Blog.create({
      title: "Sample",
      content: "Test",
      author: "ahmad",
      authorId: new mongoose.Types.ObjectId(),
    });
    const res = await request(app)
      .put(`/api/blogs/${blog._id}`)
      .set("Authorization", `Bearer ${testToken}`)
      .send({ title: "Updated Blog" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe("Updated Blog");
  });

  it("should return 404 when updating a non-existent blog", async () => {
    const res = await request(app)
      .put(`/api/blogs/${invalidId}`)
      .set("Authorization", `Bearer ${testToken}`)
      .send({ title: "Updated Blog" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Blog not found");
  });

  it("should not update a blog with Authentication failed", async () => {
    (axios.get as jest.Mock).mockRejectedValue({
      response: { status: 401, data: { message: "Authentication failed" } },
    });
    const blog = await Blog.create({
      title: "Sample",
      content: "Test",
      author: "ahmad",
      authorId: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .put(`/api/blogs/${blog._id}`)
      .set("Authorization", `Bearer ${invalidToken}`)
      .send({ title: "Updated Blog" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Authentication failed");
  });
});

describe("Blog API - Delete", () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          _id: "507f191e810c19729de860ea",
          username: "amie348",
          email: "ahmadyaqoob89@gmail.com",
        } as IUser,
      },
    });
  });

  it("should delete a blog", async () => {
    const blog = await Blog.create({
      title: "Sample",
      content: "Test",
      author: "ahmad",
      authorId: new mongoose.Types.ObjectId(),
    });
    const res = await request(app)
      .delete(`/api/blogs/${blog._id}`)
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Blog deleted successfully");
  });

  it("should return 404 when deleting a non-existent blog", async () => {
    const res = await request(app)
      .delete(`/api/blogs/${invalidId}`)
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Blog not found");
  });

  it("should not delete a blog with Authentication failed", async () => {
    (axios.get as jest.Mock).mockRejectedValue({
      response: { status: 401, data: { message: "Authentication failed" } },
    });
    const blog = await Blog.create({
      title: "Sample",
      content: "Test",
      author: "ahmad",
      authorId: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .delete(`/api/blogs/${blog._id}`)
      .set("Authorization", `Bearer ${invalidToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Authentication failed");
  });
});
