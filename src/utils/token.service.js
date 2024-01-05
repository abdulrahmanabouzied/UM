import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";

export const generateToken = async (payload, duration) => {
  const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
    algorithm: "HS512",
    expiresIn: duration || 60 * 60,
  });

  return token;
};

export const verifyToken = async (token) => {
  try {
    let data = jwt.verify(token, process.env.TOKEN_SECRET, {
      algorithms: ["HS512"],
    });
    return { data };
  } catch (error) {
    return { error: new AppError(error.name, error.message, 400) };
  }
};
