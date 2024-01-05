import AppError from "./appError.js";

export default (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false }); // validate all fields

  if (error) {
    const errorDetails = error.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message,
    }));

    return next(
      new AppError(
        "ValidationError",
        errorDetails[0].message,
        400,
        true,
        errorDetails
      )
    );
  }

  next();
};
