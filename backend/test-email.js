const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Slotify Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to themselves to test
      subject: "Test Email from Slotify",
      text: "This is a test email.",
    });

    console.log("Email sent successfully!", info.messageId);
  } catch (error) {
    console.error("Failed to send email:");
    console.error(error);
  }
}

testEmail();
