import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import blogRoutes from "@routes/blog.routes";
import connectDB from "@config/db";
import swaggerDocument from "@docs/swagger.json";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/blogs", blogRoutes);

// Health Check
app.get("/", (req: Request, res: Response) => {
  res.send("Blog Service is running");
});

connectDB();

export default app;
