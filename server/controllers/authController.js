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
  return Boolean(cleanEnv(process.env.EMAIL) && cleanEnv(process.env.EMAIL_PASS))
}

const isProduction = cleanEnv(process.env.NODE_ENV) === "production"
const EMAIL_TIMEOUT_MS = Number(process.env.EMAIL_TIMEOUT_MS) || 15000
async function sendEmailWithTimeout(task) {
  return Promise.race([
    task,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Email service timeout")), EMAIL_TIMEOUT_MS)
    })
  ])
}

const toEmailErrorMessage = (error) => {
  const raw = `${error?.message || ""} ${error?.code || ""}`
  if (/relay authentication failed|Unauthorized email relay request/i.test(raw)) {
    return "Email relay authentication failed. Please contact support and retry."
  }
  if (/Email relay is not configured/i.test(raw)) {
    return "Email relay is not configured. Please contact support and retry."
  }
  if (/timeout|ETIMEDOUT|ECONNECTION|ENETUNREACH|ECONNREFUSED/i.test(raw)) {
    return "Email service connection timeout. Please try again shortly."
  }
  return error?.message || "Email service failed"
}

const normalizeEmail = (value) => String(value || "").trim().toLowerCase()
const normalizeUsername = (value) => String(value || "").trim()
const emailUnavailable = () => ({
  success: false,
  message: "Email service is not configured. Please add EMAIL and EMAIL_PASS on Render."
})

// ================== REGISTER ==================
export const register = async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username)
    const email = normalizeEmail(req.body.email)
    const { password, confirmPassword } = req.body

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

    const existingByEmail = await User.findOne({ email })
    const existingByUsername = await User.findOne({ username })

    if (existingByUsername && existingByUsername.email !== email) {
      if (!existingByUsername.isVerified) {
        await User.deleteOne({ _id: existingByUsername._id, isVerified: false })
      } else {
        return res.status(400).json({ success: false, message: "Username already taken" })
      }
    }

    if (existingByEmail?.isVerified) {
      return res.status(400).json({ success: false, message: "Email already registered. Please log in." })
    }

    if (!hasEmailConfig() && isProduction) {
      return res.status(503).json(emailUnavailable())
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = generateOtp()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    if (existingByEmail && !existingByEmail.isVerified) {
      existingByEmail.username = username
      existingByEmail.password = hashedPassword
      existingByEmail.otp = otp
      existingByEmail.otpExpires = otpExpires
      await existingByEmail.save()

      if (hasEmailConfig()) {
        try {
          await sendEmailWithTimeout(sendOtpEmail(email, otp))
        } catch (emailError) {
          await User.deleteOne({ _id: existingByEmail._id, isVerified: false })
          return res.status(503).json({ success: false, message: toEmailErrorMessage(emailError) })
        }
      }

      return res.status(200).json({
        success: true,
        message: hasEmailConfig() ? "New OTP sent. Please verify your email." : "OTP regenerated in development mode.",
        ...(hasEmailConfig() ? {} : { devOtp: otp })
      })
    }

    if (hasEmailConfig()) {
      try {
        await sendEmailWithTimeout(sendOtpEmail(email, otp))
      } catch (emailError) {
        return res.status(503).json({ success: false, message: toEmailErrorMessage(emailError) })
      }
    }

    await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false
    })

    res.status(201).json({
      success: true,
      message: hasEmailConfig() ? "OTP sent to your email. Please verify." : "OTP generated in development mode.",
      ...(hasEmailConfig() ? {} : { devOtp: otp })
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
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
    res.status(500).json({ success: false, message: error.message })
  }
}

// ================== RESEND OTP ==================
export const resendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" })
    }

    if (!hasEmailConfig() && isProduction) {
      return res.status(503).json(emailUnavailable())
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
      try {
        await sendEmailWithTimeout(sendOtpEmail(email, otp))
      } catch (emailError) {
        return res.status(503).json({ success: false, message: toEmailErrorMessage(emailError) })
      }
    }

    res.status(200).json({
      success: true,
      message: hasEmailConfig() ? "New OTP sent!" : "OTP regenerated in development mode.",
      ...(hasEmailConfig() ? {} : { devOtp: otp })
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
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
    res.status(500).json({ success: false, message: error.message })
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

    if (!hasEmailConfig() && isProduction) {
      return res.status(503).json(emailUnavailable())
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email. Please sign up first." })
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
      try {
        await sendEmailWithTimeout(sendResetEmail(email, resetToken, originFromClient || originFromHeader))
      } catch (emailError) {
        return res.status(503).json({ success: false, message: toEmailErrorMessage(emailError) })
      }
    }

    res.status(200).json({
      success: true,
      message: hasEmailConfig() ? "Password reset email sent" : "Password reset token generated in development mode",
      recipientHint: email
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
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
