import Joi from "joi";

export const supplementCreateSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
  }),

  type: Joi.string().valid("tablet", "grams").required().messages({
    "string.base": "Type must be a string",
    "any.only": "Type must be one of: tablet, grams",
    "any.required": "Type is required",
  }),

  coach: Joi.string().hex().length(24).required().messages({
    "string.base": "Coach must be a valid ObjectId",
    "string.hex": "Coach must be a valid hex string",
    "string.length": "Coach must be exactly 24 characters long",
    "any.required": "Coach is required",
  }),

  dosage: Joi.number().required().messages({
    "number.base": "Dosage must be a number",
    "any.required": "Dosage is required",
  }),

  notes: Joi.string().messages({
    "string.base": "Notes must be a string",
  }),
});
