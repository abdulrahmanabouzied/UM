import Joi from "joi";

const exerciseSchema = Joi.object({
  exercise: Joi.string().hex().length(24).required().messages({
    "string.base": "Exercise must be a valid ObjectId",
    "string.hex": "Exercise must be a valid hex string",
    "string.length": "Exercise must be exactly 24 characters long",
    "any.required": "Exercise is required",
  }),
});

const dayValidationSchema = Joi.object({
  exercises: Joi.array().items(exerciseSchema),
});

export const workoutPlanValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
  }),

  coach: Joi.string().hex().length(24).required().messages({
    "string.base": "Coach must be a valid ObjectId",
    "string.hex": "Coach must be a valid hex string",
    "string.length": "Coach must be exactly 24 characters long",
    "any.required": "Coach is required",
  }),

  image: Joi.object().required().messages({
    "object.base": "Image is required and must be an object",
  }),

  description: Joi.string().messages({
    "string.base": "Description must be a string",
  }),

  isFavorite: Joi.boolean().default(false).messages({
    "boolean.base": "Done must be a boolean",
  }),

  days: Joi.array().items(dayValidationSchema),

  assignees: Joi.array().items(
    Joi.string().hex().length(24).messages({
      "string.base": "Assignee must be a valid ObjectId",
      "string.hex": "Assignee must be a valid hex string",
      "string.length": "Assignee must be exactly 24 characters long",
    })
  ),
});
