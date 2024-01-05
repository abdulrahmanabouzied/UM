import Joi from "joi";

export const supplementSchema = Joi.object({
  item: Joi.string().hex().length(24).required().messages({
    "string.base": "Supplement item must be a valid ObjectId",
    "string.hex": "Supplement item must be a valid hex string",
    "string.length": "Supplement item must be exactly 24 characters long",
    "any.required": "Supplement item is required",
  }),
});

const mealSchema = Joi.object({
  time: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Time must be a valid date",
  }),

  supplements: Joi.array().items(supplementSchema),
});

const dayValidationSchema = Joi.object({
  breakfast: mealSchema,
  midMorning: mealSchema,
  lunch: mealSchema,
  eveningSnacks: mealSchema,
  dinner: mealSchema,
});

const supplementPlanValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),

  coach: Joi.string().hex().length(24).required().messages({
    "string.base": "Coach must be a valid ObjectId",
    "string.hex": "Coach must be a valid hex string",
    "string.length": "Coach must be exactly 24 characters long",
    "any.required": "Coach is required",
  }),

  days: Joi.array().items(dayValidationSchema),

  description: Joi.string().messages({
    "string.base": "Description must be a string",
  }),

  isFavorite: Joi.boolean().default(false).messages({
    "boolean.base": "Done must be a boolean",
  }),
});
