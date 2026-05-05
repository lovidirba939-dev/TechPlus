import axios from "axios";
import mongoose from "mongoose";
import { News } from "../models/newsModel.js";

const NEWS_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80";

let memoryNewsCache = [];
let lastLiveFetchAt = 0;
const NEWS_LIVE_COOLDOWN_MS = 30 * 60 * 1000;

const ALLOWED_TECH_CATEGORIES = new Set([
  "AI",
  "ML",
  "Software Engineering",
  "Programming",
  "Developer Tools",
  "Cloud",
  "Cybersecurity",
  "Web Development",
  "Startups",
  "React",
  "Node.js",
  "Full Stack",
  "Java",
  "C++",
  "Data Science",
  "Data Analytics",
  "Robotics",
  "Open Source"
]);

const TECH_KEYWORDS = [
  "ai",
  "artificial intelligence",
  "machine learning",
  "developer",
  "software",
  "programming",
  "cloud",
  "cybersecurity",
  "react",
  "node",
  "typescript",
  "javascript",
  "open source",
  "startup",
  "kubernetes",
  "docker",
  "api",
  "framework"
];

const EXCLUSION_KEYWORDS = [
  "election",
  "parliament",
  "senate",
  "president",
  "war",
  "celebrity",
  "crime"
];

const CATEGORY_ALIAS = {
  ai: "AI",
  "artificial intelligence": "AI",
  ml: "ML",
  "machine learning": "ML",
  robotics: "Robotics",
  react: "React",
  "node.js": "Node.js",
  nodejs: "Node.js",
  "full stack": "Full Stack",
  fullstack: "Full Stack",
  java: "Java",
  "c++": "C++",
  cpp: "C++",
  "data analytics": "Data Analytics",
  "web development": "Web Development",
  programming: "Programming",
  "data science": "Data Science",
  cloud: "Cloud",
  cybersecurity: "Cybersecurity",
  startups: "Startups",
  "developer tools": "Developer Tools",
  "open source": "Open Source",
  "software engineering": "Software Engineering"
};

const TRUNCATION_MARKER_REGEX = /\s*\[\+\d+\s+chars\]\s*$/i;
const HTML_ENTITY_MAP = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>'
};

function normalizeCategory(category) {
  if (!category) return "Programming";
  const key = String(category).trim().toLowerCase();
  return CATEGORY_ALIAS[key] || category;
}

function decodeHtmlEntities(text = "") {
  return text.replace(
    /&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/g,
    (entity) => HTML_ENTITY_MAP[entity] || entity
  );
}

function stripHtml(text = "") {
  return decodeHtmlEntities(
    text
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<\/p>|<\/div>|<\/li>|<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function cleanArticleText(text = "") {
  return String(text || "")
    .replace(TRUNCATION_MARKER_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildReadableContent(article = {}) {
  const description = cleanArticleText(article.description || "");
  const content = cleanArticleText(article.content || "");

  if (!description) return content;
  if (!content) return description;
  if (content.includes(description)) return content;
  if (description.includes(content)) return description;
  return `${description}\n\n${content}`;
}

function isTruncatedArticleContent(text = "") {
  const cleaned = String(text || "").trim();
  return !cleaned || TRUNCATION_MARKER_REGEX.test(cleaned);
}

function extractArticleTextFromHtml(html = "") {
  const articleMatch =
    html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) ||
    html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);

  if (articleMatch?.[1]) {
    const articleText = stripHtml(articleMatch[1]);
    if (articleText.length >= 500) return articleText;
  }

  const paragraphMatches = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphText = paragraphMatches
    .map((match) => stripHtml(match[1]))
    .filter((text) => text.length >= 80);

  return paragraphText.join("\n\n").trim();
}

async function fetchOriginalArticleContent(url) {
  if (!url) return "";

  try {
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      responseType: "text"
    });

    return extractArticleTextFromHtml(response.data || "");
  } catch {
    return "";
  }
}

async function enrichArticleContent(article) {
  if (!article) return article;

  const mergedContent = buildReadableContent(article);
  const needsOriginalFetch =
    isTruncatedArticleContent(article.content) ||
    mergedContent.length < 500;

  if (!needsOriginalFetch || !article.url) {
    return {
      ...article,
      content: mergedContent
    };
  }

  const originalContent = await fetchOriginalArticleContent(article.url);
  const finalContent =
    originalContent.length > mergedContent.length ? originalContent : mergedContent;

  if (
    article._id &&
    finalContent &&
    finalContent !== article.content &&
    mongoose.Types.ObjectId.isValid(String(article._id))
  ) {
    try {
      await News.findByIdAndUpdate(article._id, { $set: { content: finalContent } });
    } catch {
      /* non-fatal */
    }
  }

  return {
    ...article,
    content: finalContent || mergedContent
  };
}

function isTechArticle(article) {
  const category = normalizeCategory(article.category);
  if (ALLOWED_TECH_CATEGORIES.has(category)) return true;

  const text = `${article.title || ""} ${article.description || ""} ${article.content || ""}`.toLowerCase();
  if (EXCLUSION_KEYWORDS.some((kw) => text.includes(kw))) return false;
  return TECH_KEYWORDS.some((kw) => text.includes(kw));
}

