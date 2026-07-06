import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import { createContext } from './graphql/context.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from both root and server directories
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers - disable CSP in development to allow Apollo Sandbox
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// CORS config
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// General rate limiter for GraphQL endpoint
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 minutes
  message: { message: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/graphql', apiLimiter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// --- Serverless MongoDB Connection ---
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Don't wait 10s if it's going to fail
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Add middleware to ensure DB connects before any route runs
app.use(async (req, res, next) => {
  await connectDB();
  next();
});
// -------------------------------------

// Initialize and start Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  '/api/graphql',
  expressMiddleware(server, {
    context: createContext,
  })
);

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
export default app;
