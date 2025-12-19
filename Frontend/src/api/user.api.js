import { http } from "./http";

export const userApi = {
  me: () => http.get("/api/users/me").then((r) => r.data),
  updateMe: (payload) => http.put("/api/users/me", payload).then((r) => r.data),
  changePassword: (payload) => http.put("/api/users/me/password", payload).then((r) => r.data),
  updateMeMultipart: (formData) =>
    http.put("/api/users/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
};
