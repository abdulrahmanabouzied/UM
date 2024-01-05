import Joi from "joi";

const blogCreateSchema = Joi.object({
  title: Joi.string().required().trim().messages({
    "string.base": "Title must be a string",
    "any.required": "Title is required",
    "string.empty": "Title cannot be empty",
  }),

  coach: Joi.string().hex().length(24).required().messages({
    "string.base": "Coach must be a valid ObjectId",
    "string.hex": "Coach must be a valid hex string",
    "string.length": "Coach must be exactly 24 characters long",
    "any.required": "Coach is required",
  }),

  details: Joi.string().required().messages({
    "string.base": "Details must be a string",
    "any.required": "Details is required",
    "string.empty": "Details cannot be empty",
  }),

  coverImage: Joi.object().messages({
    "object.base": "Cover image must be an object",
    "any.required": "Cover image is required",
  }),

  category: Joi.string().required().trim().messages({
    "string.base": "Category must be a string",
    "any.required": "Category is required",
    "string.empty": "Category cannot be empty",
  }),
});

export { blogCreateSchema };
