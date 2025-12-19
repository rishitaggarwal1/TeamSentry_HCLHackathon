import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BookAppointment = () => {
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingProcessing, setBookingProcessing] = useState(false);

  // 1) Fetch doctors that have at least 1 available slot for selected date
  const fetchAvailableDoctors = async (date) => {
    try {
      setLoadingDoctors(true);
      setError(null);
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setSlots([]);

      const res = await fetch(
        `${API_BASE}/api/appointments/doctors/available?date=${date}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch doctors");
      setDoctors(data);
    } catch (e) {
      setDoctors([]);
      setError(e.message || "Failed to fetch doctors.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  // 2) Fetch slots for selected doctor + date
  const fetchSlots = async (doctorId, date) => {
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);

      const res = await fetch(
        `${API_BASE}/api/appointments/slots/available?doctorId=${doctorId}&date=${date}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch slots");
      setSlots(data);
    } catch (e) {
      setSlots([]);
      alert(e.message || "Failed to fetch slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchAvailableDoctors(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchAvailableDoctors(date);
  };

  const handleDoctorClick = (doc) => {
    setSelectedDoctor(doc);
    setSelectedSlot(null);
    fetchSlots(doc.doctorId, selectedDate);
  };

  const handleBookNow = async () => {
    if (!selectedSlot) return;

    try {
      setBookingProcessing(true);

      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("accessToken");

      if (!token) {
        alert("Please login as Patient first.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slotId: selectedSlot.slotId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Booking failed");
        return;
      }

      alert("Appointment booked successfully!");
      // refresh doctors/slots for same date
      await fetchAvailableDoctors(selectedDate);
      navigate("/");
    } catch (e) {
      alert(e.message || "Booking failed");
    } finally {
      setBookingProcessing(false);
    }
  };

  if (loadingDoctors) return <div style={styles.center}>Loading doctors...</div>;
  if (error)
    return <div style={{ ...styles.center, color: "red" }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Book an Appointment</h1>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>Select Date: </label>{" "}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
        />
      </div>

      <div style={styles.layout}>
        <div style={styles.doctorList}>
          <h3>Doctors with available slots</h3>

          {doctors.length === 0 ? (
            <div style={{ color: "#777", marginTop: 12 }}>
              No doctors available for this date.
            </div>
          ) : (
            <div style={styles.grid}>
              {doctors.map((doc) => (
                <div
                  key={doc.doctorId}
                  onClick={() => handleDoctorClick(doc)}
                  style={{
                    ...styles.card,
                    border:
                      selectedDoctor?.doctorId === doc.doctorId
                        ? "2px solid #007bff"
                        : "1px solid #ddd",
                    backgroundColor:
                      selectedDoctor?.doctorId === doc.doctorId
                        ? "#f0f8ff"
                        : "#fff",
                  }}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      doc.name
                    )}&background=0D8ABC&color=fff`}
                    alt={doc.name}
                    style={styles.avatar}
                  />
                  <div>
                    <div style={styles.docName}>{doc.name}</div>
                    <div style={styles.docSpecialty}>{doc.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.detailsPanel}>
          {selectedDoctor ? (
            <>
              <h3>
                Available Slots for {selectedDoctor.name} ({selectedDate})
              </h3>

              {loadingSlots ? (
                <div>Loading slots...</div>
              ) : slots.length === 0 ? (
                <div style={{ color: "#777", marginTop: 12 }}>
                  No available slots.
                </div>
              ) : (
                <div style={styles.slotGrid}>
                  {slots.map((s) => {
                    const label = `${s.start} - ${s.end}`;
                    const active = selectedSlot?.slotId === s.slotId;

                    return (
                      <button
                        key={s.slotId}
                        onClick={() => setSelectedSlot(s)}
                        style={{
                          ...styles.slotBtn,
                          backgroundColor: active ? "#007bff" : "#fff",
                          color: active ? "#fff" : "#333",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={styles.actionArea}>
                <p>
                  Selected:{" "}
                  <strong>
                    {selectedSlot
                      ? `${selectedSlot.start} - ${selectedSlot.end}`
                      : "None"}
                  </strong>
                </p>
                <button
                  onClick={handleBookNow}
                  disabled={!selectedSlot || bookingProcessing}
                  style={{
                    ...styles.bookBtn,
                    opacity: !selectedSlot || bookingProcessing ? 0.5 : 1,
                    cursor:
                      !selectedSlot || bookingProcessing
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {bookingProcessing ? "Booking..." : "Confirm Appointment"}
                </button>
              </div>
            </>
          ) : (
            <div style={styles.placeholder}>
              <p>Select a doctor to view available slots.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" },
  header: { textAlign: "center", marginBottom: "30px", color: "#333" },
  layout: { display: "flex", gap: "30px", flexWrap: "wrap" },
  doctorList: { flex: "1", minWidth: "300px" },
  detailsPanel: { flex: "1", minWidth: "300px", borderLeft: "1px solid #eee", paddingLeft: "30px" },
  grid: { display: "flex", flexDirection: "column", gap: "15px" },
  card: { display: "flex", alignItems: "center", padding: "15px", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  avatar: { width: "50px", height: "50px", borderRadius: "50%", marginRight: "15px" },
  docName: { fontWeight: "bold", fontSize: "1.1rem" },
  docSpecialty: { color: "#666", fontSize: "0.9rem" },
  slotGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px", marginTop: "20px", marginBottom: "20px" },
  slotBtn: { padding: "10px", border: "1px solid #007bff", borderRadius: "5px", cursor: "pointer", fontWeight: "500" },
  actionArea: { marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #eee" },
  bookBtn: { width: "100%", padding: "15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "bold", marginTop: "10px" },
  placeholder: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", textAlign: "center" },
  center: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "1.2rem" },
};

export default BookAppointment;
