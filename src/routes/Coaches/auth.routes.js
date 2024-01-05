import { Router } from "express";
const app = Router();

import Controller from "../../controllers/authControllers/coachesAuth.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "./../../utils/auth.service.js";

app.post("/signup", asyncHandler(Controller.signup));
app.post("/login", asyncHandler(Controller.login));
app.post("/logout", authenticate, asyncHandler(Controller.logout));
app.post("/verifyEmail/:OTP", asyncHandler(Controller.verifyEmail));
app.post("/checkEmail", asyncHandler(Controller.checkEmail));
app.post("/forgotPassword", asyncHandler(Controller.forgetPassword));
app.patch(
  "/verifyForgotPassword/:OTP",
  asyncHandler(Controller.verifyForgotPassword)
);
app.patch("/resetPassword/:token", asyncHandler(Controller.resetPassword));
app.patch(
  "/updatePassword",
  authenticate,
  asyncHandler(Controller.updatePassword)
);

export default app;
