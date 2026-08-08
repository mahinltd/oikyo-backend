# OIKYO Backend

This repository contains the backend API for the OIKYO e-commerce platform.
It is built with Node.js, Express, MongoDB/Mongoose, Firebase Admin, Cloudinary, and Upstash Redis.

## Features

- Express-based REST API
- MongoDB connection with SRV fallback support for Atlas
- JWT authentication
- File uploads and media management
- Notification preferences and FCM token management
- Admin and public website route structure

## Requirements

- Node.js 18+ (or compatible)
- npm
- MongoDB Atlas or MongoDB connection string in `.env`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root.

3. Add required environment variables, including at least:

```dotenv
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
FIREBASE_API_KEY=<firebase-api-key>
FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
FIREBASE_PROJECT_ID=<firebase-project-id>
FIREBASE_STORAGE_BUCKET=<firebase-storage-bucket>
FIREBASE_MESSAGING_SENDER_ID=<firebase-messaging-sender-id>
FIREBASE_APP_ID=<firebase-app-id>
FIREBASE_SERVICE_ACCOUNT_KEY=<firebase-service-account-json>
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://oikyo.me
```

> The project uses `dotenv` to load environment variables from `.env`.

## Running

Start the server in production mode:

```bash
npm start
```

Start the server in development mode with automatic restarts:

```bash
npm run dev
```

The backend listens on the port configured in `PORT` (default `5000`).

## Notes

- `src/server.js` includes fallback logic for MongoDB Atlas SRV DNS resolution.
- If your network blocks SRV DNS lookups, the code attempts a direct `mongodb://` connection using resolved hosts.

## Project structure

- `src/app.js` - Express application setup
- `src/server.js` - Server startup and MongoDB connection
- `src/routes/` - Route definitions
- `src/controllers/` - Request handlers
- `src/models/` - Mongoose schemas and models
- `src/services/` - Business logic and integrations
- `src/middlewares/` - Authentication and validation middleware