function filterArticlesByCategory(articles, category) {
  const techOnly = articles.filter(isTechArticle);
  if (!category || String(category).toLowerCase() === "all") {
    return techOnly;
  }
  const requested = normalizeCategory(category);
  return techOnly.filter((a) => normalizeCategory(a.category) === requested);
}

function dedupeByUrl(articles) {
  const seen = new Set();
  const out = [];
  for (const a of articles) {
    const u = a.url || `${a.title}-${a.publishedAt}`;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(a);
  }
  return out;
}

function categorizeNews(text) {
  const lower = text.toLowerCase();

  if (lower.includes("open source") || lower.includes("opensource")) return "Open Source";
  if (lower.includes("github") || lower.includes("gitlab") || lower.includes("copilot") || lower.includes("sdk") || lower.includes("developer tool")) return "Developer Tools";
  if (lower.includes("software engineering") || lower.includes("distributed system") || lower.includes("microservice") || lower.includes("architecture")) return "Software Engineering";
  if (lower.includes("c++") || lower.includes(" cpp") || lower.includes("cplusplus")) return "C++";
  if (lower.includes("node.js") || lower.includes("nodejs") || lower.includes(" express") || lower.includes("nestjs")) return "Node.js";
  if (lower.includes("react")) return "React";
  if (lower.includes("full stack") || lower.includes("fullstack") || lower.includes("mern") || lower.includes("mean stack")) return "Full Stack";
  if (lower.includes("robot") || lower.includes("humanoid") || lower.includes("drone")) return "Robotics";
  if (lower.includes("machine learning") || lower.includes(" deep learning") || lower.includes("neural net") || lower.includes(" llm")) return "ML";
  if (lower.includes("artificial intelligence") || lower.includes("openai") || lower.includes("chatgpt") || lower.includes("generative ai") || lower.includes(" ai ")) return "AI";
  if (lower.includes("java ") || lower.includes(" spring") || lower.includes("kotlin")) return "Java";
  if (lower.includes("data analytic") || lower.includes("business intelligence") || lower.includes("bi ") || lower.includes("dashboard")) return "Data Analytics";
  if (lower.includes("javascript") || lower.includes("typescript") || lower.includes("frontend") || lower.includes("html") || lower.includes("css")) return "Web Development";
  if (lower.includes("security") || lower.includes("vulnerability") || lower.includes("cybersecurity") || lower.includes(" zero-day")) return "Cybersecurity";
  if (lower.includes("startup") || lower.includes("founder") || lower.includes("investor") || lower.includes("unicorn")) return "Startups";
  if (lower.includes("python") || lower.includes("golang") || lower.includes("rust") || lower.includes("programming language") || lower.includes("developer")) return "Programming";
  if (lower.includes("cloud") || lower.includes("aws") || lower.includes("kubernetes") || lower.includes("docker") || lower.includes("azure")) return "Cloud";
  if (lower.includes("big data") || lower.includes("data science") || lower.includes("database")) return "Data Science";

  return "Programming";
}

function normalizeArticle(article) {
  return {
    ...article,
    category: normalizeCategory(article.category),
    image: article.image || NEWS_IMAGE_FALLBACK,
    description: cleanArticleText(article.description || ""),
    content: cleanArticleText(article.content || "")
  };
}

export const fetchGTechNews = async (query = "technology", page = 1) => {
  try {
    const response = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: query,
        page,
        max: 25,
        lang: "en",
        token: process.env.GNEWS_API_KEY
      },
      timeout: 8000
    });

    const articles = response.data.articles || [];

    return articles
      .map((article) =>
        normalizeArticle({
          title: article.title,
          description: article.description,
          content: article.content || article.description,
          author: article.source?.name || "Unknown",
          source: {
            name: article.source?.name || "GNews",
            id: article.source?.name?.toLowerCase().replace(/\s+/g, "-")
          },
          image: article.image || NEWS_IMAGE_FALLBACK,
          url: article.url,
          category: categorizeNews(`${article.title} ${article.description || ""}`),
          publishedAt: new Date(article.publishedAt),
          apiSource: "GNews"
        })
      )
      .filter(isTechArticle);
  } catch {
    return [];
  }
};

export const fetchNewsAPI = async (category = "technology", page = 1) => {
  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        category,
        page,
        pageSize: 25,
        language: "en",
        apiKey: process.env.NEWSAPI_KEY
      },
      timeout: 8000
    });

    const articles = response.data.articles || [];

    return articles
      .map((article) =>
        normalizeArticle({
          title: article.title,
          description: article.description,
          content: article.content || article.description,
          author: article.author || "Unknown",
          source: {
            name: article.source?.name || "NewsAPI",
            id: article.source?.id || ""
          },
          image: article.urlToImage || NEWS_IMAGE_FALLBACK,
          url: article.url,
          category: categorizeNews(`${article.title} ${article.description || ""}`),
          publishedAt: new Date(article.publishedAt),
          apiSource: "NewsAPI"
        })
      )
      .filter(isTechArticle);
  } catch {
    return [];
  }
};

