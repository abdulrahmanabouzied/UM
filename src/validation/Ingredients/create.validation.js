import Joi from "joi";

export const ingredientCreateSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
  }),

  coach: Joi.string().hex().length(24).required().messages({
    "string.base": "Coach must be a valid ObjectId",
    "string.hex": "Coach must be a valid hex string",
    "string.length": "Coach must be exactly 24 characters long",
    "any.required": "Coach is required",
  }),

  servingSize: Joi.number().required().messages({
    "number.base": "Serving size must be a number",
    "any.required": "Serving size is required",
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
