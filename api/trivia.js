const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
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

    // Remove code block wrapping (e.g. ```json ... ```)
    const cleaned = raw.replace(/^[`\s]*json[\s`]*|[`]*$/gi, "");

    try {
      const trivia = JSON.parse(cleaned);
      res.status(200).json(trivia);
    } catch (parseErr) {
      res.status(500).json({
        error: "Failed to parse GPT response",
        raw: raw,
        details: parseErr.message,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Failed to generate trivia question",
      details: err.message,
    });
  }
};
