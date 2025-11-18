export function extractSpecialist(data) {
  try {
    return data?.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "Unable to determine specialist.";
  } catch {
    return "Unable to determine specialist.";
  }
}
