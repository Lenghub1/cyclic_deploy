import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import catchAsync from "../utils/catchAsync.js";

const isRecentlySignup = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new APIError({
        status: 404,
        message: "Please Sign up first!",
      })
    );
  } else if (user.active) {
    return next(
      new APIError({
        status: 400,
        message:
          "Your account is already active. No need to resend activation.",
      })
    );
  }

  req.user = user;
  return next();
});

export default isRecentlySignup;
