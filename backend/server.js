import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import db from './config/db.js';
import citizenRoutes from './routes/citizen.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import userRoutes from './routes/user.js';
app.use('/api/user', userRoutes);

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('🌍 Waste Management Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/citizen', citizenRoutes);

import adminRoutes from './routes/admin.js';
app.use('/api/admin', adminRoutes);

import quizRoutes from './routes/quiz.js';
app.use('/api/quiz', quizRoutes);

import profileRoutes from './routes/profile.js';
app.use('/api/profile', profileRoutes);