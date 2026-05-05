import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema({
  externalId: {
    type: String,
    index: true,
    sparse: true
  },
  titleKey: {
    type: String,
    index: true
  },
  dateKey: {
    type: String,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  platform: {
    type: String,
    enum: ['MLH', 'HackClub', 'Devpost', 'Manual', 'Other', 'GoogleCalendar', 'Unstop'],
    default: 'Other'
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    default: 'Online'
  },
  location: String,
  organizer: String,
  startDate: Date,
  endDate: Date,
  prize: String,
  tags: [String],
  registrationLink: String,
  image: String,
  participants: {
    type: Number,
    default: 0
  },
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

hackathonSchema.index({ title: 'text', description: 'text' });
hackathonSchema.index({ startDate: 1, endDate: 1 });
hackathonSchema.index({ mode: 1 });
hackathonSchema.index({ tags: 1 });
hackathonSchema.index({ titleKey: 1, dateKey: 1 }, { unique: true, sparse: true });

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);

