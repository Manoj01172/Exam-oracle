// Central API service — all backend communication goes through here
const BASE_URL = "https://exam-oracle-backend.onrender.com/api";

// ── Generic request helper ────────────────────────────────────────────────────
async function request(method, endpoint, body = null, isFormData = false) {
  const options = {
    method,
    headers: isFormData ? {} : { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password, role) =>
    request("POST", "/auth/register", { name, email, password, role }),

  login: (email, password) =>
    request("POST", "/auth/login", { email, password }),

  getAllUsers: () =>
    request("GET", "/auth/users"),

  getUserStats: (userId) =>
    request("GET", `/auth/users/${userId}/stats`),
};

// ── PDF ───────────────────────────────────────────────────────────────────────
export const pdfAPI = {
  upload: (files, userId) => {
    const formData = new FormData();
    formData.append("user_id", userId);
    Array.from(files).forEach((file) => formData.append("files", file));
    return request("POST", "/pdf/upload", formData, true);
  },

  listByUser: (userId) =>
    request("GET", `/pdf/list/${userId}`),

  listAll: () =>
    request("GET", "/pdf/all"),

  delete: (pdfId) =>
    request("DELETE", `/pdf/delete/${pdfId}`),
};

// ── Analysis ──────────────────────────────────────────────────────────────────
export const analysisAPI = {
  runAnalysis: (pdfId) =>
    request("POST", `/analysis/run/${pdfId}`),

  getTopics: (pdfId) =>
    request("GET", `/analysis/topics/${pdfId}`),

  getAllTopics: () =>
    request("GET", "/analysis/topics/all"),

  comparePdfs: (pdfIds) =>
    request("POST", "/analysis/compare", { pdf_ids: pdfIds }),

  generateQuiz: (pdfId) =>
    request("GET", `/analysis/quiz/generate/${pdfId}`),

  saveQuizResult: (userId, score, total, subject, timeTaken) =>
    request("POST", "/analysis/quiz/save", {
      user_id:    userId,
      score,
      total,
      subject,
      time_taken: timeTaken,
    }),
};

// ── Health check ──────────────────────────────────────────────────────────────
export const healthCheck = () =>
  request("GET", "/health");
