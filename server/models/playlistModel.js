import mongoose from "mongoose"

const playlistSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    group: { type: String, default: "", trim: true },
    domain: { type: String, default: "", trim: true, index: true },
    title: { type: String, required: true, trim: true },
    platform: { type: String, default: "", trim: true },
    resourceType: { type: String, default: "", trim: true, index: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    totalDuration: { type: String, default: "" },
    difficulty: { type: String, default: "" },
    externalUrl: { type: String, default: null },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
)

playlistSchema.index({ category: 1, title: 1 })
playlistSchema.index({ domain: 1, resourceType: 1, title: 1 })

export const Playlist = mongoose.model("Playlist", playlistSchema)
