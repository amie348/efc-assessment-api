/**
 * @file user.service.test.ts
 * @description This file contains comprehensive integration tests for the User Service API endpoints.
 * The tests ensure robust validation and correctness of functionalities related to user registration, login,
 * profile retrieval, and profile updates. It uses `supertest` to test HTTP requests and responses in a
 * simulated environment and `mongodb-memory-server` for an in-memory MongoDB database to ensure test isolation.
 */

import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import User from "@models/user.model";
import { generateToken } from "@utils/jwt";

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
  await User.deleteMany({});
});

describe("User Service Tests", () => {
  describe("POST /api/users/register", () => {
    it("should successfully register a user", async () => {
      const res = await request(app).post("/api/users/register").send({
        username: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data).toHaveProperty("email", "johndoe@example.com");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should not register a user with an existing email", async () => {
      await User.create({
        username: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/users/register").send({
        username: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "User already exists");
    });

    it("should return validation error for missing fields", async () => {
      const res = await request(app).post("/api/users/register").send({
        email: "johndoe@example.com",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /api/users/login", () => {
    it("should successfully login a user", async () => {
      await User.create({
        username: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/users/login").send({
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should fail with invalid credentials", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "johndoe@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
    });

    it("should fail if user does not exist", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
    });
  });

  describe("GET /api/users/me", () => {
    it("should get the user profile", async () => {
      const user = await User.create({
        username: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      const token = `Bearer ${generateToken(user._id)}`;

      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", token);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("username", "John Doe");
      expect(res.body.data).toHaveProperty("email", "johndoe@example.com");
      expect(res.body.data).toHaveProperty("_id", user._id.toString());
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should return unauthorized if no token is provided", async () => {
      const res = await request(app).get("/api/users/me");
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authorized, no token");
    });

    it("should return unauthorized for Authentication failed", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty(
        "message",
        "Not authorized, token failed"
      );
    });
  });

  describe("PUT /api/users/me", () => {
    it("should update the user profile", async () => {
      const user = await User.create({
        username: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      const token = `Bearer ${generateToken(user._id)}`;

      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", token)
        .send({ username: "Jane Doe", email: "janedoe@example.com" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("username", "Jane Doe");
      expect(res.body.data).toHaveProperty("email", "janedoe@example.com");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should return unauthorized if no token is provided", async () => {
      const res = await request(app).put("/api/users/me").send({
        username: "Jane Doe",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authorized, no token");
    });

    it("should return validation error for invalid data", async () => {
      const user = await User.create({
        username: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      const token = `Bearer ${generateToken(user._id)}`;

      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", token)
        .send({ email: "not-an-email" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });
});
