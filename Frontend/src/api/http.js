import axios from "axios";
import { getAccessToken, clearAuth } from "../auth/auth.storage";
import { authService } from "../auth/auth.service";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh on 401 once
http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err?.response?.status === 401 && !original?._retry) {
      original._retry = true;
      try {
        await authService.refresh();
        return http(original);
      } catch {
        clearAuth();
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  }
);
