const Joi = require("joi");

export const createBlogSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().min(10).required(),
  tags: Joi.array().items(Joi.string()),
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  content: Joi.string().min(10),
  tags: Joi.array().items(Joi.string()),
}).min(1);

export const specificBlogSchema = Joi.object({
  id: Joi.string()
    .regex(/^[a-fA-F0-9]{24}$/)
    .required(),
});
