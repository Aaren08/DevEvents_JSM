import mongoose from "mongoose";

// Define the MongoDB connection string type
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Define types for the cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global object to include mongoose cache
// This prevents TypeScript errors when accessing global.mongoose
declare global {
  var mongoose: MongooseCache | undefined;
}

// Initialize cache on the global object to persist across hot reloads
// In development, Next.js hot reload can cause multiple connections
// Caching prevents "Cannot overwrite model" and connection limit errors
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes and returns a cached MongoDB connection using Mongoose
 *
 * @returns {Promise<typeof mongoose>} The Mongoose instance with active connection
 *
 * Connection Strategy:
 * - Returns existing connection if available (cached.conn)
 * - Returns in-flight connection promise if connecting (cached.promise)
 * - Creates new connection if none exists
 *
 * The cache persists across module reloads in development mode,
 * preventing connection pool exhaustion and duplicate model errors
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is in progress, wait for it to complete
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering to fail fast on connection issues
    };

    // Create new connection promise and cache it
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for connection to establish and cache the result
    cached.conn = await cached.promise;
  } catch (e) {
    // Clear the promise cache on error so next call can retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
