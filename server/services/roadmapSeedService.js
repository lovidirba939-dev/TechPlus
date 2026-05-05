import { Roadmap } from "../models/roadmapModel.js";
import {
  ROADMAPS,
  ROADMAP_QUESTIONS,
  COURSE_SUGGESTIONS
} from "../data/roadmapData.js";

function toDocuments() {
  return ROADMAPS.map((roadmap) => ({
    roadmapId: roadmap.id,
    title: roadmap.title,
    badge: roadmap.badge,
    description: roadmap.description,
    color: roadmap.color || "var(--accent-purple)",
    pdfPath: roadmap.pdfPath || "",
    steps: roadmap.steps || [],
    questions: ROADMAP_QUESTIONS[roadmap.id] || [],
    courseSuggestions: COURSE_SUGGESTIONS[roadmap.id] || []
  }));
}

async function upsertRoadmaps(pruneOld = false) {
  const documents = toDocuments();
  const ids = documents.map((d) => d.roadmapId);

  for (const doc of documents) {
    await Roadmap.updateOne(
      { roadmapId: doc.roadmapId },
      { $set: doc },
      { upsert: true }
    );
  }

  if (pruneOld) {
    await Roadmap.deleteMany({ roadmapId: { $nin: ids } });
  }

  const count = await Roadmap.countDocuments();
  return { inserted: true, count };
}

export async function ensureRoadmapsSeeded() {
  return upsertRoadmaps(true);
}

export async function seedRoadmapsFromData(options = {}) {
  const { reset = false } = options;

  if (reset) {
    await Roadmap.deleteMany({});
    const documents = toDocuments();
    if (documents.length > 0) {
      await Roadmap.insertMany(documents);
    }
    return { inserted: true, count: documents.length };
  }

  return upsertRoadmaps(true);
}
