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

const resolveRelayUrl = () => {
  const explicitRelay = clean(process.env.EMAIL_RELAY_URL)
  if (/^https?:\/\/[^/\s]+/i.test(explicitRelay)) return explicitRelay

  return "https://tech-plus-woad.vercel.app/api/send-email"
}

const baseTimeouts = () => ({
  connectionTimeout: EMAIL_TIMEOUT_MS,
  greetingTimeout: EMAIL_TIMEOUT_MS,
  socketTimeout: EMAIL_TIMEOUT_MS,
  dnsTimeout: 15000
})

const createTransportStrategies = () => [
  {
    label: "smtp-465-ipv4",
    resolveHost: true,
    config: {
      port: 465,
      secure: true,
      auth: auth(),
      ...baseTimeouts(),
      family: 4,
      tls: {
        rejectUnauthorized: false,
        servername: "smtp.gmail.com"
      }
    }
  },
  {
    label: "gmail-service-ipv4",
    config: {
      service: "gmail",
      auth: auth(),
      ...baseTimeouts(),
      family: 4
    }
  },
  {
    label: "smtp-465-hostname",
    config: {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: auth(),
      ...baseTimeouts(),
      family: 4,
      tls: { rejectUnauthorized: false }
    }
  }
]

async function sendWithGmail(mailOptions) {
  let lastError

  for (const strategy of createTransportStrategies()) {
    const hosts = strategy.resolveHost
      ? await dns.promises.resolve4("smtp.gmail.com").catch(() => ["smtp.gmail.com"])
      : [strategy.config.host || "smtp.gmail.com"]

    for (const host of hosts) {
      const config = { ...strategy.config, host }
      const transporter = nodemailer.createTransport(config)
      try {
        console.log(`[Email] Trying ${strategy.label} (${host})`)
        const info = await transporter.sendMail(mailOptions)
        console.log(`[Email] Sent via ${strategy.label}: ${info.messageId}`)
        return info
      } catch (error) {
        lastError = error
        console.error(`[Email] ${strategy.label} failed:`, error.message, error.code || "")
      } finally {
        try {
          transporter.close()
        } catch {
          // Ignore close errors after the send attempt finishes.
        }
      }
    }
  }

  throw lastError || new Error("Email send failed")
}

async function sendWithHttpRelay(mailOptions) {
  const relayUrl = resolveRelayUrl()
  const relaySecret = clean(process.env.EMAIL_RELAY_SECRET) || clean(process.env.EMAIL_PASS)

  if (!relayUrl || !relaySecret) {
    return null
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS)

  try {
    const response = await fetch(relayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-email-relay-secret": relaySecret
      },
      body: JSON.stringify({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        smtpUser: auth().user,
        smtpPass: auth().pass
      }),
      signal: controller.signal
    })

    const text = await response.text()
    let data = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { message: text }
    }

    if (!response.ok || data.success === false) {
      throw new Error(data.message || `Email relay failed with status ${response.status}`)
    }

    console.log(`[Email] Sent via HTTPS relay: ${data.messageId || "ok"}`)
    return data
  } finally {
    clearTimeout(timeout)
  }
}

async function sendEmail(mailOptions) {
  const relayResult = await sendWithHttpRelay(mailOptions)
  if (relayResult) return relayResult

  return sendWithGmail(mailOptions)
}

export const sendOtpEmail = async (email, otp) => {
  await sendEmail({
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

  await sendEmail({
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
