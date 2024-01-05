/**
 * AppError - class to customize UM errors
 * @param name {String} name of the error
 * @param message {String} message of the error
 * @param statusCode {Number} status code of the error
 * @param isOperational {Boolean} is the error predictable or uncaught
 *
 * @returns {Object} {name, statusCode, isOperational}
 */
class AppError extends Error {
  constructor(name, message, statusCode, isOperational = true, args) {
    super(message);

    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.args = args;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
