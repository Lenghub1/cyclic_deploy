import mongoose from "mongoose";
import validator from "validator";
import slugify from "slugify";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import otpGenerator from "otp-generator";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z ]+$/, // Include atleast one string
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z ]+$/,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate: validator.isEmail,
    },
    profilePicture: String,
    slug: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator(val) {
          return validator.isStrongPassword(val, {
            minSymbols: 1,
            minUppercase: 1,
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
          });
        },
      },
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    forgotPasswordToken: String,
    forgotPasswordExpires: Date,
    passwordChangeAt: Date,
    active: {
      type: Boolean,
      default: true, // user not yet activate account
    },
    enable2FA: {
      type: Boolean,
      default: false,
    },
    OTP: String,
    OTPExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto delete document if user not activate their account for 10 minutes.
userSchema.index(
  { updatedAt: 1 },
  { expireAfterSeconds: 10 * 60, partialFilterExpression: { active: false } }
);

userSchema.pre("save", function (next) {
  if (this.isModified("firstName") || this.isModified("lastName")) {
    const fullName = `${this.firstName} ${this.lastName}`;
    this.slug = slugify(fullName + "-" + Date.now(), {
      lower: true,
      strict: true,
    });
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Methods
userSchema.methods.verifyPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.forgotPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.createOTPToken = async function () {
  const OTP = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const salt = await bcrypt.genSalt(10);
  this.OTP = await bcrypt.hash(OTP, salt);
  this.OTPExpires = Date.now() + 10 * 60 * 1000;
  return OTP;
};

const User = mongoose.model("User", userSchema);
export default User;
