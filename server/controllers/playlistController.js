import mongoose from "mongoose"
import { Playlist } from "../models/playlistModel.js"
import { PlaylistVideo } from "../models/playlistVideoModel.js"

export const getPlaylists = async (req, res) => {
  try {
    const withFlags = await Playlist.aggregate([
      { $sort: { domain: 1, title: 1 } },
      {
        $lookup: {
          from: "playlistvideos",
          localField: "_id",
          foreignField: "playlistId",
          as: "_v"
        }
      },
      {
        $project: {
          category: 1,
          group: 1,
          domain: 1,
          title: 1,
          platform: 1,
          resourceType: 1,
          description: 1,
          thumbnail: 1,
          totalDuration: 1,
          difficulty: 1,
          externalUrl: 1,
          tags: 1,
          hasVideos: { $gt: [{ $size: "$_v" }, 0] }
        }
      }
    ])

    res.status(200).json({
      success: true,
      count: withFlags.length,
      playlists: withFlags
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid playlist id" })
    }

    const playlist = await Playlist.findById(id).lean()
    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" })
    }

    const videos = await PlaylistVideo.find({ playlistId: id }).sort({ order: 1 }).lean()

    res.status(200).json({
      success: true,
      _id: playlist._id,
      title: playlist.title,
      platform: playlist.platform,
      resourceType: playlist.resourceType,
      description: playlist.description,
      thumbnail: playlist.thumbnail,
      category: playlist.category,
      group: playlist.group,
      domain: playlist.domain,
      totalDuration: playlist.totalDuration,
      difficulty: playlist.difficulty,
      externalUrl: playlist.externalUrl,
      tags: playlist.tags || [],
      videos: videos.map((v) => ({
        _id: v._id,
        title: v.title,
        videoUrl: v.videoUrl,
        duration: v.duration,
        order: v.order
      }))
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
