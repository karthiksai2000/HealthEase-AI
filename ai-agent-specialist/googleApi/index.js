import fetch from "node-fetch";
import { extractSpecialist } from "./responseParser.js";

export async function analyzeSymptomsWithGoogle(symptoms, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Given these symptoms: "${symptoms}", suggest ONLY the medical specialist the patient should consult (e.g., "Cardiologist", "Dermatologist", "Orthopedist"). Return just the specialist name, nothing else.`,
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return extractSpecialist(data);
}
