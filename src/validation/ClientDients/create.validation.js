import Joi from "joi";

export const timeAndIngredientsSchema = Joi.object({
  time: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Time must be a valid date",
  }),
  ingredients: Joi.array().items(
    Joi.object({
      item: Joi.string().hex().length(24).required().messages({
        "string.base": "Ingredient item must be a valid ObjectId",
        "string.hex": "Ingredient item must be a valid hex string",
        "string.length": "Ingredient item must be exactly 24 characters long",
        "any.required": "Ingredient item is required",
      }),

      done: Joi.boolean().default(false).messages({
        "boolean.base": "Done must be a boolean",
      }),
    })
  ),
});

const daysSchema = Joi.array().items(
  Joi.object({
    startedAt: Joi.date()
      .allow(null)
      .default(null, "null is allowed")
      .messages({
        "date.base": "Time must be a valid date",
      }),
    state: Joi.string()
      .valid("available", "inprogress", "done", "locked")
      .default("available")
      .messages({
        "any.only": "State must be one of: available, inprogress, done, locked",
      }),

    date: Joi.date().allow(null).default(null, "null is allowed").messages({
      "date.base": "Time must be a valid date",
    }),

    breakfast: timeAndIngredientsSchema,

    midMorning: timeAndIngredientsSchema,

    lunch: timeAndIngredientsSchema,

    eveningSnacks: timeAndIngredientsSchema,

    dinner: timeAndIngredientsSchema,
  })
);

const clientDietValidationSchema = Joi.object({
  client: Joi.string().hex().length(24).required().messages({
    "string.base": "Client must be a valid ObjectId",
    "string.hex": "Client must be a valid hex string",
    "string.length": "Client must be exactly 24 characters long",
    "any.required": "Client is required",
  }),

  name: Joi.string().allow(null).default(null, "null is allowed").messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
  }),

  totalCalories: Joi.number().messages({
    "number.base": "Total calories must be a number",
  }),

  days: daysSchema,

  assignedAt: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Assigned at must be a valid date",
  }),

  startedAt: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Started at must be a valid date",
  }),

  endingAt: Joi.date().allow(null).default(null, "null is allowed").messages({
    "date.base": "Ending at must be a valid date",
  }),

  state: Joi.string()
    .valid("available", "inprogress", "done", "locked")
    .default("available")
    .messages({
      "any.only": "State must be one of: available, inprogress, done, locked",
    }),
});
