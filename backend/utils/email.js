const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create a transporter
const getTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Generate test Ethereal account if no real credentials
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

const sendVerificationEmail = async (email, otp) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: `"Slotify" <${process.env.EMAIL_USER || 'no-reply@slotify.test'}>`,
      to: email,
      subject: "Slotify - Verify your email",
      html: `
        <h2>Welcome to Slotify!</h2>
        <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    });
    console.log("Verification email sent: %s", info.messageId);
    if (!process.env.EMAIL_USER) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error("Error sending verification email:", err);
  }
};

const sendBookingConfirmation = async (email, details) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: `"Slotify" <${process.env.EMAIL_USER || 'no-reply@slotify.test'}>`,
      to: email,
      subject: "Slotify - Booking Confirmed!",
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Your booking details:</p>
        <ul>
          <li><strong>Service:</strong> ${details.serviceName}</li>
          <li><strong>Centre:</strong> ${details.centreName}</li>
          <li><strong>Date:</strong> ${details.date}</li>
          <li><strong>Time:</strong> ${details.time}</li>
          <li><strong>Amount:</strong> ₹${details.price}</li>
        </ul>
        <p>Thank you for using Slotify!</p>
      `,
    });
    console.log("Booking confirmation email sent: %s", info.messageId);
    if (!process.env.EMAIL_USER) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error("Error sending booking email:", err);
  }
};

module.exports = {
  sendVerificationEmail,
  sendBookingConfirmation,
};
