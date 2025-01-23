import express from "express";
import connectDB from "@config/db";
import userRoutes from "@routes/user.routes";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";

import swaggerDocument from "@docs/swagger.json";
import cors from "cors";
import morgan from "morgan";

require("dotenv").config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Swagger Setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/users", userRoutes);

connectDB();

export default app;
