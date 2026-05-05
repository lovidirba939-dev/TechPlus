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

// Build allowed origins from all env sources
const allowedOrigins = (() => {
  const origins = new Set(['http://localhost:5173', 'http://localhost:3000'])
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/$/, '')).filter(Boolean).forEach(o => origins.add(o))
  }
  if (process.env.CLIENT_URL) origins.add(process.env.CLIENT_URL.trim().replace(/\/$/, ''))
  return [...origins]
})()

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return callback(null, true)
    if (process.env.NODE_ENV !== 'production') return callback(null, true)
    callback(new Error(`CORS: origin '${origin}' not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200
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
    const staticDir = path.join(__dirname, "../client/dist")
    app.use(express.static(staticDir))

    app.get("*", (req, res) => {
      res.sendFile(path.join(staticDir, "index.html"))
    })
  }
} else {
  app.get('/', (req, res) => {
    res.json({ success: true, message: "TechPlus Server Running" })
  })
}

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' })
})

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
    await Promise.all([
      ensurePlaylistsSeeded(),
      ensureRoadmapsSeeded(),
      fetchAndCacheNews().catch(() => {})
    ])

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      const email = process.env.EMAIL || 'MISSING';
      const maskedEmail = email !== 'MISSING' ? email.replace(/(.{2}).+(@.+)/, "$1***$2") : 'MISSING';
      console.log(`Email Service Status: ${process.env.EMAIL && process.env.EMAIL_PASS ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'} (${maskedEmail})`)
    })

    startHackathonSyncJob()
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message)
    process.exit(1)
  })
