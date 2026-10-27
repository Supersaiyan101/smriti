import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, isAtlas } from './db.js';
import profilesRouter from './routes/profiles.js';
import memoriesRouter from './routes/memories.js';
import converseRouter from './routes/converse.js';
import voiceRouter from './routes/voice.js';
import letterRouter from './routes/letter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploads (photos, audio notes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/profiles', profilesRouter);
app.use('/api/memories', memoriesRouter);
app.use('/api/converse', converseRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/letter', letterRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Smriti (स्मृति)',
    database: isAtlas() ? 'MongoDB Atlas' : 'Local Sanctuary Storage',
    message: 'Sanctuary server is running quietly.',
    timestamp: new Date().toISOString(),
  });
});

// Initialize database and start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Smriti Server] Quietly listening on port ${PORT}`);
    console.log(`[Smriti Server] Storage mode: ${isAtlas() ? 'MongoDB Atlas Cluster' : 'Local Persistent Storage'}`);
  });
});
