import Joi from "joi";

export const ingredientSchema = Joi.object({
  item: Joi.string().hex().length(24).required().messages({
    "string.base": "Ingredient item must be a valid ObjectId",
    "string.hex": "Ingredient item must be a valid hex string",
    "string.length": "Ingredient item must be exactly 24 characters long",
    "any.required": "Ingredient item is required",
  }),
});

const mealSchema = Joi.object({
  time: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Time must be a valid date",
  }),

  ingredients: Joi.array().items(ingredientSchema),
});

const dayValidationSchema = Joi.object({
  breakfast: mealSchema,
  midMorning: mealSchema,
  lunch: mealSchema,
  eveningSnacks: mealSchema,
  dinner: mealSchema,
});

const dietPlanValidationSchema = Joi.object({
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

  totalCalories: Joi.number().messages({
    "number.base": "Total calories must be a number",
  }),

  days: Joi.array().items(dayValidationSchema),

  description: Joi.string().messages({
    "string.base": "Description must be a string",
  }),

  isFavorite: Joi.boolean().default(false).messages({
    "boolean.base": "Done must be a boolean",
  }),
});