export const cacheNewsInDB = async (articles) => {
  if (!articles?.length) return;
  try {
    const operations = articles
      .filter((article) => article?.url)
      .map((article) => ({
        updateOne: {
          filter: { url: article.url },
          update: { $set: normalizeArticle(article) },
          upsert: true
        }
      }));

    if (operations.length > 0) {
      await News.bulkWrite(operations, { ordered: false });
    }
  } catch {
    /* non-fatal */
  }
};

export const getAllNews = async (category = null, limit = 20) => {
  try {
    const query = {};
    // Only show articles from the last 7 days to keep content fresh
    query.publishedAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    if (category && String(category).toLowerCase() !== "all") {
      query.category = normalizeCategory(category);
    }

    const articles = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    const filtered = filterArticlesByCategory(articles.map(normalizeArticle), category).slice(0, limit);

    // If fewer than 5 fresh articles, relax the date filter to 30 days as fallback
    if (filtered.length < 5) {
      const relaxedQuery = { publishedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
      if (category && String(category).toLowerCase() !== "all") {
        relaxedQuery.category = normalizeCategory(category);
      }
      const relaxed = await News.find(relaxedQuery).sort({ publishedAt: -1 }).limit(limit).lean();
      return filterArticlesByCategory(relaxed.map(normalizeArticle), category).slice(0, limit);
    }

    return filtered;
  } catch {
    return [];
  }
};

export const searchNews = async (searchQuery) => {
  try {
    const articles = await News.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(30)
      .lean();

    return articles.map(normalizeArticle).filter(isTechArticle).slice(0, 20);
  } catch {
    return [];
  }
};

export const getNewsById = async (id) => {
  try {
    if (!id) return null;

    let article = null;
    if (String(id).startsWith("url-")) {
      const decodedUrl = decodeURIComponent(String(id).slice(4));
      article = await News.findOne({ url: decodedUrl }).lean();
    } else if (mongoose.Types.ObjectId.isValid(String(id))) {
      article = await News.findById(id).lean();
    }

    if (!article) return null;
    const normalized = normalizeArticle(article);
    if (!isTechArticle(normalized)) return null;
    return enrichArticleContent(normalized);
  } catch {
    return null;
  }
};

async function fetchLiveNewsMerged() {
  const [gNews, apiNews] = await Promise.all([
    fetchGTechNews("technology"),
    fetchNewsAPI("technology")
  ]);

  return dedupeByUrl([...gNews, ...apiNews]).filter((a) => a.title && a.url);
}

export const getNewsWithFallback = async (
  category = null,
  limit = 40,
  forceLive = false
) => {
  const normalizedCat =
    category && String(category).toLowerCase() !== "all"
      ? normalizeCategory(String(category))
      : null;

  const now = Date.now();
  const withinCooldown =
    !forceLive &&
    now - lastLiveFetchAt < NEWS_LIVE_COOLDOWN_MS &&
    memoryNewsCache.length >= 3;

  if (withinCooldown) {
    const filtered = filterArticlesByCategory(memoryNewsCache, normalizedCat);
    if (filtered.length > 0) {
      return {
        articles: filtered.slice(0, limit),
        source: "memory",
        rateLimited: false,
        message: null,
        usedFallback: false
      };
    }
  }

  try {
    const live = await fetchLiveNewsMerged();

    if (live.length > 0) {
      lastLiveFetchAt = now;
      await cacheNewsInDB(live);
      memoryNewsCache = live.slice(0, 160);
      const filtered = filterArticlesByCategory(live, normalizedCat);
      return {
        articles: filtered.slice(0, limit),
        source: "live",
        rateLimited: false,
        message: null,
        usedFallback: false
      };
    }
  } catch {
    /* fall through to cache */
  }

  const dbArticles = await getAllNews(normalizedCat, limit * 3);
  if (dbArticles.length > 0) {
    memoryNewsCache = dbArticles.slice(0, 160);
    return {
      articles: dbArticles.slice(0, limit),
      source: "mongodb",
      rateLimited: true,
      message: null,
      usedFallback: true
    };
  }

  if (memoryNewsCache.length > 0) {
    const filtered = filterArticlesByCategory(memoryNewsCache, normalizedCat);
    if (filtered.length > 0) {
      return {
        articles: filtered.slice(0, limit),
        source: "memory",
        rateLimited: true,
        message: null,
        usedFallback: true
      };
    }
  }

  return {
    articles: [],
    source: "empty",
    rateLimited: true,
    message: "News temporarily unavailable due to API limit. Please try later.",
    usedFallback: false
  };
};

export const fetchAndCacheNews = async () => {
  try {
    const live = await fetchLiveNewsMerged();
    if (live.length > 0) {
      lastLiveFetchAt = Date.now();
      await cacheNewsInDB(live);
      memoryNewsCache = live.slice(0, 160);
    }
    return { success: true, total: live.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
