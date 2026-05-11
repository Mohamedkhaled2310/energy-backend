console.log("Loading app.js...");
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://fims-mobile-view.vercel.app',
  'https://energy-jade.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FIMS API is running' });
});

import stationRoutes from './routes/stations.js';
import visitRoutes from './routes/visits.js';
import inspectorRoutes from './routes/inspectors.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';

app.use('/api/stations', stationRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/inspectors', inspectorRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FIMS server running on port ${PORT}`);
});

export default app;
