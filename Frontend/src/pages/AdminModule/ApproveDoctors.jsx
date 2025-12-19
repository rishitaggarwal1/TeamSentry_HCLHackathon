import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/admin.api";
import { notify } from "../../utils/toast";

export default function ApproveDoctors() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminApi.pendingDoctors();
      setItems(data);
    } catch (e) {
      notify("Failed to load pending doctors", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (userId) => {
    try {
      await adminApi.approveDoctor(userId);
      notify("Approved + email sent", "success");
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || "Approve failed";
      notify(msg, "error");
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Pending Doctor Approvals</h2>

      {items.length === 0 ? (
        <p>No pending doctors.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {items.map(d => (
            <div key={d.userId} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 10 }}>
              <div><b>{d.name}</b> ({d.email})</div>
              <div>Phone: {d.phone || "-"}</div>
              <div>License: {d.licenseFileName || "Not uploaded"}</div>
              <button
                onClick={() => approve(d.userId)}
                disabled={!d.licenseFileName}
                style={{ marginTop: 10 }}
              >
                Approve & Email Credentials
              </button>
              {!d.licenseFileName && <div style={{ color: "crimson", marginTop: 6 }}>Waiting for license upload</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
