import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Cache for Mongoose connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache for native MongoDB client (for better-auth)
interface MongoClientCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
  var mongoClient: MongoClientCache | undefined;
}

// Initialize Mongoose cache
const mongooseCache: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = mongooseCache;
}

// Initialize native client cache
const clientCache: MongoClientCache = global.mongoClient || {
  client: null,
  promise: null,
};

if (!global.mongoClient) {
  global.mongoClient = clientCache;
}

/**
 * Connects to MongoDB using Mongoose (ODM)
 * Use this for routes with Mongoose models
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  if (!mongooseCache.promise) {
    const opts = {
      bufferCommands: false,
    };

    mongooseCache.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => mongoose);
  }

  try {
    mongooseCache.conn = await mongooseCache.promise;
  } catch (e) {
    mongooseCache.promise = null;
    throw e;
  }

  return mongooseCache.conn;
}

/**
 * Gets the native MongoDB client connection
 * Use this for better-auth and direct MongoDB operations
 *
 * Strategy: Reuses Mongoose's underlying connection to avoid
 * creating a separate connection pool
 */
export async function getMongoClient(): Promise<MongoClient> {
  // First ensure Mongoose is connected
  await connectDB();

  // Get the native MongoDB client from Mongoose's connection
  // This reuses the same connection pool instead of creating a new one
  const client = mongoose.connection.getClient();

  return client;
}

/**
 * Gets the database instance from Mongoose connection
 * Use this when you need direct database access while using Mongoose
 */
export function getDatabase() {
  if (!mongoose.connection.db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return mongoose.connection.db;
}

// Default export for backwards compatibility
export default connectDB;
