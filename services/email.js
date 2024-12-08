const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP via email
const sendOTPEmail = async (email, otp) => {
  console.log(process.env.EMAIL_PASS, process.env.EMAIL_USER);
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP sent to email:", email);
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOTPEmail;
