import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import compression from "compression"
import path from "path"
import { fileURLToPath } from "url"
import { connectDB } from "./database/db.js"
import authRoute from "./routes/authRoute.js"
import userRoute from "./routes/userRoute.js"
import newsRoute from "./routes/newsRoute.js"
import hackathonRoute from "./routes/hackathonRoute.js"
import playlistRoute from "./routes/playlistRoute.js"
import roadmapRoute from "./routes/roadmapRoute.js"
import { authLimiter, newsLimiter } from "./middleware/rateLimiter.js"
import { startHackathonSyncJob } from "./cron/hackathonSync.js"
import { ensurePlaylistsSeeded } from "./services/playlistCatalogSeed.js"
import { ensureRoadmapsSeeded } from "./services/roadmapSeedService.js"
import { fetchAndCacheNews } from "./services/newsService.js"
import cookieParser from "cookie-parser"

dotenv.config()
const clean = (value) => (value || "").trim().replace(/^"|"$/g, "")
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const requiredEnv = ["MONGO_URI", "JWT_SECRET"]
const missingEnv = requiredEnv.filter((env) => !clean(process.env[env]))
if (missingEnv.length > 0) {
  console.error("Critical Error: Missing required environment variables:", missingEnv.join(", "))
  process.exit(1)
}

const app = express()
app.set("trust proxy", 1)

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(compression())

const allowedOrigins = (() => {
  const origins = new Set(["http://localhost:5173", "http://localhost:3000"])

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS
      .split(",")
      .map((o) => clean(o).replace(/\/$/, ""))
      .filter(Boolean)
      .forEach((o) => origins.add(o))
  }

  if (process.env.CLIENT_URL) {
    origins.add(clean(process.env.CLIENT_URL).replace(/\/$/, ""))
  }

  return [...origins]
})()

const allowedOriginMatchers = allowedOrigins.map((origin) => {
  if (origin === "*") return { type: "all" }
  if (origin.includes("*")) {
    const regex = new RegExp(`^${escapeRegex(origin).replace(/\\\*/g, ".*")}$`)
    return { type: "pattern", regex }
  }
  return { type: "exact", value: origin }
})

const isOriginAllowed = (origin) =>
  allowedOriginMatchers.some((matcher) => {
    if (matcher.type === "all") return true
    if (matcher.type === "exact") return matcher.value === origin
    if (matcher.type === "pattern") return matcher.regex.test(origin)
    return false
  })

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (isOriginAllowed(origin)) return callback(null, true)
    if (process.env.NODE_ENV !== "production") return callback(null, true)
    callback(new Error(`CORS: origin '${origin}' not allowed`))
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  optionsSuccessStatus: 200
}))

app.use(cookieParser())
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true, limit: "5mb" }))

app.use("/api/auth", authLimiter, authRoute)
app.use("/api/user", userRoute)
app.use("/api/news", newsLimiter, newsRoute)
app.use("/api/hackathons", hackathonRoute)
app.use("/api/playlists", playlistRoute)
app.use("/api/roadmaps", roadmapRoute)

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok" })
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.env.NODE_ENV === "production") {
  if (process.env.SERVE_STATIC === "true") {
    const staticDir = path.join(__dirname, "../client/dist")
    app.use(express.static(staticDir))

    app.get("*", (req, res) => {
      res.sendFile(path.join(staticDir, "index.html"))
    })
  }
} else {
  app.get("/", (req, res) => {
    res.json({ success: true, message: "TechPlus Server Running" })
  })
}

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" })
})

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  const status = err.status || 500
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error"
  })
})

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      const rawEmail = clean(process.env.EMAIL) || "MISSING"
      const maskedEmail = rawEmail !== "MISSING" ? rawEmail.replace(/(.{2}).+(@.+)/, "$1***$2") : "MISSING"
      console.log(`Email Service Status: ${clean(process.env.EMAIL) && clean(process.env.EMAIL_PASS) ? "CONFIGURED" : "NOT CONFIGURED"} (${maskedEmail})`)
    })

    startHackathonSyncJob()

    if (process.env.ENABLE_STARTUP_WARMUPS === "true") {
      setTimeout(() => {
        Promise.allSettled([
          ensurePlaylistsSeeded(),
          ensureRoadmapsSeeded(),
          fetchAndCacheNews()
        ]).catch(() => {})
      }, 12000)
    }
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err.message)
    process.exit(1)
  })
