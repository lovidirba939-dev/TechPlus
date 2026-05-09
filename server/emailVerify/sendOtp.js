import nodemailer from "nodemailer";
import crypto from "crypto";

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// DO NOT cache as a module-level singleton — reset on failure
let transporter = null;

const clean = (value) => (value || "").trim().replace(/^"|"$/g, "");

const resolveClientUrl = () => {
  const fromClient = clean(process.env.CLIENT_URL);
  if (fromClient) return fromClient.replace(/\/$/, "");

  const fromAllowed = clean(process.env.ALLOWED_ORIGINS)
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, "").replace(/\/$/, ""))
    .find(Boolean);

  return fromAllowed || "http://localhost:5173";
};

const createTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    pool: false, // disable pooling so each message gets a fresh connection
    auth: {
      user: clean(process.env.EMAIL),
      pass: clean(process.env.EMAIL_PASS)
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,  // 15 s to establish connection
    greetingTimeout: 10000,    // 10 s for SMTP greeting
    socketTimeout: 20000       // 20 s idle socket timeout
  });

  return transporter;
};

/** Destroy the cached transporter so next call creates a fresh one */
const resetTransporter = () => {
  if (transporter) {
    try { transporter.close(); } catch (_) { /* ignore */ }
    transporter = null;
  }
};

export const sendOtpEmail = async (email, otp) => {
  const mailer = createTransporter();
  try {
    await mailer.sendMail({
      from: `"TechPlus" <${clean(process.env.EMAIL)}>`,
      to: email,
      subject: "Your OTP - TechPlus",
      html: `
        <div style="font-family: Arial; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #4F46E5;">Email Verification</h2>
            <p style="font-size: 16px; color: #666;">Your OTP is:</p>
            <h1 style="color: #4F46E5; letter-spacing: 8px; font-size: 32px;">${otp}</h1>
            <p style="color: #666;">Valid for <b>10 minutes</b> only.</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    resetTransporter(); // force a fresh connection next time
    console.error("[Email] sendOtpEmail failed:", err.message);
    throw err;
  }
};

export const sendResetEmail = async (email, resetToken) => {
  const mailer = createTransporter();
  const resetLink = `${resolveClientUrl()}/password-reset?token=${resetToken}`;
  try {
    await mailer.sendMail({
      from: `"TechPlus" <${clean(process.env.EMAIL)}>`,
      to: email,
      subject: "Password Reset - TechPlus",
      html: `
        <div style="font-family: Arial; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #4F46E5;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #666;">Click the button below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            <p style="color: #666; margin-top: 20px;">Or copy this link in your browser:</p>
            <p style="color: #4F46E5; word-break: break-all;">${resetLink}</p>
            <p style="color: #666;">This link will expire in <b>30 minutes</b>.</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    resetTransporter(); // force a fresh connection next time
    console.error("[Email] sendResetEmail failed:", err.message);
    throw err;
  }
};
