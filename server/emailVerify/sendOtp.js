import dns from "dns"
import nodemailer from "nodemailer"
import crypto from "crypto"

dns.setDefaultResultOrder?.("ipv4first")

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

const EMAIL_TIMEOUT_MS = Number(clean(process.env.EMAIL_STRATEGY_TIMEOUT_MS)) || 20000
const auth = () => ({
  user: clean(process.env.EMAIL),
  pass: clean(process.env.EMAIL_PASS)
})

const baseTimeouts = () => ({
  connectionTimeout: EMAIL_TIMEOUT_MS,
  greetingTimeout: EMAIL_TIMEOUT_MS,
  socketTimeout: EMAIL_TIMEOUT_MS,
  dnsTimeout: 15000
})

const createTransportStrategies = () => [
  {
    label: "gmail-service",
    config: {
      service: "gmail",
      auth: auth(),
      ...baseTimeouts()
    }
  },
  {
    label: "smtp-465",
    config: {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: auth(),
      ...baseTimeouts(),
      tls: { rejectUnauthorized: false }
    }
  },
  {
    label: "smtp-587",
    config: {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: auth(),
      ...baseTimeouts(),
      requireTLS: true,
      tls: { rejectUnauthorized: false }
    }
  }
]

async function sendWithGmail(mailOptions) {
  let lastError

  for (const { label, config } of createTransportStrategies()) {
    const transporter = nodemailer.createTransport(config)
    try {
      console.log(`[Email] Trying ${label}`)
      const info = await transporter.sendMail(mailOptions)
      console.log(`[Email] Sent via ${label}: ${info.messageId}`)
      return info
    } catch (error) {
      lastError = error
      console.error(`[Email] ${label} failed:`, error.message, error.code || "")
    } finally {
      try {
        transporter.close()
      } catch {
        // Ignore close errors after the send attempt finishes.
      }
    }
  }

  throw lastError || new Error("Email send failed")
}

export const sendOtpEmail = async (email, otp) => {
  await sendWithGmail({
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
}

export const sendResetEmail = async (email, resetToken, clientUrlOverride = "") => {
  const resetLink = `${resolveClientUrl(clientUrlOverride)}/password-reset?token=${resetToken}`

  await sendWithGmail({
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
}
