# Database Connection Consolidation

## Problem

The PR introduced a duplicate MongoDB connection issue:

- **Existing**: `mongodb.ts` with Mongoose connection (ODM) for existing routes
- **New PR**: `db.ts` with native MongoClient for better-auth
- **Result**: Two separate connection pools competing for resources, causing performance degradation

## Root Cause

Better-auth requires a native MongoDB client, but creating a separate `MongoClient` instance duplicates the connection pool instead of reusing the existing Mongoose connection.

## Solution

Leverage Mongoose's underlying native MongoDB driver to provide a single, shared connection pool.

### Key Insight

Mongoose uses the native MongoDB driver internally. We can access it via:
```typescript
mongoose.connection.getClient() // Returns the native MongoClient
```

This allows both Mongoose (ODM) and better-auth (native driver) to share the same connection pool.

## Implementation

### File Structure

```
lib/
├── mongodb.ts (or db.ts)  ← Unified connection manager (KEEP & UPDATE)
└── auth.ts                ← Better-auth configuration (UPDATE)
```

### 1. Unified Connection Manager (`lib/mongodb.ts` or `lib/db.ts`)

**Purpose**: Single source of truth for all database connections

**Features**:
- Mongoose connection with caching (`connectDB()`)
- Native client access via Mongoose (`getMongoClient()`)
- Direct database access (`getDatabase()`)
- Global caching to prevent hot-reload issues in development

**Key Functions**:

```typescript
// For Mongoose models (existing routes)
await connectDB()

// For better-auth (reuses Mongoose connection)
await getMongoClient()

// For direct MongoDB operations
getDatabase()
```

### 2. Updated Auth Configuration (`lib/auth.ts`)

**Change**: Import `getMongoClient()` instead of creating a new client

```typescript
import { getMongoClient } from "./mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(
    getMongoClient().then((client) => client.db())
  ),
  // ... rest of config
});
```

## Migration Steps

1. **Delete**: `db.ts` (the file from the PR with standalone MongoClient)
2. **Update**: Replace contents of `mongodb.ts` with the unified connection manager
3. **Update**: `auth.ts` to use `getMongoClient()` from `mongodb.ts`
4. **Verify**: All existing routes continue working (no code changes needed)

## Benefits

### Performance
- ✅ Single connection pool (default: 10 connections)
- ✅ No resource contention between Mongoose and native operations
- ✅ Reduced memory footprint

### Maintainability
- ✅ Single source of truth for database connections
- ✅ Consistent error handling and retry logic
- ✅ Backwards compatible with existing code

### Development Experience
- ✅ Prevents "Cannot overwrite model" errors
- ✅ Handles Next.js hot reloads gracefully
- ✅ No duplicate connections in development

## Technical Details

### Connection Sharing

```
┌─────────────────────────────────────────┐
│         Application Layer               │
├─────────────────┬───────────────────────┤
│  Mongoose ODM   │  Better-auth (Native) │
├─────────────────┴───────────────────────┤
│      mongoose.connection.getClient()    │
├─────────────────────────────────────────┤
│      Native MongoDB Driver (MongoClient)│
├─────────────────────────────────────────┤
│      Single Connection Pool (10 conns)  │
└─────────────────────────────────────────┘
```

### Caching Strategy

**Global Cache**: Persists across hot reloads in Next.js development

```typescript
global.mongoose = { conn: null, promise: null }
```

**Promise Caching**: Prevents race conditions during concurrent connections

```typescript
if (!cached.promise) {
  cached.promise = mongoose.connect(uri)
}
```

## Usage Examples

### Existing Mongoose Routes (No Changes)

```typescript
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const users = await User.find();
  return Response.json(users);
}
```

### Direct MongoDB Operations

```typescript
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  const db = getDatabase();
  const analytics = await db.collection("analytics").find().toArray();
  return Response.json(analytics);
}
```

### Better-auth (Automatically Configured)

```typescript
// lib/auth.ts - already configured
export const auth = betterAuth({
  database: mongodbAdapter(
    getMongoClient().then((client) => client.db())
  ),
});
```

## Verification Checklist

- [ ] `db.ts` deleted
- [ ] `mongodb.ts` updated with unified connection manager
- [ ] `auth.ts` imports from `./mongodb`
- [ ] Existing routes work without modification
- [ ] Better-auth authentication flows work
- [ ] No console warnings about multiple connections
- [ ] Application performance improved

## Environment Variables

Required in `.env.local`:

```bash
MONGODB_URI=mongodb://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Troubleshooting

### "Cannot overwrite model" Error
- **Cause**: Multiple connection attempts in development
- **Solution**: Global caching handles this automatically

### "Too many connections" Error
- **Cause**: Previously, two separate connection pools
- **Solution**: Now using single shared pool

### Better-auth Connection Issues
- **Check**: Ensure `connectDB()` is called before `getMongoClient()`
- **Solution**: The implementation handles this automatically

## References

- [Mongoose Connection Docs](https://mongoosejs.com/docs/connections.html)
- [MongoDB Native Driver](https://mongodb.github.io/node-mongodb-native/)
- [Better-auth MongoDB Adapter](https://www.better-auth.com/docs/adapters/mongodb)
- [Next.js Database Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)

## Summary

This consolidation eliminates duplicate MongoDB connections by leveraging Mongoose's internal native driver, resulting in better performance, simpler code, and improved resource management. All existing code continues to work without modification.