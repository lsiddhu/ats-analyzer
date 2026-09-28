import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;


if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export const analyzeWithGemini = async (
  resumeText,
  jobDescription
) => {
  const prompt = `
You are an ATS resume analyzer.

Analyze the following resume against the provided job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON in this exact format:

{
  "summary": "Short summary of the resume's suitability for this job",
  "strengths": [
    "strength 1",
    "strength 2",
    "strength 3"
  ],
  "weaknesses": [
    "weakness 1",
    "weakness 2",
    "weakness 3"
  ],
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ],
  "missingSkills": [
    "skill 1",
    "skill 2"
  ]
}

Do not include markdown.
Do not include code fences.
Return only the JSON object.
`;

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
    });

    const responseText = interaction.output_text;

    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};