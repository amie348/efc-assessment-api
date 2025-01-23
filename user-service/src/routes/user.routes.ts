import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "@controllers/user.controller";
import protect from "@middlewares/auth/auth.middleware";

import validateInput from "@middlewares/validation/validation.middleware";
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
} from "@validations/user.validation.schema";
import { ValidationParamEnums } from "@utils/enums";

const router = express.Router();

router.post(
  "/register",
  validateInput(signupSchema, ValidationParamEnums.BODY),
  register
);
router.post(
  "/login",
  validateInput(loginSchema, ValidationParamEnums.BODY),
  login
);
router.get("/me", protect, getProfile);
router.put(
  "/me",
  protect,
  validateInput(updateProfileSchema, ValidationParamEnums.BODY),
  updateProfile
);

export default router;
