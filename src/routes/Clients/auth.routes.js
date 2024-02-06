import { Router } from "express";

const app = Router();
import Controller from "../../controllers/authControllers/clientsAuth.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "./../../utils/auth.service.js";
import validator from "../../utils/validator.js";
import createValidation from "../../validation/Clients/create.validation.js";
import { loginValidation } from "../../validation/Clients/update.validation.js";
import googleAuth from "./ssoAuth.routes.js";

app.post(
  "/signup",
  validator(createValidation),
  asyncHandler(Controller.signup)
);
app.post("/login", validator(loginValidation), asyncHandler(Controller.login));
app.post("/google", asyncHandler(Controller.loginGoogle));
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
app.use(googleAuth);

export default app;
