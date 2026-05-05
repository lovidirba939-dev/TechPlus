import axios from "axios";
import { Hackathon } from "../models/hackathonModel.js";

const IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80";
const DEVPOST_API = "https://devpost.com/api/hackathons";

function normalizeTitleKey(title) {
  return (title || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function dateKeyFromDate(d) {
  if (!d || Number.isNaN(new Date(d).getTime())) return null;
  return new Date(d).toISOString().slice(0, 10);
}

function parseDatePart(part, fallbackYear = new Date().getFullYear()) {
  if (!part) return null;

  const hasYear = /\b\d{4}\b/.test(part);
  const normalized = hasYear ? part : `${part}, ${fallbackYear}`;
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return null;
}

function parseSubmissionPeriod(submissionPeriodDates) {
  const raw = String(submissionPeriodDates || "").trim();
  if (!raw.includes("-")) return { startDate: null, endDate: null };

  const parts = raw.split("-").map((p) => p.trim());
  if (parts.length < 2) return { startDate: null, endDate: null };

  const endDate = parseDatePart(parts[1]);
  const endYear = endDate ? endDate.getFullYear() : new Date().getFullYear();
  const startDate = parseDatePart(parts[0], endYear);

  return { startDate, endDate };
}

function inferMode(locationText) {
  const location = String(locationText || "").toLowerCase();
  if (!location || location.includes("online")) return "Online";
  if (location.includes("hybrid")) return "Hybrid";
  return "Offline";
}

function inferTags(item) {
  const tags = new Set();

  for (const theme of item.themes || []) {
    if (theme?.name) tags.add(theme.name);
  }

  const titleDesc = `${item.title || ""} ${item.organization_name || ""}`.toLowerCase();
  if (titleDesc.includes("ai") || titleDesc.includes("machine learning")) tags.add("AI");
  if (titleDesc.includes("cloud")) tags.add("Cloud");
  if (titleDesc.includes("blockchain") || titleDesc.includes("web3")) tags.add("Blockchain");
  if (titleDesc.includes("security") || titleDesc.includes("cyber")) tags.add("Cybersecurity");
  if (titleDesc.includes("web")) tags.add("Web");

  return [...tags].slice(0, 6);
}

function normalizeDevpostItem(item) {
  const { startDate, endDate } = parseSubmissionPeriod(item.submission_period_dates);
  if (!item?.title || !item?.url || !startDate || !endDate) return null;

  const location = item.displayed_location?.location || "Online";
  const mode = inferMode(location);
  const registrationLink = item.url;
  const image = item.thumbnail_url
    ? `https:${item.thumbnail_url}`
    : IMAGE_FALLBACK;

  return {
    externalId: `devpost-${item.id}`,
    title: item.title,
    organizer: item.organization_name || "Devpost Organizer",
    description:
      item.analytics_identifier ||
      `${item.title} hosted on Devpost. Open for submissions from builders worldwide.`,
    platform: "Devpost",
    mode,
    location,
    startDate,
    endDate,
    prize: item.prize_amount ? String(item.prize_amount).replace(/<[^>]+>/g, "") : "",
    tags: inferTags(item),
    registrationLink,
    image
  };
}

export function computeKeys(title, startDate) {
  return {
    titleKey: normalizeTitleKey(title),
    dateKey: dateKeyFromDate(startDate)
  };
}

async function removeDuplicateHackathonsByKey() {
  const seen = await Hackathon.aggregate([
    {
      $match: {
        titleKey: { $exists: true, $ne: null },
        dateKey: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: { t: "$titleKey", d: "$dateKey" },
        ids: { $push: "$_id" },
        n: { $sum: 1 }
      }
    },
    { $match: { n: { $gt: 1 } } }
  ]);

  for (const row of seen) {
    const [, ...rest] = row.ids.map((id) => id.toString());
    if (rest.length) await Hackathon.deleteMany({ _id: { $in: rest } });
  }
}

async function fetchDevpostHackathons(maxPages = 4) {
  const results = [];

  for (let page = 1; page <= maxPages; page += 1) {
    try {
      const response = await axios.get(DEVPOST_API, {
        params: { page },
        timeout: 10000
      });
      const items = response?.data?.hackathons || [];
      if (!items.length) break;
      for (const item of items) {
        const normalized = normalizeDevpostItem(item);
        if (normalized) results.push(normalized);
      }
    } catch {
      /* continue with whatever pages succeeded */
    }
  }

  return results;
}

export const syncHackathonsFromAPI = async () => {
  try {
    const live = await fetchDevpostHackathons(5);
    if (!live.length) {
      return {
        error: "No live hackathons received from Devpost API",
        createdCount: 0,
        skipped: 0,
        totalNormalized: 0
      };
    }

    let createdCount = 0;
    let skipped = 0;

    for (const raw of live) {
      const { titleKey, dateKey } = computeKeys(raw.title, raw.startDate);
      if (!titleKey || !dateKey) {
        skipped += 1;
        continue;
      }

      try {
        const res = await Hackathon.updateOne(
          { titleKey, dateKey },
          {
            $set: {
              titleKey,
              dateKey,
              externalId: raw.externalId,
              title: raw.title,
              organizer: raw.organizer,
              description: raw.description,
              platform: raw.platform,
              mode: raw.mode,
              location: raw.location,
              startDate: raw.startDate,
              endDate: raw.endDate,
              prize: raw.prize,
              tags: raw.tags,
              registrationLink: raw.registrationLink,
              image: raw.image || IMAGE_FALLBACK
            }
          },
          { upsert: true }
        );

        if (res.upsertedCount === 1 || res.modifiedCount === 1) createdCount += 1;
        else skipped += 1;
      } catch {
        skipped += 1;
      }
    }

    await Hackathon.deleteMany({ endDate: { $lt: new Date() } });
    await Hackathon.deleteMany({ platform: { $ne: 'Devpost' } });
    await removeDuplicateHackathonsByKey();

    return {
      createdCount,
      skipped,
      totalNormalized: live.length
    };
  } catch (error) {
    return {
      error: error.message,
      createdCount: 0,
      skipped: 0,
      totalNormalized: 0
    };
  }
};

function dedupeResponseDocs(docs) {
  const map = new Map();
  for (const h of docs) {
    const { titleKey, dateKey } = computeKeys(h.title, h.startDate);
    const key = titleKey && dateKey ? `${titleKey}|${dateKey}` : String(h._id);
    if (!map.has(key)) map.set(key, h);
  }
  return [...map.values()];
}

export const getAllHackathons = async (filters = {}) => {
  try {
    const query = {};

    if (filters.mode && filters.mode !== "All") query.mode = filters.mode;

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { organizer: { $regex: filters.search, $options: "i" } },
        { tags: { $in: [new RegExp(filters.search, "i")] } }
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    query.endDate = { $gte: new Date() };

    let hackathons = await Hackathon.find(query)
      .sort({ startDate: 1 })
      .limit(300)
      .lean();

    hackathons = dedupeResponseDocs(hackathons).map((h) => ({
      ...h,
      image: h.image && String(h.image).trim() ? h.image : IMAGE_FALLBACK
    }));

    return hackathons.slice(0, 80);
  } catch {
    return [];
  }
};

export const getHackathonById = async (id) => {
  try {
    const hackathon = await Hackathon.findById(id).lean();
    if (hackathon && !(hackathon.image && String(hackathon.image).trim())) {
      hackathon.image = IMAGE_FALLBACK;
    }
    return hackathon;
  } catch {
    return null;
  }
};

export const bookmarkHackathon = async (userId, hackathonId) => {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new Error("Hackathon not found");

  if (
    hackathon.bookmarkedBy.some((bid) => bid.toString() === userId.toString())
  ) {
    return { message: "Already bookmarked" };
  }

  await Hackathon.findByIdAndUpdate(
    hackathonId,
    { $push: { bookmarkedBy: userId } },
    { returnDocument: "after" }
  );
  return { success: true };
};

export const removeHackathonBookmark = async (userId, hackathonId) => {
  await Hackathon.findByIdAndUpdate(
    hackathonId,
    { $pull: { bookmarkedBy: userId } },
    { returnDocument: "after" }
  );
  return { success: true };
};

export const getUserBookmarkedHackathons = async (userId) => {
  try {
    const hackathons = await Hackathon.find({ bookmarkedBy: userId }).sort({
      startDate: 1
    });
    return hackathons.map((h) => ({
      ...h.toObject(),
      image: h.image && h.image.length ? h.image : IMAGE_FALLBACK
    }));
  } catch {
    return [];
  }
};

