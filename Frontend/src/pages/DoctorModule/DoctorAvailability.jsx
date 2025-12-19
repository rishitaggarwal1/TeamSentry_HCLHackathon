import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DoctorAvailability = () => {
  const navigate = useNavigate();

  // --- State ---
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([
    { start: "", end: "" }, // Start with one empty slot row
  ]);
  const [loading, setLoading] = useState(false);

  // --- Handlers ---

  // 1. Update specific slot values
  const handleSlotChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
  };

  // 2. Add a new row for time
  const addSlotRow = () => {
    setTimeSlots([...timeSlots, { start: "", end: "" }]);
  };

  // 3. Remove a row
  const removeSlotRow = (index) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
  };

  // 4. Submit Data
  const handleSave = async () => {
    // Basic Validation
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    // Filter out incomplete slots
    const validSlots = timeSlots.filter((slot) => slot.start && slot.end);
    if (validSlots.length === 0) {
      alert("Please add at least one valid time slot.");
      return;
    }

    setLoading(true);

    // Prepare Payload
    // We get the doctor ID from localStorage (assuming they are logged in)
    const user = JSON.parse(localStorage.getItem("user"));
    const doctorId = user?.id || 1; // Fallback ID for testing

    const payload = {
      doctorId: doctorId,
      date: selectedDate,
      slots: validSlots, // Array of { start: "09:00", end: "12:00" }
    };

    console.log("Sending to Backend:", payload);

    try {
      // REPLACE THIS with your actual API call
      // await axios.post('/api/doctor/availability', payload);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(`Availability saved for ${selectedDate}!`);

      // Optional: Reset form or redirect
      // setTimeSlots([{ start: "", end: "" }]);
      // setSelectedDate("");
      navigate("/dashboard");
    } catch (error) {
      alert("Failed to save availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Set Your Availability
      </h2>

      {/* --- Date Selection --- */}
      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split("T")[0]} // Disable past dates
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* --- Time Slots Section --- */}
      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">
          Available Time Slots
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Add the start and end time for your shifts on this day.
        </p>

        {timeSlots.map((slot, index) => (
          <div key={index} className="flex items-center gap-4 mb-3">
            {/* Start Time */}
            <div className="flex-1">
              <span className="text-xs text-gray-500 block mb-1">
                Start Time
              </span>
              <input
                type="time"
                value={slot.start}
                onChange={(e) =>
                  handleSlotChange(index, "start", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* End Time */}
            <div className="flex-1">
              <span className="text-xs text-gray-500 block mb-1">End Time</span>
              <input
                type="time"
                value={slot.end}
                onChange={(e) => handleSlotChange(index, "end", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* Remove Button (Only show if more than 1 row) */}
            {timeSlots.length > 1 && (
              <button
                onClick={() => removeSlotRow(index)}
                className="mt-5 text-red-500 hover:text-red-700 font-bold px-3 py-2"
                title="Remove Slot"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Add Row Button */}
        <button
          onClick={addSlotRow}
          className="mt-2 text-blue-600 font-semibold hover:underline flex items-center"
        >
          + Add another time slot
        </button>
      </div>

      {/* --- Save Button --- */}
      <div className="border-t pt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-bold text-lg transition-all
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-lg"
            }`}
        >
          {loading ? "Saving..." : "Confirm Availability"}
        </button>
      </div>
    </div>
  );
};

export default DoctorAvailability;
