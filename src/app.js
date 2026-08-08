/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression'); // New: Added for Response Compression

// Import Central Router & Global Error Handler
const routes = require('./routes/index');
const errorHandler = require('./middlewares/errorMiddleware'); // Make sure this file exists with this name
const ApiError = require('./utils/ApiError');

// Initialize Express App
const app = express();

// ==========================================
// Global Middlewares & Performance Layer
// ==========================================
app.use(helmet()); // Security Headers

const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
    : true;

app.use(cors({ origin: corsOrigins, credentials: true }));

// Enable Gzip/Brotli Compression to drastically reduce JSON response size
app.use(compression()); 

// Enable ETags to prevent sending the same data twice if the client already has it
app.set('etag', 'strong');

app.use(express.json({ limit: '10mb' })); // Parse JSON payloads with increased limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded payloads
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // HTTP request logger

// ==========================================
// Health Check Route
// ==========================================
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OIKYO Backend Engine is running smoothly.',
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// Central API Router Mounting
// ==========================================
app.use('/api/v1', routes);

// ==========================================
// Fallback Route (404 Not Found)
// ==========================================
app.all(/(.*)/, (req, res, next) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// ==========================================
// Global Error Handler
// ==========================================
// This will catch all ApiErrors and unhandled errors in the application
app.use(errorHandler);

module.exports = app;