import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeSymptomsWithGoogle } from "./googleApi/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8484;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("Missing GOOGLE_API_KEY in .env");
  process.exit(1);
}

app.post("/analyze-symptoms", async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) {
    return res.status(400).json({ error: "Symptoms input is required" });
  }
  try {
    const specialist = await analyzeSymptomsWithGoogle(symptoms, apiKey);
    res.json({ specialist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
