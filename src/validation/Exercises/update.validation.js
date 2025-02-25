import Joi from "joi";

export const exerciseUpdateSchema = Joi.object({
  name: Joi.string().trim().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
  }),

  coach: Joi.string().hex().length(24).messages({
    "string.base": "Coach must be a valid ObjectId",
    "string.hex": "Coach must be a valid hex string",
    "string.length": "Coach must be exactly 24 characters long",
  }),

  gender: Joi.string().valid("male", "female").default("male").messages({
    "any.only": "Gender must be one of: male, female",
  }),

  image: Joi.object().messages({
    "object.base": "Image is required and must be an object",
  }),

  video: Joi.string().uri().messages({
    "string.uri": "Video is required and must be a valid URI",
  }),

  notes: Joi.string().messages({
    "string.base": "Notes must be a string",
  }),

  isFavorite: Joi.boolean().default(false).messages({
    "boolean.base": "Done must be a boolean",
  }),
});
