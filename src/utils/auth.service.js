// for handling tokens and authorization issues.
import AppError from '../utils/appError.js';
import { verifyToken, generateToken } from './token.service.js';
import Client from '../models/Clients/model.js';
import asyncHandler from './asyncHandler.js';
import { parseTime } from '../utils/time.service.js';
import Coach from './../models/Coaches/model.js';

// authenticate Clients
export const authenticate = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.headers['authorization'] &&
    req.headers['authorization'].replace('Bearer ', '');
  const refreshToken = req.headers['x-refresh-token'];
  let user;

  if (!accessToken) {
    return next(new AppError('TOKEN_NOT_FOUND', 'Access token not found'));
  }

  const { error, data } = await verifyToken(accessToken);
  console.log("🚀 ~ authenticate ~ error, data:", error, data)

  if (error?.name === 'TokenExpiredError') {
    let { error, data } = await verifyToken(refreshToken);

    if (error?.name === 'TokenExpiredError') {
      return next(new AppError('TOKEN_EXPIRED', 'please login again', 401));
    }

    if (error) {
      return next(error);
    }

    user = await Client.findById(data.id);

    if (!user) {
      user = await Coach.findById(data.id);
    }

    if (!user) {
      return next(new AppError('USER_NOT_FOUND', 'user not found', 404));
    }

    if (!user.emailActive) {
      return next(
        new AppError('USER_NOT_ACTIVE', 'user email not verified', 401)
      );
    }

    data = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = await generateToken(data, parseTime('1d', 's'));
    const newRefreshToken = await generateToken(data, parseTime('10d', 's'));

    return next(
      new AppError(
        'ACCESS_TOKEN_EXPIRED',
        'an error occurred, please try login again!',
        401,
        false,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        }
      )
    );
  }

  // access token not valid
  if (error) {
    return next(error);
  }

  user = await Client.findById(data.id);

  if (!user) {
    user = await Coach.findById(data.id);
  }

  if (!user) {
    return next(new AppError('USER_NOT_FOUND', 'user not found', 404));
  }

  if (!user.emailActive) {
    return next(
      new AppError('EMAIL_NOT_ACTIVE', 'user email not verified', 401)
    );
  }

  if (!user.active) {
    return next(new AppError('USER_NOT_ACTIVE', 'please login again!', 401));
  }

  user = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  req.user = user;
  res.locals.user = user;
  next();
});

// for role based access control
export const restrictTo =
  (...roles) =>
  async (req, res, next) => {
    if (roles.includes(req?.user?.role)) {
      return next();
    }

    next(
      new AppError(
        'PERMISSION_DENIED',
        `You are not allowed to use${req.originalUrl}`,
        403
      )
    );
  };
