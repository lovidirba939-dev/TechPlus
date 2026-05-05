import mongoose from 'mongoose';

export const connectDB = async () => {
  const connect = async (uri) => {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
  };

  try{
    const uri = process.env.MONGO_URI
    if (!uri) {
      throw new Error("Missing MONGO_URI environment variable")
    }

    const fallbackUri = process.env.MONGO_URI_FALLBACK

    mongoose.set("strictQuery", true)

    try {
      await connect(uri)
    } catch (error) {
      const canRetryWithFallback =
        fallbackUri &&
        uri.startsWith('mongodb+srv://') &&
        /querySrv|ECONNREFUSED/i.test(error?.message || '')

      if (!canRetryWithFallback) {
        throw error
      }

      console.warn('Primary MongoDB SRV lookup failed, retrying with fallback URI')
      await connect(fallbackUri)
    }

    console.log("MongoDB Connected Successfully")
    
  } catch (error) {
    console.error("MongoDB connection failed:", error?.message || error)
    console.error("TIP: Ensure your IP address is allowlisted in MongoDB Atlas (Network Access).")
    if (process.env.NODE_ENV === "production") {
      console.error("Check Atlas IP allowlist, DB user credentials, and that MONGO_URI uses mongodb+srv://")
    }
    process.exit(1)
  }
}
