import Joi from "joi";

export const clientValidationSchema = Joi.object()
  .required()
  .keys({
    fullname: Joi.string().messages({
      "string.base": "{{#label}} must be a string.",
    }),
    email: Joi.string().email().messages({
      "string.email": "{{#label}} must be a valid email address.",
    }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .min(8)
      .max(26)
      .messages({
        "string.min": "{{#label}} must be at least 8 characters long.",
        "string.max": "{{#label}} cannot be more than 26 characters long.",
        "string.pattern.base":
          "Invalid password format. It must contain at least one special character ([@$!%*?&]), at least one digit (d), at least one uppercase letter ([A-Z]), at least one lowercase letter ([a-z])",
      }),
    subscriptionType: Joi.string()
      .valid("premium", "guest")
      .default("guest")
      .messages({
        "string.valid":
          'Subscription type must be either "premium" or "guest".',
      }),
    role: Joi.string().valid("client").default("client").messages({
      "string.valid": 'Role must be "client".',
    }),
    status: Joi.string().messages({
      "string.base": "Status must be a string.",
    }),
    weight: Joi.number().messages({
      "number.base": "Weight must be a number.",
    }),
    height: Joi.number().messages({
      "number.base": "Height must be a number.",
    }),
    contactNumber: Joi.string().messages({
      "string.base": "Contact number must be a string.",
    }),
    healthIssues: Joi.string().messages({
      "string.base": "Health issues must be a string.",
    }),
    goals: Joi.array().items(Joi.string()).messages({
      "array.base": "Goals must be an array.",
    }),
    activityLevel: Joi.string()
      .valid("Inactive", "Moderately Active", "Vigorously Active")
      .messages({
        "string.valid":
          'Activity level must be "Inactive", "Moderately Active", or "Vigorously Active".',
      }),
    inbody: Joi.object().messages({
      "object.base": "Inbody must be an object.",
    }),
    picture: Joi.object().messages({
      "object.base": "Picture must be an object.",
    }),
    dateOfBirth: Joi.date().iso().messages({
      "date.iso": "Date of birth must be a valid date in ISO format.",
    }),
    gender: Joi.string().valid("male", "female").messages({
      "string.valid": 'Gender must be "male" or "female".',
    }),
    allergies: Joi.string().messages({
      "string.base": "Allergies must be a string.",
    }),
    currWorkoutPlan: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base": "Current workout plan must be a valid ObjectId.",
      }),
    currNutritionPlan: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base":
          "Current nutrition plan must be a valid ObjectId.",
      }),
    currSupplementPlan: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base":
          "Current supplement plan must be a valid ObjectId.",
      }),
    savedBlogs: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .messages({
        "array.base": "Saved blogs must be an array of valid ObjectIds.",
      }),
    active: Joi.boolean().default(false).messages({
      "boolean.base": "Active must be a boolean.",
    }),
    emailActive: Joi.boolean().default(false).messages({
      "boolean.base": "Email active must be a boolean.",
    }),
    verifyEmailOTPToken: Joi.string().messages({
      "string.base": "Verify email OTP token must be a string.",
    }),
    verifyEmailExpires: Joi.date().iso().messages({
      "date.iso": "Verify email expiration must be a valid date in ISO format.",
    }),
    forgotPasswordOTP: Joi.string().messages({
      "string.base": "Forgot password OTP must be a string.",
    }),
    passwordResetTokenOTP: Joi.string().messages({
      "string.base": "Password reset token OTP must be a string.",
    }),
    passwordResetExpires: Joi.date().iso().messages({
      "date.iso":
        "Password reset expiration must be a valid date in ISO format.",
    }),
    notifications: Joi.array()
      .items(
        Joi.object({
          message: Joi.string(),
          date: Joi.date().iso().messages({
            "date.iso": "Notification date must be a valid date in ISO format.",
          }),
        })
      )
      .messages({
        "array.base": "Notifications must be an array of objects.",
      }),
  })
  .messages({
    "object.base": "Invalid input. Must be an object.",
  });

export const loginValidation = Joi.object()
  .required()
  .keys({
    email: Joi.string().required().email().messages({
      "string.email": "{{#label}} must be a valid email address.",
      "any.required": "{{#label}} is required.",
    }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .min(8)
      .max(26)
      .messages({
        "string.min": "{{#label}} must be at least 8 characters long.",
        "string.max": "{{#label}} cannot be more than 26 characters long.",
        "any.required": "{{#label}} is required.",
        "string.pattern.base":
          "Invalid password format. It must contain at least one special character ([@$!%*?&]), at least one digit (d), at least one uppercase letter ([A-Z]), at least one lowercase letter ([a-z])",
      }),
  })
  .messages({
    "object.base": "Invalid input. Must be an object.",
  });
