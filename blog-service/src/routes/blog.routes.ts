import express, { Request, Response, NextFunction } from "express";
import {
  fetchAllBlogsController,
  fetchBlogByIdController,
  addBlogController,
  modifyBlogController,
  removeBlogController,
} from "@controllers/blog.controller"; // Corrected import names
import authMiddleware from "@middlewares/auth/auth.middleware";
import validateInput from "@middlewares/validation/validation.middleware";
import {
  specificBlogSchema,
  createBlogSchema,
  updateBlogSchema,
} from "../validations/blog.schema";
import { ValidationParamEnums } from "../utils/enums";

// Create an Express Router
const router = express.Router();

// Define the routes with appropriate middlewares and validation schemas
router.get("/", authMiddleware, fetchAllBlogsController);

router.get(
  "/:id",
  authMiddleware,
  validateInput(specificBlogSchema, ValidationParamEnums.PARAMS),
  fetchBlogByIdController
);

router.post(
  "/",
  authMiddleware,
  validateInput(createBlogSchema, ValidationParamEnums.BODY),
  addBlogController
);

router.put(
  "/:id",
  authMiddleware,
  validateInput(specificBlogSchema, ValidationParamEnums.PARAMS),
  validateInput(updateBlogSchema, ValidationParamEnums.BODY),
  modifyBlogController
);

router.delete(
  "/:id",
  authMiddleware,
  validateInput(specificBlogSchema, ValidationParamEnums.PARAMS),
  removeBlogController
);

export default router;
