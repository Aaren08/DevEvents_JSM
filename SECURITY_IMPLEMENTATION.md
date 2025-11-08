# Security Implementation: Event Creator Tracking

## Overview

This document describes the secure implementation of storing event creator IDs in the database. The solution prevents authentication spoofing by reading the session **server-side** using better-auth's API helpers.

## Security Approach

### ❌ Insecure (Avoided)
- Passing `userId` as a hidden form field from the client
- Trusting client-submitted IDs
- Reading session only on the client side

### ✅ Secure (Implemented)
- Reading session **server-side** in API routes and server actions
- Using better-auth's `auth.api.getSession()` with server headers
- Preventing spoofing by never trusting client-submitted creator IDs

---

## Implementation Details

### 1. Database Model Update

**File:** `database/event.model.ts`

Added `creatorId` field to the Event schema:

```typescript
export interface IEvent extends Document {
  // ... other fields
  creatorId: string; // User ID of the event creator
  createdAt: Date;
  updatedAt: Date;
}

// In schema
creatorId: {
  type: String,
  required: [true, "Creator ID is required"],
  trim: true,
  index: true, // Index for faster queries by creator
}
```

### 2. Authentication Helper

**File:** `lib/auth-helpers.ts`

Created reusable helper functions for server-side session management:

```typescript
// Get current server session
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

// Require authentication (returns user or null)
export async function requireAuth(): Promise<SessionUser | null> {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return null;
  }
  
  return session.user as SessionUser;
}
```

### 3. API Route Protection

**File:** `app/api/events/route.ts`

#### POST (Create Event)
```typescript
export async function POST(req: NextRequest) {
  // Read session server-side
  const user = await requireAuth();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized. Please sign in to create an event." },
      { status: 401 }
    );
  }

  // Securely set creatorId from server session (cannot be spoofed)
  const creatorId = user.id;

  const createdEvent = await Event.create({
    ...event,
    creatorId: creatorId, // Set from server session, not from client
  });
}
```

#### DELETE (Delete Event)
```typescript
export async function DELETE(req: NextRequest) {
  const user = await requireAuth();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership before deletion
  const eventToDelete = await Event.findById(id);
  
  if (eventToDelete.creatorId !== user.id) {
    return NextResponse.json(
      { message: "Forbidden. You can only delete your own events." },
      { status: 403 }
    );
  }
}
```

#### PUT (Update Event)
```typescript
export async function PUT(req: NextRequest) {
  const user = await requireAuth();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership before update
  const existingEvent = await Event.findById(id);
  
  if (existingEvent.creatorId !== user.id) {
    return NextResponse.json(
      { message: "Forbidden. You can only update your own events." },
      { status: 403 }
    );
  }
}
```

### 4. Server Action Protection

**File:** `lib/actions/createEvent.ts`

```typescript
export async function createEventAction(
  prevState: CreateEventState | null,
  formData: FormData
): Promise<CreateEventState> {
  // Verify user is authenticated by reading server-side session
  const user = await requireAuth();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized. Please sign in to create an event.",
    };
  }

  // Create event with creatorId from server session
  await Event.create({
    // ... other fields
    creatorId: user.id, // Securely set from server session
  });
}
```

### 5. Page-Level Protection

**File:** `app/create-event/page.tsx`

```typescript
const Page = async () => {
  // Check if user is authenticated on server-side
  const user = await requireAuth();

  // Redirect to home if not authenticated
  if (!user) {
    redirect("/");
  }

  return <EventForm />;
};
```

---

## Security Benefits

### ✅ Prevents Spoofing
- User cannot submit a different `creatorId` in the form
- Session is always read server-side where client cannot manipulate it

### ✅ Authorization Enforcement
- Only event creators can update or delete their events
- 401 Unauthorized for non-authenticated users
- 403 Forbidden for users trying to modify others' events

### ✅ Type Safety
- TypeScript interfaces ensure type-safe user data
- `SessionUser` interface provides autocomplete and validation

### ✅ Reusability
- `requireAuth()` helper can be used in any server component, action, or route
- Consistent authentication pattern across the application

---

## HTTP Status Codes

- **200 OK** - Successful GET request
- **201 Created** - Event created successfully
- **400 Bad Request** - Missing required fields
- **401 Unauthorized** - User not authenticated
- **403 Forbidden** - User authenticated but not authorized (not the creator)
- **404 Not Found** - Event not found
- **500 Internal Server Error** - Unexpected server error

---

## Usage Examples

### Query Events by Creator

```typescript
// Get all events created by a specific user
const userEvents = await Event.find({ creatorId: userId });

// Get events created by current user
const user = await requireAuth();
if (user) {
  const myEvents = await Event.find({ creatorId: user.id });
}
```

### Check Ownership

```typescript
const event = await Event.findById(eventId);
const user = await requireAuth();

if (event.creatorId === user?.id) {
  // User owns this event
}
```

---

## Testing Checklist

- [ ] Unauthenticated users are redirected from `/create-event`
- [ ] Unauthenticated API calls return 401
- [ ] Events store correct `creatorId` matching the authenticated user
- [ ] Users cannot delete/update events they don't own (403)
- [ ] Hidden field manipulation doesn't affect `creatorId`
- [ ] Session changes reflect immediately in authorization checks

---

## Better-Auth Integration

This implementation uses better-auth's server-side session helpers:

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});
```

**Why this works:**
- `headers()` from Next.js provides server-side request headers
- better-auth reads the session cookie from headers
- Session cannot be manipulated by the client
- Works in server components, server actions, and API routes

---

## Migration Notes

If you have existing events without `creatorId`, you'll need to:

1. Add a migration script to set default `creatorId` values
2. Or make `creatorId` optional temporarily
3. Or delete old events and start fresh (if in development)

---

## Future Enhancements

- [ ] Add role-based access control (admin can edit any event)
- [ ] Add event collaboration (multiple creators)
- [ ] Add audit logging for event modifications
- [ ] Add event transfer functionality (change owner)
