import { http } from "./http";

export const authApi = {
  register: (payload) => http.post("/api/auth/register", payload).then(r => r.data),
  login: (payload) => http.post("/api/auth/login", payload).then(r => r.data),
  refresh: (payload) => http.post("/api/auth/refresh", payload).then(r => r.data),
  logout: (payload) => http.post("/api/auth/logout", payload).then(r => r.data),
  sessions: () => http.get("/api/auth/sessions").then(r => r.data),
  revokeSession: (sessionId) => http.delete(`/api/auth/sessions/${sessionId}`).then(r => r.data),
};
