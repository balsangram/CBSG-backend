import nodemailer from "nodemailer";
import env from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html, text }) => {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn("Email credentials not configured. Skipping email to", to);
    return null;
  }
  console.log("Sending email to", to);

  return transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });
};

const sendOtpEmail = async (to, otp) => {
  const subject = `${env.APP_NAME} - Your login OTP`;
  const text = `Your ${env.APP_NAME} login OTP is ${otp}. It expires in 5 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">${env.APP_NAME} Login</h2>
      <p>Your one-time password is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                  background: #f4f4f4; padding: 16px; text-align: center;
                  border-radius: 8px;">${otp}</div>
      <p style="color: #666;">This OTP expires in 5 minutes. If you did not request it, ignore this email.</p>
    </div>
  `;

  try {
    return await sendMail({ to, subject, html, text });
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    return null;
  }
};

export { sendMail, sendOtpEmail };
