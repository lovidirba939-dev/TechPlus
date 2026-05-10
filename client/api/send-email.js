import nodemailer from "nodemailer"

const clean = (value) =>
  String(value || "")
    .replace(/\\n|\\r/g, "")
    .replace(/\r|\n/g, "")
    .trim()
    .replace(/^"|"$/g, "")

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""))

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const acceptedSecrets = [clean(process.env.EMAIL_RELAY_SECRET), clean(process.env.EMAIL_PASS)]
    .filter(Boolean)
    .filter((value, index, items) => items.indexOf(value) === index)
  const providedSecret = clean(req.headers["x-email-relay-secret"])

  if (acceptedSecrets.length === 0 || !acceptedSecrets.includes(providedSecret)) {
    return res.status(401).json({ success: false, message: "Unauthorized email relay request" })
  }

  let body = req.body || {}
  if (typeof body === "string") {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }

  const emailUser = clean(process.env.EMAIL)
  const emailPass = clean(process.env.EMAIL_PASS)
  const from = clean(body.from) || emailUser
  const to = clean(body.to)
  const subject = clean(body.subject)
  const html = String(body.html || "")

  if (!emailUser || !emailPass) {
    return res.status(503).json({ success: false, message: "Email credentials are not configured on Vercel" })
  }

  if (!isEmail(to) || !subject || !html) {
    return res.status(400).json({ success: false, message: "Invalid email payload" })
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false
    }
  })

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html
    })

    return res.status(200).json({
      success: true,
      messageId: info.messageId
    })
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: error?.message || "Email send failed"
    })
  } finally {
    try {
      transporter.close()
    } catch {
      // Ignore close errors after the relay attempt finishes.
    }
  }
}
