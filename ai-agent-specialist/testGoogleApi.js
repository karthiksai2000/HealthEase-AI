import "dotenv/config";
import { createInterface } from "node:readline";
import fetch from "node-fetch";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Please describe your symptoms: ", async (symptoms) => {
  try {
    const response = await fetch("http://localhost:8484/analyze-symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Suggested specialist: ${data.specialist}`);
  } catch (err) {
    console.error("Error:", err.message);
  }
  rl.close();
});
