import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Environment variables
const userServiceUrl = process.env.USER_SERVICE_URL;
const blogServiceUrl = process.env.BLOG_SERVICE_URL;

if (!userServiceUrl || !blogServiceUrl) {
  throw new Error("Required environment variables are missing");
}

// Middleware
app.use(morgan("dev"));
app.use(cors());

// Blog service proxy
app.use(
  "/api/blogs",
  createProxyMiddleware({
    target: blogServiceUrl,
    pathRewrite: { "^/api/blogs": "/api/blogs" },
    changeOrigin: true,
  })
);

// Auth service proxy
app.use(
  "/api/users",
  createProxyMiddleware({
    target: userServiceUrl,
    pathRewrite: { "^/api/users": "/api/users" },
    changeOrigin: true,
  })
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`API Gateway running at http://localhost:${port}`);
});
