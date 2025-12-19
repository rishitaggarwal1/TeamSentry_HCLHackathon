import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorAvailability.css"; // Import the CSS file here

const DoctorAvailability = () => {
  const navigate = useNavigate();

  // --- State ---
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([{ start: "", end: "" }]);
  const [loading, setLoading] = useState(false);

  // --- Handlers ---
  const handleSlotChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

  const addSlotRow = () => {
    setTimeSlots([...timeSlots, { start: "", end: "" }]);
  };

  const removeSlotRow = (index) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
  };

  const handleSave = async () => {
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

    const user = JSON.parse(localStorage.getItem("user"));
    const doctorId = user?.id || 1;

    const payload = {
      doctorId: doctorId,
      date: selectedDate,
      slots: validSlots,
    };

    console.log("Sending to Backend:", payload);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Availability saved for ${selectedDate}!`);
      navigate("/dashboard");
    } catch (error) {
      alert("Failed to save availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="availability-container">
      <div className="availability-card">
        <h2 className="page-title">Set Your Availability</h2>

        {/* --- Date Selection --- */}
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

        {/* --- Time Slots Section --- */}
        <div className="slots-section">
          <label className="form-label">Available Time Slots</label>
          <p className="helper-text">
            Add the start and end time for your shifts on this day.
          </p>

          {timeSlots.map((slot, index) => (
            <div key={index} className="slot-row">
              <div className="time-input-group">
                <span className="input-label">Start Time</span>
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) =>
                    handleSlotChange(index, "start", e.target.value)
                  }
                  className="form-input time-input"
                />
              </div>

              <div className="time-input-group">
                <span className="input-label">End Time</span>
                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) =>
                    handleSlotChange(index, "end", e.target.value)
                  }
                  className="form-input time-input"
                />
              </div>

              {/* Remove Button */}
              {timeSlots.length > 1 && (
                <button
                  onClick={() => removeSlotRow(index)}
                  className="btn-remove"
                  title="Remove Slot"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button onClick={addSlotRow} className="btn-add-row">
            + Add another time slot
          </button>
        </div>

        {/* --- Save Button --- */}
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
