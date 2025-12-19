import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "./DoctorAvailability.css";
import { doctorAvailabilityApi } from "../../api/doctorAvailability.api";

const DoctorAvailability = () => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([{ start: "", end: "" }]);
  const [loading, setLoading] = useState(false);

  // Helper to safely get the token from different possible storage locations
  const getAuthToken = () => {
    const storedUser = localStorage.getItem("user");
    const userObj = storedUser ? JSON.parse(storedUser) : null;

    // 1. Check inside the 'user' object (most common)
    if (userObj?.token) return userObj.token;
    if (userObj?.accessToken) return userObj.accessToken;

    // 2. Check if stored directly as 'token'
    const directToken = localStorage.getItem("token");
    if (directToken) return directToken;

    return null;
  };

  const handleSlotChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

  const addSlotRow = () => setTimeSlots([...timeSlots, { start: "", end: "" }]);

  const removeSlotRow = (index) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots.length ? updatedSlots : [{ start: "", end: "" }]);
  };

  const handleSave = async () => {
    // --- 1. Validation ---
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    const validSlots = timeSlots.filter((slot) => slot.start && slot.end);
    if (validSlots.length === 0) {
      alert("Please add at least one valid time slot.");
      return;
    }

    setLoading(true);

    try {
      // --- 2. Get Token ---
      const token = getAuthToken();

      if (!token) {
        alert("Session expired or invalid. Please log in again.");
        navigate("/login");
        return;
      }

      // --- 3. Fetch Doctor ID from Backend ---
      // We use the token to ask the backend "Who am I?"
      // Update the URL below if your backend port is different (e.g., 5001, 7158)
      const profileRes = await axios.get("http://localhost:5000/api/doctor/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { doctorId } = profileRes.data;

      if (!doctorId) {
        throw new Error("Doctor profile not found for this user.");
      }

      // --- 4. Send Availability Payload ---
      const payload = {
        doctorId: doctorId,
        date: selectedDate,
        slots: validSlots.map((s) => ({ start: s.start, end: s.end })),
      };

      const res = await doctorAvailabilityApi.generate(payload);
      
      alert(`Success! Slots generated for ${selectedDate}`);
      navigate("/dashboard");

    } catch (error) {
      console.error("Save failed:", error);
      
      // Handle specific 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
      } else {
        const msg = error?.response?.data?.message || error?.message || "Failed to save availability.";
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="availability-container">
      <div className="availability-card">
        <h2 className="page-title">Set Your Availability</h2>

        <div className="form-group">
          <label className="form-label">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="slots-section">
          <label className="form-label">Available Time Slots</label>
          <p className="helper-text">Add the start and end time for your shifts on this day.</p>

          {timeSlots.map((slot, index) => (
            <div key={index} className="slot-row">
              <div className="time-input-group">
                <span className="input-label">Start Time</span>
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) => handleSlotChange(index, "start", e.target.value)}
                  className="form-input time-input"
                />
              </div>

              <div className="time-input-group">
                <span className="input-label">End Time</span>
                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) => handleSlotChange(index, "end", e.target.value)}
                  className="form-input time-input"
                />
              </div>

              {timeSlots.length > 1 && (
                <button onClick={() => removeSlotRow(index)} className="btn-remove" title="Remove Slot">
                  ✕
                </button>
              )}
            </div>
          ))}

          <button onClick={addSlotRow} className="btn-add-row">
            + Add another time slot
          </button>
        </div>

        <div className="form-actions">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`btn-save ${loading ? "disabled" : ""}`}
          >
            {loading ? "Saving..." : "Confirm Availability"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;