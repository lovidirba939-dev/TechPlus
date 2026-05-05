import {
  getNewsWithFallback,
  searchNews,
  fetchAndCacheNews,
  getNewsById
} from "../services/newsService.js";

function parseCategory(category) {
  if (!category || String(category).toLowerCase() === "all") return null;
  return String(category);
}

export const getTechNews = async (req, res) => {
  try {
    const { category = null, refresh } = req.query;
    const forceLive = refresh === "1" || refresh === "true";
    const cat = parseCategory(category);
    const result = await getNewsWithFallback(cat, 40, forceLive);

    res.status(200).json({
      success: true,
      source: result.source,
      total: result.articles.length,
      articles: result.articles,
      rateLimited: result.rateLimited,
      message: result.message,
      usedFallback: result.usedFallback
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      source: "empty",
      total: 0,
      articles: [],
      rateLimited: true,
      message:
        "News temporarily unavailable due to API limit. Please try later.",
      usedFallback: false
    });
  }
};

export const searchNewsArticles = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    const articles = await searchNews(q);

    res.status(200).json({
      success: true,
      total: articles.length,
      articles,
      query: q
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search news",
      error: error.message
    });
  }
};

export const refreshNewsCache = async (req, res) => {
  try {
    const result = await fetchAndCacheNews();

    res.status(200).json({
      success: true,
      message: "News cache refreshed",
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to refresh news cache",
      error: error.message
    });
  }
};

export const getGTechNews = async (req, res) => {
  try {
    const { query = "technology", page = 1, refresh } = req.query;
    const forceLive = refresh === "1" || refresh === "true";
    const result = await getNewsWithFallback(null, 40, forceLive);

    res.status(200).json({
      success: true,
      source: result.source,
      total: result.articles.length,
      articles: result.articles,
      rateLimited: result.rateLimited,
      message: result.message,
      usedFallback: result.usedFallback,
      query
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      source: "empty",
      total: 0,
      articles: [],
      rateLimited: true,
      message:
        "News temporarily unavailable due to API limit. Please try later."
    });
  }
};

export const getAllTechNews = async (req, res) => {
  try {
    const { page = 1, category = null, refresh } = req.query;
    const normalized = parseCategory(category);
    const forceLive = refresh === "1" || refresh === "true";

    const result = await getNewsWithFallback(normalized, 40, forceLive);

    res.status(200).json({
      success: true,
      combined: {
        total: result.articles.length,
        articles: result.articles.slice(0, 60)
      },
      source: result.source,
      rateLimited: result.rateLimited,
      message: result.message,
      usedFallback: result.usedFallback
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      combined: { total: 0, articles: [] },
      source: "empty",
      rateLimited: true,
      message:
        "News temporarily unavailable due to API limit. Please try later.",
      usedFallback: false
    });
  }
};

export const getNewsArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await getNewsById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    res.status(200).json({
      success: true,
      article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch article",
      error: error.message
    });
  }
};
