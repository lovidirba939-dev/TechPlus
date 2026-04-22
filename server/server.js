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

// ============ ENVIRONMENT VALIDATION ============
const requiredEnv = ['MONGO_URI', 'JWT_SECRET']
const missingEnv = requiredEnv.filter(env => !process.env[env])
if (missingEnv.length > 0) {
  console.error("Critical Error: Missing required environment variables:", missingEnv.join(', '))
  process.exit(1)
}

const app = express()
// Render / reverse proxies (needed for Secure cookies behind HTTPS proxies)
app.set("trust proxy", 1)

// ============ MIDDLEWARE ============
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(compression())

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true)
    }
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true) // permissive for dev
    }
    callback(new Error("Not allowed by CORS"))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(cookieParser())
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// ============ ROUTES ============
app.use('/api/auth', authLimiter, authRoute)
app.use('/api/user', userRoute)
app.use('/api/news', newsLimiter, newsRoute)
app.use('/api/hackathons', hackathonRoute)
app.use('/api/playlists', playlistRoute)
app.use('/api/roadmaps', roadmapRoute)

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: "ok" })
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.env.NODE_ENV === "production") {
  // In production we usually deploy frontend (Vercel) and backend (Render) separately.
  // Only serve static assets if explicitly enabled (e.g. single-server deployment).
  if (process.env.SERVE_STATIC === "true") {
    app.use(express.static(path.join(__dirname, "../Frontend/dist")))

    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../Frontend/dist", "index.html"))
    })
  }
} else {
  app.get('/', (req, res) => {
    res.json({ success: true, message: "TechPlus Server Running" })
  })

  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found' })
  })
}

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  const status = err.status || 500
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

// ============ SERVER STARTUP ============
const PORT = process.env.PORT || 5000

connectDB()
  .then(async () => {
    await ensurePlaylistsSeeded()
    await ensureRoadmapsSeeded()
    await fetchAndCacheNews().catch(() => {})

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })

    startHackathonSyncJob()
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message)
    process.exit(1)
  })
