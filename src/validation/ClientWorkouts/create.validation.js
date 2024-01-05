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

  startedAt: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Started at must be a valid date",
  }),

  date: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Date must be a valid date",
  }),

  state: Joi.string()
    .valid("available", "inprogress", "done", "locked")
    .messages({
      "any.only": "State must be one of: available, inprogress, done, locked",
    }),
});

export const workoutValidationSchema = Joi.object({
  client: Joi.string().hex().length(24).required().messages({
    "string.base": "Client must be a valid ObjectId",
    "string.hex": "Client must be a valid hex string",
    "string.length": "Client must be exactly 24 characters long",
    "any.required": "Client is required",
  }),

  name: Joi.string().messages({
    "string.base": "Name must be a string",
  }),

  image: Joi.object().messages({
    "object.base": "Image must be an object",
  }),

  description: Joi.string().messages({
    "string.base": "Description must be a string",
  }),

  days: Joi.array().items(dayValidationSchema),

  assignedAt: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Assigned at must be a valid date",
  }),

  endingAt: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Ending at must be a valid date",
  }),

  startedAt: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Started at must be a valid date",
  }),

  state: Joi.string()
    .valid("pendingStart", "done", "inprogress")
    .default("pendingStart")
    .messages({
      "any.only": "State must be one of: pendingStart, done, inprogress",
    }),
});


