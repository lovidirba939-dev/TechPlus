import axios from 'axios';

const cleanBase = (value) =>
  String(value || '')
    .trim()
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');

const isProd = import.meta.env.PROD;
const CANDIDATE_BASES = [
  cleanBase(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL),
  isProd ? cleanBase(import.meta.env.VITE_RENDER_API_URL || 'https://techplus-xzqw.onrender.com') : '',
  isProd ? 'https://techplus-gaya.onrender.com' : '',
  !isProd ? 'http://localhost:5000' : ''
].filter(Boolean);

const API_BASE_URL = CANDIDATE_BASES[0];

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 90000
});

let activeBaseIndex = 0;
const switchToNextBase = () => {
  if (activeBaseIndex >= CANDIDATE_BASES.length - 1) return false;
  activeBaseIndex += 1;
  apiClient.defaults.baseURL = CANDIDATE_BASES[activeBaseIndex];
  return true;
};

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalConfig = error?.config || {};

    if (!error?.response) {
      if (!originalConfig.__retryWithNextBase && switchToNextBase()) {
        originalConfig.__retryWithNextBase = true;
        originalConfig.baseURL = apiClient.defaults.baseURL;
        return apiClient.request(originalConfig);
      }

      return Promise.reject({
        success: false,
        message: 'Server timeout/unreachable. Please retry in a few seconds.'
      });
    }

    if ([404, 405, 502, 503, 504].includes(error.response.status) && !originalConfig.__retryWithNextBase && switchToNextBase()) {
      originalConfig.__retryWithNextBase = true;
      originalConfig.baseURL = apiClient.defaults.baseURL;
      return apiClient.request(originalConfig);
    }

    const status = error.response?.status;
    const reqUrl = error.config?.url || '';
    const skip401Redirect =
      reqUrl.includes('/api/user/profile') ||
      reqUrl.includes('/api/auth/login') ||
      reqUrl.includes('/api/auth/register') ||
      reqUrl.includes('/api/auth/verify-otp') ||
      reqUrl.includes('/api/auth/forgot-password') ||
      reqUrl.includes('/api/auth/reset-password');

    if (status === 401 && !skip401Redirect) {
      const path = window.location.pathname || '';
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authAPI = {
  register: (email, username, password, confirmPassword) =>
    apiClient.post('/api/auth/register', { email, username, password, confirmPassword }),
  verifyOtp: (email, otp) =>
    apiClient.post('/api/auth/verify-otp', { email, otp }),
  resendOtp: (email) =>
    apiClient.post('/api/auth/resend-otp', { email }),
  login: (email, password) =>
    apiClient.post('/api/auth/login', { email, password }),
  logout: () =>
    apiClient.post('/api/auth/logout'),
  forgotPassword: (email, clientOrigin) =>
    apiClient.post('/api/auth/forgot-password', { email, clientOrigin }),
  resetPassword: (token, password, confirmPassword) =>
    apiClient.post('/api/auth/reset-password', { token, password, confirmPassword })
};

export const userAPI = {
  getProfile: () =>
    apiClient.get('/api/user/profile'),
  updateProfile: (data) =>
    apiClient.put('/api/user/update', data),
  deleteAccount: (password) =>
    apiClient.delete('/api/user/account', { data: { password } }),
  updateLastActivity: (data) =>
    apiClient.put('/api/user/last-activity', data),
  addBookmark: (bookmarkData) =>
    apiClient.post('/api/user/bookmarks', bookmarkData),
  getBookmarks: () =>
    apiClient.get('/api/user/bookmarks'),
  deleteBookmark: (bookmarkId) =>
    apiClient.delete(`/api/user/bookmarks/${bookmarkId}`),
  updateRoadmapProgress: (data) =>
    apiClient.put('/api/user/roadmap-progress', data),
  getRoadmapProgress: (roadmapId) =>
    apiClient.get(`/api/user/roadmap-progress/${roadmapId}`),
  uploadProfileImage: (imageData) =>
    apiClient.post('/api/user/upload-profile', { imageData }),
  recordRoadmapDownload: (data) =>
    apiClient.post('/api/user/record-roadmap-download', data),
  getSavedResources: () =>
    apiClient.get('/api/user/saved-resources'),
  saveResource: (playlistId) =>
    apiClient.post('/api/user/saved-resources', { playlistId }),
  removeSavedResource: (playlistId) =>
    apiClient.delete(`/api/user/saved-resources/${playlistId}`)
};

export const newsAPI = {
  getTechNews: (page = 1) =>
    apiClient.get('/api/news/newsapi', { params: { page } }),
  getGTechNews: (query = 'technology', page = 1) =>
    apiClient.get('/api/news/gnews', { params: { query, page } }),
  getAllNews: (page = 1, category = null, refresh = false) =>
    apiClient.get('/api/news/all', {
      params: {
        page,
        ...(category ? { category } : {}),
        ...(refresh ? { refresh: '1' } : {})
      }
    }),
  searchNews: (query) =>
    apiClient.get('/api/news/search', { params: { q: query } }),
  getById: (id) =>
    apiClient.get('/api/news/' + id),
  refreshNews: () =>
    apiClient.post('/api/news/refresh')
};

export const playlistAPI = {
  getAll: () => apiClient.get('/api/playlists'),
  getById: (id) => apiClient.get(`/api/playlists/${id}`),
  reseed: () => apiClient.post('/api/playlists/reseed')
};

export const roadmapAPI = {
  getAll: () => apiClient.get('/api/roadmaps'),
  getById: (id) => apiClient.get(`/api/roadmaps/${id}`)
};

export const hackathonAPI = {
  getAll: (filters = {}) =>
    apiClient.get('/api/hackathons', { params: filters }),
  getById: (id) =>
    apiClient.get(`/api/hackathons/${id}`),
  addBookmark: (hackathonId) =>
    apiClient.post('/api/hackathons/bookmark', { hackathonId }),
  removeBookmark: (hackathonId) =>
    apiClient.delete(`/api/hackathons/bookmark/${hackathonId}`),
  getUserBookmarks: () =>
    apiClient.get('/api/hackathons/user/bookmarks'),
  manualSync: () =>
    apiClient.post('/api/hackathons/sync')
};

export default apiClient;
