import Joi from "joi";

export const ingredientUpdateSchema = Joi.object({
  name: Joi.string().trim().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
  }),

  coach: Joi.string().hex().length(24).messages({
    "string.base": "Coach must be a valid ObjectId",
    "string.hex": "Coach must be a valid hex string",
    "string.length": "Coach must be exactly 24 characters long",
  }),

  servingSize: Joi.number().messages({
    "number.base": "Serving size must be a number",
  }),

  calories: Joi.number().messages({
    "number.base": "Calories must be a number",
  }),

  carbs: Joi.number().messages({
    "number.base": "Carbs must be a number",
  }),

  proteins: Joi.number().messages({
    "number.base": "Proteins must be a number",
  }),

  fats: Joi.number().messages({
    "number.base": "Fats must be a number",
  }),
});
