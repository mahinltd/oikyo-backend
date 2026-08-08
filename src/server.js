/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

require('dotenv').config();
const mongoose = require('mongoose');
const { Resolver } = require('dns').promises;
const { URL } = require('url');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const isSrvUri = (uri) => typeof uri === 'string' && uri.startsWith('mongodb+srv://');

const resolveSrvRecords = async (srvHost, nameservers = []) => {
    const resolver = new Resolver();
    if (nameservers.length) {
        resolver.setServers(nameservers);
    }

    return resolver.resolveSrv(srvHost);
};

const buildDirectMongoUri = (srvUri, srvRecords) => {
    const parsed = new URL(srvUri);
    const username = parsed.username ? encodeURIComponent(parsed.username) : '';
    const password = parsed.password ? `:${encodeURIComponent(parsed.password)}` : '';
    const authSegment = username ? `${username}${password}@` : '';
    const database = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.slice(1) : '';

    const hostSegment = srvRecords
        .map((record) => `${record.name}:${record.port}`)
        .join(',');

    const searchParams = new URLSearchParams(parsed.searchParams);
    searchParams.set('tls', 'true');
    searchParams.set('directConnection', 'false');
    if (!searchParams.has('authSource')) {
        searchParams.set('authSource', 'admin');
    }

    const queryString = searchParams.toString();
    return `mongodb://${authSegment}${hostSegment}/${database}${queryString ? `?${queryString}` : ''}`;
};

const connectWithFallback = async (mongoUri) => {
    try {
        await mongoose.connect(mongoUri);
        return;
    } catch (error) {
        if (!isSrvUri(mongoUri) || !error.message.includes('querySrv')) {
            throw error;
        }

        const clusterHost = new URL(mongoUri).hostname;
        const srvName = `_mongodb._tcp.${clusterHost}`;

        let srvRecords;
        try {
            srvRecords = await resolveSrvRecords(srvName);
        } catch (firstError) {
            srvRecords = await resolveSrvRecords(srvName, ['8.8.8.8', '1.1.1.1']);
        }

        const fallbackUri = buildDirectMongoUri(mongoUri, srvRecords);
        console.log('Falling back to standard MongoDB URI using SRV hosts:', fallbackUri);
        await mongoose.connect(fallbackUri);
    }
};

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
        
        await connectWithFallback(MONGO_URI);
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