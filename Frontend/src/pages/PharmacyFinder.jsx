// src/pages/PharmacyFinder.jsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- Custom Icon for Pharmacies (Green) ---
const pharmacyIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/169/169837.png", // Free medical icon
  iconSize: [35, 35],
  popupAnchor: [0, -15],
});

// --- Custom Icon for User Location (Blue) ---
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3183/3183053.png", // User pin icon
  iconSize: [40, 40],
  popupAnchor: [0, -20],
});

const PharmacyFinder = () => {
  const [position, setPosition] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Get User Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        fetchPharmacies(latitude, longitude); // Fetch data once we have location
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  }, []);

  // 2. Fetch Data from Overpass API (Free OSM Data)
  const fetchPharmacies = async (lat, lng) => {
    const radius = 2000; // 2km radius
    // Overpass QL Query: "Find nodes or ways with amenity=pharmacy around lat,lon"
    const query = `
      [out:json];
      (
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        way["amenity"="pharmacy"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    try {
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      setPharmacies(data.elements);
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "1rem",
          background: "#f0fdf4",
          borderBottom: "1px solid #dcfce7",
        }}
      >
        <h2 style={{ margin: 0, color: "#166534" }}>
          📍 Nearby Pharmacies (Free)
        </h2>
        <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem", color: "#555" }}>
          Using OpenStreetMap Data
        </p>
      </div>

      <div style={{ flex: 1, position: "relative", display: "flex" }}>
        {loading && <div style={overlayStyle}>Loading map...</div>}
        {error && <div style={overlayStyle}>⚠️ {error}</div>}

        {!loading && position && (
          <>
            {/* --- The Map --- */}
            <div style={{ flex: 2 }}>
              <MapContainer
                center={position}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                {/* Free Tile Layer (The visual map skin) */}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Helper component to fly map to user's location */}
                <RecenterMap position={position} />

                {/* User Marker */}
                <Marker position={position} icon={userIcon}>
                  <Popup>You are here</Popup>
                </Marker>

                {/* Pharmacy Markers */}
                {pharmacies.map((place) => {
                  // Handle slightly different data structure for 'ways' vs 'nodes'
                  const lat = place.lat || place.center.lat;
                  const lon = place.lon || place.center.lon;

                  return (
                    <Marker
                      key={place.id}
                      position={[lat, lon]}
                      icon={pharmacyIcon}
                    >
                      <Popup>
                        <strong>{place.tags.name || "Unnamed Pharmacy"}</strong>
                        <br />
                        <span style={{ fontSize: "0.85rem", color: "#666" }}>
                          {place.tags["addr:street"]
                            ? `${place.tags["addr:street"]}`
                            : "Address not available"}
                        </span>
                        <br />
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#166534",
                            fontWeight: "bold",
                            textDecoration: "none",
                            marginTop: "5px",
                            display: "block",
                          }}
                        >
                          📍 Get Directions
                        </a>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* --- The List Sidebar --- */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                background: "#f8fafc",
                padding: "1rem",
              }}
            >
              <h3>Results ({pharmacies.length})</h3>
              {pharmacies.length === 0 && <p>Searching area...</p>}

              {pharmacies.map((place) => (
                <div key={place.id} style={cardStyle}>
                  <div style={{ fontWeight: "bold" }}>
                    {place.tags.name || "Unknown Pharmacy"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      margin: "5px 0",
                    }}
                  >
                    {place.tags["opening_hours"]
                      ? `🕒 ${place.tags["opening_hours"]}`
                      : "🕒 Hours not listed"}
                  </div>
                  <button
                    style={btnStyle}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${
                          place.lat || place.center.lat
                        },${place.lon || place.center.lon}`,
                        "_blank"
                      )
                    }
                  >
                    Go
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Helper Component to Recenter Map ---
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
};

// --- CSS Styles (Inline for simplicity) ---
const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "white",
  zIndex: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem",
};

const cardStyle = {
  background: "white",
  padding: "1rem",
  marginBottom: "0.8rem",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const btnStyle = {
  background: "#166534",
  color: "white",
  border: "none",
  padding: "4px 10px",
  borderRadius: "4px",
  cursor: "pointer",
};

export default PharmacyFinder;
