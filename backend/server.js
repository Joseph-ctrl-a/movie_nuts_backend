require('dotenv').config();
console.log('TMDB TOKEN:', process.env.TMDB_ACCESS_TOKEN);

const express = require('express');
const cors = require('cors');
const app = express();

// --- Core Imports ---
const { connectDB } = require('./db/connect');
const loadRoutes = require('./loaders/loadRoutes');
const loadDatabase = require('./loaders/loadDatabase');
const loadMiddleware = require('./loaders/loadMiddleWare');
const loadErrorHandler = require('./loaders/loadErrorHandler');

// --- Fix CORS ---
const allowedOrigin = process.env.ORIGIN || "http://127.0.0.1:5500";

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

console.log("CORS Allowed Origin:", allowedOrigin);

// --- Initialize search + movie routes ---
loadMiddleware(app);
loadRoutes(app);   // this loads /api/movies/search via moviesRouter
loadErrorHandler(app);

// --- Start Application ---
const startApp = async () => {
  try {
    await loadDatabase(connectDB, app);
  } catch (error) {
    console.error('Application startup failed:', error);
    process.exit(1);
  }
};

startApp();




