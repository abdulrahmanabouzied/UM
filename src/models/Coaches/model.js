import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

const salt = 10;

const coachSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: [true, "email must be unique"],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "email must be a valid email"],
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 26,
      select: false,
    },
    picture: {
      type: Object,
      default: {
        public_id: "defaults/iejdq46a9tedxwdku6xi",
        format: "JPG",
        resource_type: "image",
        type: "upload",
        url: "https://res.cloudinary.com/dquzat4lc/image/upload/v1702239304/defaults/iejdq46a9tedxwdku6xi.jpg",
        secure_url:
          "https://res.cloudinary.com/dquzat4lc/image/upload/f_auto,q_auto/v1/defaults/iejdq46a9tedxwdku6xi",
        folder: "defaults",
      },
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    bannerImage: {
      type: Object,
      required: false,
    },
    notifications: [
      {
        message: String,
        date: {
          type: Date,
          // validate: [validator.isDate, "Invalid Date"],
          default: Date.now,
        },
        seen: {
          type: Boolean,
          default: false,
        },
      },
    ],
    clients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clients",
      },
    ],
    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blogs",
      },
    ],
    active: { type: Boolean, default: false }, // logged in
    emailActive: { type: Boolean, default: true },
    verifyEmailOTPToken: String,
    verifyEmailExpires: Date,
    forgotPasswordOTP: String,
    passwordResetTokenOTP: String,
    passwordResetExpires: Date,
    role: {
      type: String,
      enum: ["coach"],
      default: "coach",
    },
  },
  { timestamps: true }
);

coachSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, salt);
  next();
});

coachSchema.methods.checkPassword = async (
  candidatePassword,
  validPassword
) => {
  // using this.password
  return await bcrypt.compare(candidatePassword, validPassword);
};

coachSchema.methods.createVerifyEmailOTP = async function (OTP) {
  this.verifyEmailOTPToken = crypto
    .createHash("sha256")
    .update(OTP)
    .digest("hex");

  console.log({ OTP }, "Verify email", this.verifyEmailOTPToken);

  this.verifyEmailExpires = new Date(Date.now() + 10 * 60 * 1000);
  return OTP;
};

coachSchema.methods.createForgotPasswordOTP = async function (OTP) {
  this.forgotPasswordOTP = crypto
    .createHash("sha256")
    .update(OTP)
    .digest("hex");

  console.log({ OTP }, "forgotten password", this.forgotPasswordOTP);
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return OTP;
};

coachSchema.methods.createPasswordResetTokenOTP = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetTokenOTP = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, "password reset token", this.passwordResetToken);
  this.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 10);

  return resetToken;
};

const Coach = mongoose.model("Coaches", coachSchema);

export default Coach;
