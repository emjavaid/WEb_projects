const express = require('express');
const router = express.Router();

// Groq API — FREE at console.groq.com
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile'; // free & fast

const callGroq = async (system, userMessage, maxTokens = 1000) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set in .env');

  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: userMessage });

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || '';
};

// POST /api/ai/summarize
router.post('/summarize', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ message: 'content required' });
    const result = await callGroq(
      null,
      `Summarize these study notes in 5 concise bullet points. Be clear and student-friendly.\n\nNotes Title: ${title}\n\nContent:\n${content}`
    );
    res.json({ summary: result });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/ai/quiz
router.post('/quiz', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'content required' });
    const result = await callGroq(
      'You are a quiz generator. Return ONLY valid JSON, no extra text, no markdown fences.',
      `Generate 5 multiple choice questions from these study notes.
Return ONLY this JSON format:
{"questions":[{"q":"question text","options":["A) opt1","B) opt2","C) opt3","D) opt4"],"answer":"A) opt1"}]}

Notes: ${content}`,
      1200
    );
    const clean = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { title, content, question } = req.body;
    if (!content || !question) return res.status(400).json({ message: 'content and question required' });
    const result = await callGroq(
      'You are a helpful study assistant. Answer questions about the provided notes only. Give clear, concise answers.',
      `Notes Title: ${title}\nNotes Content: ${content}\n\nStudent Question: ${question}`
    );
    res.json({ answer: result });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/ai/suggest
router.post('/suggest', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'content required' });
    const result = await callGroq(
      'You are an academic notes analyzer. Return ONLY valid JSON, no extra text, no markdown fences.',
      `Analyze these study notes. Return ONLY this JSON:
{"subject":"one of: Computer Science|Mathematics|Physics|English|Economics|Other","tags":["tag1","tag2","tag3","tag4","tag5"],"description":"one concise sentence"}

Notes:\n${content.slice(0, 3000)}`
    );
    const clean = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
