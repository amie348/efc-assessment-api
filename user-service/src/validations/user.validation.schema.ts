import Joi from "joi";

// Validation schema for user signup
export const signupSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

// Validation schema for user login
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

// Validation schema for updating the user profile
export const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(50).messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),
  email: Joi.string().email().messages({
    "string.email": "Please provide a valid email",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });

module.exports = {
  signupSchema,
  loginSchema,
  updateProfileSchema,
};
