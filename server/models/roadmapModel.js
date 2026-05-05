import mongoose from "mongoose";

const roadmapStepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    detail: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    links: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true }
      }
    ]
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    roadmapId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    color: { type: String, default: "var(--accent-purple)" },
    pdfPath: { type: String, default: "" },
    steps: [roadmapStepSchema],
    questions: [{ type: String }],
    courseSuggestions: [{ type: String }]
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);
