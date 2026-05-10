import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import validator from "validator"
import crypto from "crypto"
import { User } from "../models/userModel.js"
import { generateOtp, sendOtpEmail, sendResetEmail } from "../emailVerify/sendOtp.js"
import { buildAuthCookieOptions } from "../utils/cookies.js"

const cleanEnv = (value) =>
  String(value || "")
    .replace(/\\n|\\r/g, "")
    .replace(/\r|\n/g, "")
    .trim()
    .replace(/^"|"$/g, "")

function hasEmailConfig() {
  const hasSmtp = Boolean(cleanEnv(process.env.EMAIL) && cleanEnv(process.env.EMAIL_PASS))
  const hasBrevo = Boolean(cleanEnv(process.env.BREVO_API_KEY) && (cleanEnv(process.env.EMAIL_FROM) || cleanEnv(process.env.EMAIL)))
  return hasSmtp || hasBrevo
}

const normalizeEmail = (value) => String(value || "").trim().toLowerCase()
const EMAIL_TIMEOUT_MS = Number(process.env.EMAIL_TIMEOUT_MS) || 15000
const isMailTransportError = (error) => {
  const raw = `${error?.message || ""} ${error?.code || ""}`
  return /ENETUNREACH|ETIMEDOUT|EAI_AGAIN|ECONNREFUSED|ESOCKET|timeout|network|aborted/i.test(raw)
}

const toClientError = (error, fallback) => {
  if (isMailTransportError(error)) {
    return "Email service is temporarily unavailable. Please try again in a minute."
  }
  return error?.message || fallback
}
const maskEmail = (email) => {
  const [name = "", domain = ""] = String(email || "").split("@")
  if (!name || !domain) return email
  const prefix = name.slice(0, 2)
  return `${prefix}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`
}

async function sendEmailWithTimeout(task) {
  return Promise.race([
    task,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Email service timeout. Please try again.")), EMAIL_TIMEOUT_MS)
    })
  ])
}

// ================== REGISTER ==================
export const register = async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body
    const email = normalizeEmail(req.body.email)

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long, contain uppercase, lowercase, a number and a special character"
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" })
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ success: false, message: "Username must be 3-50 characters" })
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      if (existingUser.email === email && !existingUser.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = generateOtp()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

        existingUser.username = username
        existingUser.password = hashedPassword
        existingUser.otp = otp
        existingUser.otpExpires = otpExpires
        await existingUser.save()

        if (hasEmailConfig()) {
          await sendEmailWithTimeout(sendOtpEmail(email, otp))
        }

        return res.status(200).json({
          success: true,
          message: hasEmailConfig() ? "Account exists but unverified. New OTP sent." : "OTP regenerated in development mode.",
          ...(hasEmailConfig() ? {} : { devOtp: otp })
        })
      }
      return res.status(400).json({ success: false, message: "Email or username already registered" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate OTP
    const otp = generateOtp()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false
    })

    // Only attempt to send email if config is present; skip gracefully in dev mode
    if (hasEmailConfig()) {
      await sendEmailWithTimeout(sendOtpEmail(email, otp))
    }

    res.status(201).json({
      success: true,
      message: hasEmailConfig() ? "OTP sent to your email. Please verify." : "OTP generated in development mode.",
      ...(hasEmailConfig() ? {} : { devOtp: otp })
    })

  } catch (error) {
    console.error("[Auth] Register email error:", error.message, error.code || "")
    res.status(500).json({ success: false, message: toClientError(error, "Registration failed") })
  }
}

// ================== VERIFY OTP ==================
export const verifyOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const { otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Already verified" })
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" })
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired. Request new one." })
    }

    user.isVerified = true
    user.otp = null
    user.otpExpires = null
    await user.save()

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie('techplus_token', token, buildAuthCookieOptions())

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: toClientError(error, "OTP verification failed") })
  }
}

// ================== RESEND OTP ==================
export const resendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    if (user.isVerified) return res.status(400).json({ success: false, message: "Already verified" })

    const otp = generateOtp()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    user.otp = otp
    user.otpExpires = otpExpires
    await user.save()

    // Only attempt to send email if config is present
    if (hasEmailConfig()) {
      await sendEmailWithTimeout(sendOtpEmail(email, otp))
    }

    res.status(200).json({
      success: true,
      message: hasEmailConfig() ? "New OTP sent!" : "OTP regenerated in development mode.",
      ...(hasEmailConfig() ? {} : { devOtp: otp })
    })

  } catch (error) {
    console.error("[Auth] Resend OTP error:", error.message, error.code || "")
    res.status(500).json({ success: false, message: toClientError(error, "Failed to resend OTP") })
  }
}

// ================== LOGIN ==================
export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const { password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: "Please verify your email first" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ success: false, message: "Wrong password" })

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie('techplus_token', token, buildAuthCookieOptions())

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: toClientError(error, "Login failed") })
  }
}

// ================== LOGOUT ==================
export const logout = async (req, res) => {
  try {
    res.clearCookie('techplus_token', buildAuthCookieOptions())

    res.status(200).json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ================== FORGOT PASSWORD ==================
export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({ success: true, message: "If email exists, reset link sent" })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000) // 30 min

    user.resetToken = resetToken
    user.resetTokenExpires = resetTokenExpires
    await user.save()

    console.log(`[Auth] ForgotPassword request for: ${email}. Email config detected: ${hasEmailConfig()}`);

    if (hasEmailConfig()) {
      const originFromClient = String(req.body?.clientOrigin || "").trim()
      const originFromHeader = String(req.headers.origin || "").trim()
      await sendEmailWithTimeout(
        sendResetEmail(email, resetToken, originFromClient || originFromHeader)
      )
    }

    res.status(200).json({
      success: true,
      message: hasEmailConfig() ? "Password reset email sent" : "Password reset token generated in development mode",
      recipientHint: maskEmail(email),
      ...(hasEmailConfig() ? {} : { devResetToken: resetToken })
    })

  } catch (error) {
    console.error("[Auth] ForgotPassword error:", error.message, error.code || "", error.responseCode || "")
    res.status(500).json({ success: false, message: toClientError(error, "Failed to send reset email") })
  }
}

// ================== RESET PASSWORD ==================
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long, contain uppercase, lowercase, a number and a special character"
      })
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.resetToken = null
    user.resetTokenExpires = null
    await user.save()

    res.status(200).json({ success: true, message: "Password reset successful" })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
