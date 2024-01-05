import Coach from "../../models/Coaches/model.js";
import AppError from "../../utils/appError.js";
import { parseTime } from "../../utils/time.service.js";
import { generateToken } from "./../../utils/token.service.js";
import crypto from "crypto";
import sendMail from "../../utils/mailer.js";

class CoachAuthController {
  async signup(req, res, next) {
    const coachData = req.body;

    const foundCoach = await Coach.findOne({ email: coachData.email });

    if (foundCoach) {
      return next(
        new AppError("EMAIL_ALREADY_EXIST", "this email already exists", 400)
      );
    }

    const coach = new Coach(coachData);
    await coach.save();

    if (!coach) {
      return next(
        new AppError(
          "CREATING_USER_ERROR",
          "error while creating the user",
          500
        )
      );
    }
    coach.password = undefined;
    return res.status(200).json({
      success: true,
      status: 200,
      data: coach.toObject(),
    });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    // password is select: false, so +password to select it
    const coach = await Coach.findOne({ email }).select("+password");

    if (!coach || !(await coach.checkPassword(password, coach.password))) {
      return next(new AppError("LGOIN_FAIL", "Invalid Credentials", 401));
    }

    let tokenData = {
      id: coach._id,
      email: coach.email,
      role: coach.role,
    };

    const newAccessToken = await generateToken(tokenData, parseTime("1d", "s"));
    const newRefreshToken = await generateToken(
      tokenData,
      parseTime("10d", "s")
    );

    if (!coach.emailActive) {
      return next(new AppError("EMAIL_NOT_ACTIVE", "verify your email", 403));
    }

    coach.active = true;
    await coach.save({ validateBeforeSave: false });

    coach.password = undefined;

    res.status(200).json({
      success: true,
      status: 200,
      data: { newAccessToken, newRefreshToken, ...coach.toObject() },
    });
  }

  async logout(req, res, next) {
    const { id } = req.coach;

    if (id) {
      const coach = await Coach.findByIdAndUpdate(
        id,
        {
          active: false,
        },
        { new: true }
      );

      if (!coach) {
        return next(
          new AppError(
            "COACH_NOT_FOUND",
            "not found coach or not authenticated",
            404
          )
        );
      }
    }
    /*
    await req.session.destroy();

    res.clearCookie("REFRESH_TOKEN", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });*/

    res.status(200).json({
      success: true,
      status: 200,
      data: "logged out successfully.",
    });
  }

  async checkEmail(req, res, next) {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("BAD_REQUEST", "invalid request data", 400));
    }

    const coach = await Coach.findOne({ email });

    if (!coach) {
      return next(
        new AppError("USER_NOT_FOUND", `cannot find user with ${email}`, 404)
      );
    }

    const OTP = Math.floor(10000 + Math.random() * 90000).toString();
    coach.createVerifyEmailOTP(OTP);
    await coach.save();

    const mail = await sendMail(
      coach.email,
      "Email Verification",
      null,
      `Verification Code is: ${OTP}`
    );

    if (mail.success) {
      return res.status(200).json({
        success: true,
        status: 200,
        data: coach,
      });
    }

    coach.verifyEmailOTPToken = undefined;
    coach.verifyEmailExpires = undefined;
    await coach.save({ validateBeforeSave: false });

    next(new AppError("EMAILING_ERROR", "error sending email", 500));
  }

  async verifyEmail(req, res, next) {
    let { OTP } = req.params;

    OTP = crypto.createHash("sha256").update(OTP).digest("hex");

    const coach = await Coach.findOneAndUpdate(
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
    console.log(`Verifying email: `, coach);

    if (!coach) {
      return next(
        new AppError("USER_NOT_FOUND", "Token Expired or user not found", 404)
      );
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: coach,
    });
  }

  async forgetPassword(req, res, next) {
    const { email } = req.body;

    const coach = await Coach.findOne({ email });

    if (!coach) {
      return next(new AppError("COACH_NOT_FOUND", "email is not found", 404));
    }

    const OTP = Math.round(Math.random() * 90000) + 10000;
    // assign a token to catch the coach with it
    await coach.createForgotPasswordOTP(OTP.toString());
    await coach.save({ validateBeforeSave: false });

    const msg = `forgot password code: ${OTP}\n if you didn't forget your password, simply ignore this email.`;
    const mail = await sendMail(coach.email, "Forgot Password", null, msg);

    if (!mail.success) {
      coach.forgotPasswordOTP = undefined;
      coach.passwordResetExpires = undefined;
      await coach.save({ validateBeforeSave: false });
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

    const coach = await Coach.findOne({
      forgotPasswordOTP: hashedOTP,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!coach) {
      return next(
        new AppError("COACH_NOT_FOUND", "OTP expired or user not found", 404)
      );
    }

    coach.forgotPasswordOTP = undefined;

    const resetToken = coach.createPasswordResetTokenOTP();
    await coach.save({ validateBeforeSave: false });

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
    const coach = await Coach.findOne({
      passwordResetTokenOTP: token,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!coach) {
      return next(
        new AppError("COACH_NOT_FOUND", "token expired or coach not found", 404)
      );
    }

    coach.password = password;
    coach.passwordResetExpires = undefined;
    coach.passwordResetTokenOTP = undefined;
    await coach.save({ validateBeforeSave: false });

    coach.password = undefined;

    res.status(200).json({
      status: 200,
      success: true,
      data: {
        coach,
      },
    });
  }

  async updatePassword(req, res, next) {
    const { id } = req.user;
    const { password, currPassword } = req.body;

    const coach = await Coach.findById(id).select("+password");

    if (!coach) {
      return next(
        new AppError("COACH_NOT_FOUND", "You're not authorized", 403)
      );
    }

    const correct = await coach.checkPassword(currPassword, coach.password);

    if (!correct) {
      // 300 for multiple Choices (things to do )
      return next(
        new AppError("INVALID_PASSWORD", "password is incorrect", 300)
      );
    }

    coach.password = password;
    await coach.save();

    coach.password = undefined;

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        coach,
      },
    });
  }
}

export default new CoachAuthController();
