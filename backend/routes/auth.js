const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, location } = req.body;
    let user = await User.findOne({ email });
    
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const parsedLocation = typeof location === 'string' ? { city: location } : location;

    if (user && !user.isVerified) {
      // update unverified user
      user.name = name;
      user.password = password;
      user.phone = phone;
      user.role = role;
      user.location = parsedLocation;
      user.verificationOtp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      user = await User.create({ name, email, password, phone, role, location: parsedLocation, verificationOtp: otp, otpExpiresAt });
    }

    // Send email
    await sendVerificationEmail(user.email, otp);

    res.status(200).json({
      message: 'OTP sent to email. Please verify to complete registration.',
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    
    if (user.verificationOtp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified. Please register again to get an OTP.' });
    }

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;