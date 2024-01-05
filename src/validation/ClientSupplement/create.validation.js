import Joi from "joi";

const timeAndIngredientsSchema = Joi.object({
  time: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Time must be a valid date",
  }),

  supplements: Joi.array().items(
    Joi.object({
      item: Joi.string().hex().length(24).required().messages({
        "string.base": "Supplement item must be a valid ObjectId",
        "string.hex": "Supplement item must be a valid hex string",
        "string.length": "Supplement item must be exactly 24 characters long",
        "any.required": "Supplement item is required",
      }),

      done: Joi.boolean().default(false).messages({
        "boolean.base": "Done must be a boolean",
      }),
    })
  ),
});
export const supplementValidationSchema = Joi.object({
  client: Joi.string().hex().length(24).required().messages({
    "string.base": "Client must be a valid ObjectId",
    "string.hex": "Client must be a valid hex string",
    "string.length": "Client must be exactly 24 characters long",
    "any.required": "Client is required",
  }),
  name: Joi.string().messages({
    "string.base": "name must be a string.",
  }),
  days: Joi.array().items(
    Joi.object({
      startedAt: Joi.date()
        .allow(null)
        .default(null, "null is allowed")
        .messages({
          "date.base": "Started at must be a valid date",
        }),

      state: Joi.string()
        .valid("available", "inprogress", "done", "locked")
        .default("available"),

      date: Joi.date().allow(null).default(null, "null is allowed").messages({
        "date.base": "Date must be a valid date",
      }),

      breakfast: timeAndIngredientsSchema,

      midMorning: timeAndIngredientsSchema,

      lunch: timeAndIngredientsSchema,

      eveningSnacks: timeAndIngredientsSchema,

      dinner: timeAndIngredientsSchema,
    })
  ),
});