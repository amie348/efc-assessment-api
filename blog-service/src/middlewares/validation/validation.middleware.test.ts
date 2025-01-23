import request from "supertest";
import express from "express";
import Joi from "joi";
import validateInput from "./validation.middleware"; // Path to your middleware file
import { ValidationParamEnums } from "@utils/enums"; // Assuming the enums are here

// Define a simple Joi validation schema for testing
const testSchema = Joi.object({
  name: Joi.string().min(3).required(),
  age: Joi.number().integer().min(18).required(),
});

const testParamsSchema = Joi.object({
  id: Joi.string().min(24).required(),
});

describe("validateInput Middleware", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json()); // To parse JSON body
  });

  it("should return 400 if validation fails for BODY", async () => {
    const invalidPayload = { name: "Joncdksk" }; // Missing 'age' property

    app.post(
      "/test-body",
      validateInput(testSchema, ValidationParamEnums.BODY),
      (req, res): void => {
        res.status(200).send("Valid");
      }
    );

    const response = await request(app).post("/test-body").send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Request Validation Failed");
    expect(response.body.error).toBe('"age" is required');
  });

  it("should return 200 if validation passes for BODY", async () => {
    const validPayload = { name: "John Doe", age: 25 };

    app.post(
      "/test-body",
      validateInput(testSchema, ValidationParamEnums.BODY),
      (req, res): void => {
        res.status(200).send("Valid");
      }
    );

    const response = await request(app).post("/test-body").send(validPayload);

    expect(response.status).toBe(200);
    expect(response.text).toBe("Valid");
  });

  it("should return 400 if validation fails for QUERY", async () => {
    const invalidQuery = { name: "Jokjncjkds" }; // Missing 'age' query parameter

    app.get(
      "/test-query",
      validateInput(testSchema, ValidationParamEnums.QUERY),
      (req, res): void => {
        res.status(200).send("Valid");
      }
    );

    const response = await request(app).get("/test-query").query(invalidQuery);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Request Validation Failed");
    expect(response.body.error).toBe('"age" is required');
  });

  it("should return 200 if validation passes for QUERY", async () => {
    const validQuery = { name: "John Doe", age: 25 };

    app.get(
      "/test-query",
      validateInput(testSchema, ValidationParamEnums.QUERY),
      (req, res): void => {
        res.status(200).send("Valid");
      }
    );

    const response = await request(app).get("/test-query").query(validQuery);

    expect(response.status).toBe(200);
    expect(response.text).toBe("Valid");
  });

  it("should return 200 and skip validation for empty QUERY", async () => {
    app.get(
      "/test-query-empty",
      validateInput(testSchema, ValidationParamEnums.QUERY),
      (req, res): void => {
        res.status(200).send("Valid");
      }
    );

    const response = await request(app).get("/test-query-empty");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Valid");
  });

  it("should return 400 if validation fails for PARAMS", async () => {
    app.get(
      "/test-params/:id", // Define route with params for validation
      validateInput(testParamsSchema, ValidationParamEnums.PARAMS),
      (req, res) => {
        res.status(200).send("Valid");
      }
    );

    // Test the invalid parameters directly in the URL path
    const response = await request(app).get("/test-params/12341n");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Request Validation Failed");
    expect(response.body.error).toBe(
      '"id" length must be at least 24 characters long'
    );
  });

  it("should return 200 if validation passes for PARAMS", async () => {
    const validParams = { name: "John Doe" };

    app.get(
      "/test-params/:id",
      validateInput(testParamsSchema, ValidationParamEnums.PARAMS),
      (req, res): void => {
        res.status(200).send("Valid");
      }
    );

    const response = await request(app).get(
      "/test-params/nkjn43jk2njk34kn3kj1nkj43n21jk4k31j"
    );

    expect(response.status).toBe(200);
    expect(response.text).toBe("Valid");
  });

  it("should call next() if validation param is NONE", async () => {
    const validPayload = { name: "John Doe", age: 25 };

    app.post(
      "/test-none",
      validateInput(testSchema, ValidationParamEnums.NONE),
      (req, res): void => {
        res.status(200).send("Valid");
      }
    );

    const response = await request(app).post("/test-none").send(validPayload);

    expect(response.status).toBe(200);
    expect(response.text).toBe("Valid");
  });
});
