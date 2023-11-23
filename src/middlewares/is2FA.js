import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import catchAsync from "../utils/catchAsync.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcryptjs";
import sendEmailWithNodemailer from "../utils/email.js";
import authService from "../services/auth.service.js";

const is2FA = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(
      new APIError({
        status: 401,
        message: "User not found.",
      })
    );
  } else if (user && user.enable2FA === false) {
    return next();
  }
  const OTP = await user.createOTPToken();
  await user.save({ validateBeforeSave: false });
  const emailData = authService.twoFA.createEmail(user.email, OTP);
  const resultSendEmail = await sendEmailWithNodemailer(emailData);
  authService.twoFA.verifyResult(next, resultSendEmail);

  res.status(200).json({
    message: "Please check your email to confirm OTP code.",
  });
});

export default is2FA;
