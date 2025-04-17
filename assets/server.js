const express = require("express");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/trivia", async (req, res) => {
  const difficulty = req.query.difficulty || 1;
  const topic = req.query.topic || "General Knowledge";
  const randomSeed = Math.floor(Math.random() * 10000);

  const prompt = `
Generate a trivia question in strict JSON format. Include a question, 4 answer choices, the correct answer, and the difficulty level ${difficulty}. 

Only return valid JSON and nothing else.

Example:
{
  "question": "Which planet is known as the Red Planet?",
  "choices": ["Venus", "Earth", "Mars", "Jupiter"],
  "correct": "Mars",
  "difficulty": ${difficulty}
}

Topic: ${topic}
Seed: ${randomSeed}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const raw = completion.choices[0].message.content.trim();
    const cleaned = raw.replace(/^[`\s]*json[\s`]*|[`]*$/gi, '');
    const trivia = JSON.parse(cleaned);
    res.status(200).json(trivia);
  } catch (err) {
    res.status(500).json({
      error: "Failed to generate or parse trivia",
      details: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Trivia API running on port ${port}`);
});
