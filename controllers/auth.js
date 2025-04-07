const User = require("../models/User");
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ 
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,

      token });
};

const sendEmail = require('../utils/sendEmail');

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, tel } = req.body;

    // Create user (but don't mark as verified yet)
    const user = await User.create({
      name,
      email,
      password,
      role,
      tel,
    });

    // Generate a verification token
    const verificationToken = user.generateVerificationToken();

    // Send the email with the verification link
    const verificationUrl = `${process.env.CLIENT_URL}/api/v1/auth/verify-email?token=${verificationToken}`;

    const message = `Hello ${user.name},\n\nPlease verify your email by clicking on the following link:\n\n${verificationUrl}`;

    await sendEmail(user.email, "Email Verification", message);

    // Respond to the user
    res.status(200).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });

    await user.save();
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
      console.log(err.stack);
    }
};

// @desc    Login a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide an email and password" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
};

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

//@desc Log user out / clear cookie
//@route GET /api/v1/auth/logout
//@access Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  const { token } = req.query;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    // Check if the token is expired
    if (user.verificationExpires < Date.now()) {
      return res.status(400).json({ success: false, error: 'Token expired' });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Your email has been verified!' });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Invalid or expired token' });
    console.log(err.stack);
  }
};
