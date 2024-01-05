import Joi from "joi";

export const createCoachSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Customizing email validation
    .required()
    .trim()
    .lowercase()
    .messages({
      'string.base': 'Email should be a string',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty',
      'string.pattern.base': 'Please enter a valid email address',
    }),
  password: Joi.string()
    .required()
    .min(8)
    .max(26)
    .messages({
      'string.base': 'Password should be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must have at least {#limit} characters',
      'string.max': 'Password cannot exceed {#limit} characters',
      'any.required': 'Password is required',
    }),
  picture: Joi.object(),
  username: Joi.string()
    .required()
    .trim()
    .messages({
      'string.base': 'Username should be a string',
      'string.empty': 'Username cannot be empty',
      'any.required': 'Username is required',
    }),
  bannerImage: Joi.object(),
  notifications: Joi.array().items(
    Joi.object({
      message: Joi.string()
        .required()
        .messages({
          'string.base': 'Notification message should be a string',
          'string.empty': 'Notification message cannot be empty',
          'any.required': 'Notification message is required',
        }),
      date: Joi.date()
        .required()
        .messages({
          'date.base': 'Date should be a valid date',
          'any.required': 'Date is required for notifications',
        }),
    })
  ),
  clients: Joi.array().items(Joi.string().pattern(new RegExp('^[0-9a-fA-F]{24}$'))), // Validating as ObjectIds
  blogs: Joi.array().items(Joi.string().pattern(new RegExp('^[0-9a-fA-F]{24}$'))), // Validating as ObjectIds
});