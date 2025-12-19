import React, { useState } from "react";
import { doctorApi } from "../../api/doctor.api";
import { notify } from "../../utils/toast";

export default function UploadLicense() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return notify("Select a file first", "error");

    try {
      setLoading(true);
      await doctorApi.uploadLicense(file);
      notify("License uploaded successfully", "success");
      setFile(null);
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.response?.data || "Upload failed";
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Upload Medical License</h2>
      <form onSubmit={submit}>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
}
