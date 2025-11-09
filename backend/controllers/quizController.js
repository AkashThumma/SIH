import { addPoints } from '../models/userModel.js';

// Sample quizzes (expand as needed)
const quizzes = {
  quiz1: [
    { question: "What is waste segregation?", options: ["Mixing all waste", "Separating waste into categories", "Burning waste"], answer: 1 },
    // Add 19 more questions similarly...
    { question: "Why recycle?", options: ["Save money", "Reduce pollution", "Both"], answer: 2 },
  ],
  quiz2: [
    { question: "What is biodegradable waste?", options: ["Plastic", "Food scraps", "Metal"], answer: 1 },
    // Add 19 more...
    { question: "Best way to dispose e-waste?", options: ["Throw away", "Recycle at centers", "Burn"], answer: 1 },
  ],
};

export const getQuiz = (req, res) => {
  const quizId = req.params.id;
  if (!quizzes[quizId]) return res.status(404).json({ success: false, message: 'Quiz not found' });
  res.json({ success: true, quiz: quizzes[quizId] });
};

export const submitQuiz = (req, res) => {
  const { quizId, answers } = req.body;
  const userId = req.user.id;
  if (!quizzes[quizId]) return res.status(404).json({ success: false, message: 'Quiz not found' });
  let score = 0;
  quizzes[quizId].forEach((q, i) => {
    if (answers[i] == q.answer) score++;
  });
  addPoints(userId, score, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error updating points' });
    res.json({ success: true, score, pointsAdded: score });
  });
};