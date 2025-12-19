import { http } from "./http";

export const adminApi = {
  pendingDoctors: () => http.get("/api/admin/doctors/pending").then(r => r.data),
  approveDoctor: (userId) => http.post("/api/admin/doctors/approve", { userId }).then(r => r.data),
};
