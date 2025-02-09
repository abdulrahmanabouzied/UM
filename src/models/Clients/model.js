import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { parseTime } from '../../utils/time.service.js';

const salt = 10;

const clientSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'fullname-required'],
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coaches',
      required: false,
    },
    email: {
      type: String,
      required: [true, 'email-required'],
      unique: [true, 'Email exists'],
      trim: true,
      validate: [validator.isEmail, '{VALUE} is not a valid email'],
    },
    // /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    password: {
      type: String,
      required: [true, 'password-required'],
      minLength: 8,
      maxLength: 26,
      select: false,
    },
    subscriptionType: {
      type: String,
      enum: {
        values: ['premium', 'guest'],
        message: '{VALUE} is not a valid role',
      },
      default: 'guest',
    },
    role: {
      type: String,
      enum: ['client'],
      default: 'client',
    },
    status: String,
    weight: Number,
    height: Number,
    contactNumber: String,
    healthIssues: String,
    goals: [String],
    activityLevel: {
      type: String,
      enum: ['Inactive', 'Moderately Active', 'Vigorously Active'],
    },
    inbody: Object,
    inbodyRequested: {
      type: Boolean,
      default: false,
    },
    picture: {
      type: Object,
      default: {
        public_id: 'defaults/iejdq46a9tedxwdku6xi',
        format: 'JPG',
        resource_type: 'image',
        type: 'upload',
        url: 'https://res.cloudinary.com/dquzat4lc/image/upload/v1702239304/defaults/iejdq46a9tedxwdku6xi.jpg',
        secure_url:
          'https://res.cloudinary.com/dquzat4lc/image/upload/f_auto,q_auto/v1/defaults/iejdq46a9tedxwdku6xi',
        folder: 'defaults',
      },
    },
    dateOfBirth: {
      type: Date,
      // validate: [validator.isDate, "{VALUE} is not a valid date"],
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      // required: [true, "gender is required"],
    },
    allergies: String,
    WorkoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientWorkouts',
      default: null,
    },
    NutritionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientDiets',
      default: null,
    },
    SupplementPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientSupplements',
      default: null,
    },
    savedBlogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
      },
    ],
    active: { type: Boolean, default: false },
    emailActive: { type: Boolean, default: false },
    verifyEmailOTPToken: String,
    verifyEmailExpires: Date,
    forgotPasswordOTP: String,
    passwordResetTokenOTP: String,
    passwordResetExpires: Date,
    notifications: [
      {
        title: String,
        message: String,
        date: {
          type: Date,
          default: Date.now,
        },
        data: Object,
        seen: {
          type: Boolean,
          default: false,
        },
      },
    ],
    expireAt: {
      type: Date,
      // default: Date.now,
      expires: parseTime('1m', 's'),
    },
    ssoAuth: {
      googleId: { type: String },
      facebookId: { type: String },
    },
  },
  { timestamps: true }
);

clientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (this.isNew) {
    this.expireAt = new Date(Date.now() + parseTime('1d'));
  }
  this.password = await bcrypt.hash(this.password, salt);
  next;
});

clientSchema.methods.checkPassword = async function (
  candidatePassword,
  validPassword
) {
  return await bcrypt.compare(candidatePassword, validPassword);
};

clientSchema.methods.createVerifyEmailOTP = async function (OTP) {
  this.verifyEmailOTPToken = crypto
    .createHash('sha256')
    .update(OTP)
    .digest('hex');

  console.log({ OTP }, 'Verify email', this.verifyEmailOTPToken);

  this.verifyEmailExpires = new Date(Date.now() + 10 * 60 * 1000);
  return OTP;
};

clientSchema.methods.createForgotPasswordOTP = async function (OTP) {
  this.forgotPasswordOTP = crypto
    .createHash('sha256')
    .update(OTP)
    .digest('hex');

  console.log({ OTP }, 'forgotten password', this.forgotPasswordOTP);
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return OTP;
};

clientSchema.methods.createPasswordResetTokenOTP = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetTokenOTP = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, 'password reset token', this.passwordResetToken);
  this.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 10);

  return resetToken;
};

// virtuals

// calc the BMI
clientSchema.virtual('BMI').get(function () {
  // weight in kg, height in m
  return (this.weight / (this.height / 100) ** 2).toFixed(2) || 0;
});

// to get the client inbody url
// clientSchema.virtual("inbody.url").get(function () {
//   if (this.inbody && this.inbody.path) {
//     return `${process.env.BASE_URL || "http://localhost:4000"}/files/uploads/${
//       this.inbody.filename
//     }`;
//   }
//   return null;
// });

clientSchema.set('toObject', { virtuals: true });

const Client = mongoose.model('Clients', clientSchema);

export default Client;
