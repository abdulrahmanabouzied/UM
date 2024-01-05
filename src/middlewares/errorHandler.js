const errorHandler = async (err, req, res, next) => {
  console.log(err.stack);

  // Error Args contain accessToken and RefreshToken when fail to auth
  res.status(err.statusCode || 500).json({
    name: err.name || "SERVER_FAIL",
    error: err.message,
    stack: err.stack,
    status: err.statusCode || 500,
    success: false,
    args: err.args,
  });
};

export default errorHandler;
