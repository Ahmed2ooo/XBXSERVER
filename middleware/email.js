const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



const sendEmail = async (userName, email, verifctionCode) => {
  try {
    const info = await transporter.sendMail({
      from: '"XBX Team 💚" <' + process.env.EMAIL_USER + ">",
      to: email,
      subject: "Verify Your Email Address At XBX ✔",
      html: `<p>Dear ${userName},</p>

            <p>Welcome to XBX!</p>

            <p>To complete your registration and secure your account, please verify your email address by entering the verification code below:</p>

            <h2 style="text-align: center; color: #333;">${verifctionCode}</h2>

            <p>If you didn’t request this, please ignore this email. </p>

            <p>Thank you for choosing XBX!</p>

            <p>Best regards,<br>The XBX Team</p>`,
    });
    console.log(`Email sent: ${info}`);
    return info.messageId;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};



// Exporting the function
module.exports = sendEmail;
