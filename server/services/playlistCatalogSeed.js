import { Playlist } from "../models/playlistModel.js"
import { PlaylistVideo } from "../models/playlistVideoModel.js"
import { LEGACY_CATALOG } from "../data/legacyResourcesCatalog.mjs"

/**
 * Inserts the default Resources catalog (playlists + videos + external links).
 * @param {{ reset?: boolean }} options - If reset=true, clears existing playlists/videos first.
 * @returns {{ inserted: boolean, count: number }}
 */
export async function seedPlaylistsFromCatalog(options = {}) {
  const { reset = false } = options

  if (reset) {
    await PlaylistVideo.deleteMany({})
    await Playlist.deleteMany({})
  }

  const existing = await Playlist.countDocuments()
  if (existing > 0 && !reset) {
    return { inserted: false, count: existing }
  }

  for (const section of LEGACY_CATALOG) {
    for (const link of section.links) {
      const hasPlaylist = Array.isArray(link.playlist) && link.playlist.length > 0
      const thumb =
        hasPlaylist && link.playlist[0]?.videoId
          ? `https://img.youtube.com/vi/${link.playlist[0].videoId}/mqdefault.jpg`
          : ""

      if (hasPlaylist) {
        const p = await Playlist.create({
          category: section.category,
          group: section.category,
          domain: link.domain || section.category,
          title: link.title,
          platform: link.platform || "YouTube",
          resourceType: link.resourceType || "YouTube Playlist",
          description: link.desc || "",
          thumbnail: thumb,
          totalDuration: link.duration || "",
          difficulty: link.difficulty || "",
          externalUrl: null,
          tags: link.tags || []
        })
        await PlaylistVideo.insertMany(
          link.playlist.map((v, order) => ({
            playlistId: p._id,
            title: v.title,
            videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
            duration: v.duration || "",
            order
          }))
        )
      } else {
        await Playlist.create({
          category: section.category,
          group: section.category,
          domain: link.domain || section.category,
          title: link.title,
          platform: link.platform || "",
          resourceType: link.resourceType || "",
          description: link.desc || "",
          thumbnail: "",
          totalDuration: "",
          difficulty: link.difficulty || "",
          externalUrl: link.url,
          tags: link.tags || []
        })
      }
    }
  }

  const count = await Playlist.countDocuments()
  return { inserted: true, count }
}

/** Run on server boot: seed only when there are no playlists yet. */
export async function ensurePlaylistsSeeded() {
  const existing = await Playlist.findOne().lean()
  const shouldUpgradeLegacy =
    existing &&
    (!existing.resourceType || !existing.domain || !existing.platform)

  const result = await seedPlaylistsFromCatalog({ reset: Boolean(shouldUpgradeLegacy) })
  if (result.inserted) {
    console.log(`Success: Resources catalog auto-seeded (${result.count} playlists)`)
  }
  return result
}
