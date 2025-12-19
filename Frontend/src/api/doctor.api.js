import { http } from "./http";

export const doctorApi = {
  uploadLicense: (file) => {
    const form = new FormData();
    form.append("license", file);
    return http.post("/api/doctor/license", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
};
