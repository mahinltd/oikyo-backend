/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Handle Uncaught Exceptions globally (Synchronous errors)
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

// Server Listener
let server;

const startServer = async () => {
    try {
        // Database Connection
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is missing in environment variables.');
        }
        
        await mongoose.connect(MONGO_URI);
        console.log('Database Connection Established Successfully.');

        // Start Express App
        server = app.listen(PORT, () => {
            console.log(`OIKYO Backend Engine is listening on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start the server:', error.message);
        process.exit(1);
    }
};

startServer();

// Graceful Shutdown Management
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection detected. Shutting down gracefully...', err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});