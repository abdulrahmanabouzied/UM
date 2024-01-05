import Joi from "joi";

export const clientAuditValidationSchema = Joi.object({
  client: Joi.string().hex().length(24).required().messages({
    'string.base': 'Client must be a valid ObjectId',
    'string.hex': 'Client must be a valid hex string',
    'string.length': 'Client must be exactly 24 characters long',
    'any.required': 'Client is required',
  }),

  weight: Joi.array().items(
    Joi.object({
      date: Joi.date().default(() => new Date(), 'current date').messages({
        'date.base': 'Weight date must be a valid date',
      }),

      value: Joi.number().required().messages({
        'number.base': 'Weight value must be a number',
        'any.required': 'Weight value is required',
      }),
    })
  ),

  subscriptions: Joi.array().items(
    Joi.object({
      date: Joi.date().default(() => new Date(), 'current date').messages({
        'date.base': 'Subscription date must be a valid date',
      }),
      value: Joi.string().hex().length(24).required().messages({
        'string.base': 'Subscription value must be a valid ObjectId',
        'string.hex': 'Subscription value must be a valid hex string',
        'string.length': 'Subscription value must be exactly 24 characters long',
        'any.required': 'Subscription value is required',
      }),
    })
  ),
});