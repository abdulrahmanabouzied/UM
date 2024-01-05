import Joi from "joi";

export const supplementUpdateSchema = Joi.object({
  name: Joi.string().trim().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
  }),

  type: Joi.string().valid("tablet", "grams").messages({
    "string.base": "Type must be a string",
    "any.only": "Type must be one of: tablet, grams",
  }),

  coach: Joi.string().hex().length(24).messages({
    "string.base": "Coach must be a valid ObjectId",
    "string.hex": "Coach must be a valid hex string",
    "string.length": "Coach must be exactly 24 characters long",
  }),

  dosage: Joi.number().messages({
    "number.base": "Dosage must be a number",
  }),

  notes: Joi.string().messages({
    "string.base": "Notes must be a string",
  }),
});
