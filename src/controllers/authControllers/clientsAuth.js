import Client from "../../models/Clients/model.js";
import sendMail from "../../utils/mailer.js";
import AppError from "../../utils/AppError.js";
import { generateToken } from "./../../utils/token.service.js";
import crypto from "crypto";
import { parseTime } from "../../utils/time.service.js";

class clientsAuthController {
  async signup(req, res, next) {
    const clientData = req.body;

    const foundClient = await Client.findOne({ email: clientData.email });

    if (foundClient) {
      return next(
        new AppError("EMAIL_ALREADY_EXIST", "this email already exists", 400)
      );
    }

    const client = new Client(clientData);

    const OTP = Math.floor(10000 + Math.random() * 90000).toString();
    client.createVerifyEmailOTP(OTP);
    await client.save();

    // await client.save();
    if (!client) {
      return next(
        new AppError(
          "CREATING_USER_ERROR",
          "error while creating the user",
          500
        )
      );
    }
    client.password = undefined;

    const mail = await sendMail(
      client.email,
      "Email Verification",
      null,
      `Verification Code is: ${OTP}`
    );
    if (mail.success) {
      return res.status(200).json({
        success: true,
        status: 200,
        data: { ...client.toObject() },
      });
    }

    client.verifyEmailOTPToken = undefined;
    client.verifyEmailExpires = undefined;
    await client.save({ validateBeforeSave: false });

    next(new AppError("EMAILING_ERROR", "error sending email", 500));
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    // password is select: false, so +password to select it
    const client = await Client.findOne({ email }).select("+password");

    if (!client || !(await client.checkPassword(password, client.password))) {
      return next(new AppError("LGOIN_FAIL", "Invalid Credentials", 401));
    }

    let data = {
      id: client._id,
      email: client.email,
      role: client.role,
    };

    let accessToken = await generateToken(data, parseTime("1d", "s"));
    let refreshToken = await generateToken(data, parseTime("10d", "s"));

    if (!client.emailActive) {
      return next(new AppError("EMAIL_NOT_ACTIVE", "verify your email", 403));
    }

    client.active = true;
    await client.save({ validateBeforeSave: false });

    client.password = undefined;

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        accessToken,
        refreshToken,
        ...client.toObject(),
      },
    });
  }

  async checkEmail(req, res, next) {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("BAD_REQUEST", "invalid request data", 400));
    }

    const client = await Client.findOne({ email });

    if (!client) {
      return next(
        new AppError("USER_NOT_FOUND", `cannot find user with ${email}`, 404)
      );
    }

    const OTP = Math.floor(10000 + Math.random() * 90000).toString();
    client.createVerifyEmailOTP(OTP);
    await client.save();

    const mail = await sendMail(
      client.email,
      "Email Verification",
      null,
      `Verification Code is: ${OTP}`
    );

    if (mail.success) {
      return res.status(200).json({
        success: true,
        status: 200,
        data: client,
      });
    }

    client.verifyEmailOTPToken = undefined;
    client.verifyEmailExpires = undefined;
    await client.save({ validateBeforeSave: false });

    next(new AppError("EMAILING_ERROR", "error sending email", 500));
  }

  async verifyEmail(req, res, next) {
    let { OTP } = req.params;

    OTP = crypto.createHash("sha256").update(OTP).digest("hex");

    const client = await Client.findOneAndUpdate(
      {
        verifyEmailOTPToken: OTP,
        verifyEmailExpires: {
          $gt: Date.now(),
        },
      },
      {
        emailActive: true,
        $unset: {
          verifyEmailOTPToken: null,
          verifyEmailExpires: null,
        },
      },
      {
        new: true,
      }
    ).select("_id email");

    console.log(`Code: ${OTP}`);
    console.log(`Verifying email: `, client);

    if (!client) {
      return next(
        new AppError("USER_NOT_FOUND", "Token Expired or user not found", 404)
      );
    }

    client.expireAt = undefined;
    await client.save({ validateBeforeSave: false });
    let data = {
      id: client._id,
      email: client.email,
      role: client.role,
    };

    let accessToken = await generateToken(data, parseTime("5m", "s"));
    let refreshToken = await generateToken(data, parseTime("10m", "s"));

    res.status(200).json({
      success: true,
      status: 200,
      data: { accessToken, refreshToken, ...client.toObject() },
    });
  }

  async forgetPassword(req, res, next) {
    const { email } = req.body;

    const client = await Client.findOne({ email });

    if (!client) {
      return next(new AppError("CLIENT_NOT_FOUND", "email is not found", 404));
    }

    const OTP = Math.round(Math.random() * 90000) + 10000;
    // assign a token to catch the client with it
    await client.createForgotPasswordOTP(OTP.toString());
    await client.save({ validateBeforeSave: false });

    const msg = `forgot password code: ${OTP}\nif you didn't forget your password, simply ignore this email.`;
    const mail = await sendMail(client.email, "Forgot Password", null, msg);

    if (!mail.success) {
      client.forgotPasswordOTP = undefined;
      client.passwordResetExpires = undefined;
      await client.save({ validateBeforeSave: false });
      return next(
        new AppError("EMAIL_NOT_SENT", `couldn't send email to ${email}`, 500)
      );
    }

    res.status(200).json({
      status: 200,
      success: true,
      data: "forgot password email sent successfully",
    });
  }

  async verifyForgotPassword(req, res, next) {
    const { OTP } = req.params;

    const hashedOTP = crypto.createHash("sha256").update(OTP).digest("hex");

    const client = await Client.findOne({
      forgotPasswordOTP: hashedOTP,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!client) {
      return next(
        new AppError("CLIENT_NOT_FOUND", "OTP expired or user not found", 404)
      );
    }

    const resetToken = client.createPasswordResetTokenOTP();
    client.forgotPasswordOTP = undefined;
    await client.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        resetToken,
      },
    });
  }

  async resetPassword(req, res, next) {
    let { token } = req.params;
    const { password } = req.body;

    token = crypto.createHash("sha256").update(token).digest("hex");
    const client = await Client.findOne({
      passwordResetTokenOTP: token,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!client) {
      return next(
        new AppError(
          "CLIENT_NOT_FOUND",
          "token expired or client not found",
          404
        )
      );
    }

    client.password = password;
    client.passwordResetExpires = undefined;
    client.passwordResetTokenOTP = undefined;
    await client.save({ validateBeforeSave: false });

    client.password = undefined;

    res.status(200).json({
      status: 200,
      success: true,
      data: {
        client,
      },
    });
  }

  async updatePassword(req, res, next) {
    const { id } = req.user;
    const { password, currPassword } = req.body;

    const client = await Client.findById(id).select("+password");

    if (!client) {
      return next(new AppError("CLIENT_NOT_FOUND", "user not found", 404));
    }

    const correct = await client.checkPassword(currPassword, client.password);

    if (!correct) {
      // 300 for multiple Choices (things to do )
      return next(
        new AppError("INVALID_PASSWORD", "password is incorrect.", 300)
      );
    }

    client.password = password;
    await client.save();

    client.password = undefined;

    res.status(200).json({
      success: true,
      status: 200,
      data: "Password updated successfully",
    });
  }
}

export default new clientsAuthController();
