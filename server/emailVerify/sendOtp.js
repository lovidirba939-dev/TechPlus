import nodemailer from "nodemailer"
import crypto from "crypto"

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString()
}

const clean = (value) =>
  String(value || "")
    .replace(/\\n|\\r/g, "")
    .replace(/\r|\n/g, "")
    .trim()
    .replace(/^"|"$/g, "")

const resolveClientUrl = (overrideUrl) => {
  const override = clean(overrideUrl)
  if (/^https?:\/\/[^/\s]+/i.test(override)) return override.replace(/\/$/, "")

  const clientUrl = clean(process.env.CLIENT_URL)
  if (/^https?:\/\/[^/\s]+/i.test(clientUrl)) return clientUrl.replace(/\/$/, "")

  return "http://localhost:5173"
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: clean(process.env.EMAIL),
      pass: clean(process.env.EMAIL_PASS)
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false
    }
  })
}

export const sendOtpEmail = async (email, otp) => {
  const transporter = createTransporter()

  try {
    await transporter.sendMail({
      from: clean(process.env.EMAIL),
      to: email,
      subject: "Your OTP - TechPlus News",
      html: `
        <div style="font-family: Arial; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #4F46E5;">Email Verification</h2>
            <p style="font-size: 16px; color: #666;">Your OTP is:</p>
            <h1 style="color: #4F46E5; letter-spacing: 8px; font-size: 32px;">${otp}</h1>
            <p style="color: #666;">Valid for <b>10 minutes</b> only.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this OTP, please ignore this email.</p>
          </div>
        </div>
      `
    })
  } finally {
    try {
      transporter.close()
    } catch {
      // Ignore close errors after the send attempt finishes.
    }
  }
}

export const sendResetEmail = async (email, resetToken, clientUrlOverride = "") => {
  const transporter = createTransporter()
  const resetLink = `${resolveClientUrl(clientUrlOverride)}/password-reset?token=${resetToken}`

  try {
    await transporter.sendMail({
      from: clean(process.env.EMAIL),
      to: email,
      subject: "Password Reset - TechPlus News",
      html: `
        <div style="font-family: Arial; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #4F46E5;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #666;">Click the button below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            <p style="color: #666; margin-top: 20px;">Or copy this link in your browser:</p>
            <p style="color: #4F46E5; word-break: break-all;">${resetLink}</p>
            <p style="color: #666;">This link will expire in <b>30 minutes</b>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this password reset, please ignore this email.</p>
          </div>
        </div>
      `
    })
  } finally {
    try {
      transporter.close()
    } catch {
      // Ignore close errors after the send attempt finishes.
    }
  }
}
