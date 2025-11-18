// src/components/AmbulanceHelp.jsx
import { useState } from "react";
import { Phone } from "lucide-react";
import "./Ambulance.css";

const GEOAPIFY_API_KEY = "8833789e68a84699b7b7a211095a2d19"; // Replace with your key

export default function AmbulanceHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Fetch autocomplete suggestions
  const fetchSuggestions = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  // 🏥 Fetch hospitals near location
  const fetchHospitals = async (lat, lon) => {
    setLoading(true);
    setHospitals([]);
    setSuggestions([]);
    setQuery("");

    const bbox = `${lat - 0.02},${lon - 0.02},${lat + 0.02},${lon + 0.02}`;
    const queryStr = `
      [out:json];
      node["amenity"="hospital"](${bbox});
      out tags;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: queryStr,
      });
      const data = await res.json();

      const enriched = data.elements
        .map((h) => {
          const rawPhone = h.tags.phone || h.tags["contact:phone"] || null;
          if (!rawPhone || !h.tags.name) return null;
          let phone = rawPhone.split(/[,;/]/)[0].trim();
          if (phone.startsWith("0")) phone = phone.substring(1);
          phone = `+91${phone}`;
          return { name: h.tags.name, phone };
        })
        .filter((h) => h);

      setHospitals(enriched);
    } catch (err) {
      console.error(err);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🚑 Floating Button */}
      <button className="ambulance-fab" onClick={() => setIsOpen(true)}>
        🚑
      </button>

      {/* Overlay + Widget */}
      {isOpen && (
        <div className="ambulance-overlay">
          <div className="ambulance-widget">
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ✖
            </button>
            <h2>🚑 Emergency Ambulance</h2>

            <input
              type="text"
              value={query}
              onChange={(e) => fetchSuggestions(e.target.value)}
              placeholder="Enter your location"
              className="search-bar"
            />

            {suggestions.length > 0 && (
              <ul className="dropdown">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() =>
                      fetchHospitals(s.properties.lat, s.properties.lon)
                    }
                  >
                    {s.properties.formatted}
                  </li>
                ))}
              </ul>
            )}

            {loading && <p className="loading">Fetching hospitals...</p>}

            {hospitals.length > 0 && (
              <ul className="hospital-list">
                {hospitals.map((h, i) => (
                  <li key={i} className="hospital-card">
                    <div>
                      <p className="hospital-name">{h.name}</p>
                      <p className="hospital-phone">📞 {h.phone}</p>
                    </div>
                    <a href={`tel:${h.phone}`} className="call-btn">
                      Call
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {!loading && hospitals.length === 0 && query.length >= 3 && (
              <p className="loading">No hospitals with phone numbers found.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
