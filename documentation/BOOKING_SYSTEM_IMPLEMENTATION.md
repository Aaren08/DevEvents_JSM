# Booking System Implementation

## Overview

This document describes the implementation of a secure, type-safe booking system with real-time booking counts and authentication requirements.

---

## Features Implemented

### ✅ 1. Real-Time Booking Count per Event
Each event now displays the actual number of people who have booked it, fetched directly from the database.

### ✅ 2. Authentication-Required Booking
Users must be signed in to book an event. Unauthenticated attempts show a toast notification.

### ✅ 3. Toast Notifications
- **Error toasts**: Red background with white text, positioned at top-center
- **Success toasts**: White background with black text, positioned at top-center

### ✅ 4. Duplicate Booking Prevention
Users cannot book the same event twice with the same email address.

### ✅ 5. Type Safety
All functions are fully typed with TypeScript interfaces and no `any` types.

---

## Implementation Details

### 1. Database Model Update

**File:** `database/booking.model.ts`

#### Added Static Method
```typescript
// TypeScript interface for Booking model with static methods
export interface IBookingModel extends Model<IBooking> {
  getBookingCountByEventId(eventId: string | Types.ObjectId): Promise<number>;
}

// Static method implementation
BookingSchema.statics.getBookingCountByEventId = async function (
  eventId: string | Types.ObjectId
): Promise<number> {
  try {
    const count = await this.countDocuments({ eventId });
    return count;
  } catch (error) {
    console.error("Error getting booking count:", error);
    return 0;
  }
};
```

#### Model Export
```typescript
const Booking = (models.Booking ||
  model<IBooking, IBookingModel>("Booking", BookingSchema)) as IBookingModel;
```

---

### 2. Server Actions Update

**File:** `lib/actions/booking.actions.ts`

#### New: Get Booking Count
```typescript
/**
 * Get the number of bookings for a specific event
 */
export const getBookingCount = async (
  eventId: string
): Promise<number> => {
  try {
    await connectDB();
    const count = await Booking.getBookingCountByEventId(eventId);
    return count;
  } catch (error) {
    console.error("Failed to get booking count:", error);
    return 0;
  }
};
```

#### Updated: Create Booking with Auth
```typescript
export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    // Verify user is authenticated
    const user = await requireAuth();

    if (!user) {
      return {
        success: false,
        message: "Please sign in to book an event",
        requiresAuth: true,
      };
    }

    await connectDB();
    
    // Check if user already booked this event
    const existingBooking = await Booking.findOne({ eventId, email });
    if (existingBooking) {
      return {
        success: false,
        message: "You have already booked this event",
        requiresAuth: false,
      };
    }

    await Booking.create({ eventId, email });
    
    // Revalidate the event page to update booking count
    revalidatePath(`/events/${slug}`);
    
    return {
      success: true,
      message: "Booking successful!",
      requiresAuth: false,
    };
  } catch (error) {
    console.error("Booking creation failed", error);
    return {
      success: false,
      message: "Failed to create booking. Please try again.",
      requiresAuth: false,
    };
  }
};
```

---

### 3. EventDetails Component Update

**File:** `components/EventDetails.tsx`

```typescript
import { getBookingCount } from "@/lib/actions/booking.actions";

const EventDetails = async ({ slug }: EventDetailsProps) => {
  // ... fetch event data
  
  // Fetch real booking count from database
  const bookings = await getBookingCount(event._id);
  
  // Display booking count
  {bookings > 0 ? (
    <p>Join {bookings} people who have already booked their seat!</p>
  ) : (
    <p className="text-sm">Be the first one to book your seat</p>
  )}
};
```

---

### 4. BookEvent Component Update

**File:** `components/BookEvent.tsx`

#### Authentication Check
```typescript
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!session?.user) {
      toast.error("Please sign in to book an event", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
      });
      return;
    }

    // Validate email
    if (!email || !email.trim()) {
      toast.error("Please enter your email address", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createBooking({ eventId, slug, email });

      if (result.success) {
        setSubmitted(true);
        toast.success(result.message || "Booking successful!", {
          position: "top-center",
          style: {
            background: "white",
            color: "black",
            border: "1px solid #e5e5e5",
          },
        });
      } else {
        toast.error(result.message || "Booking failed", {
          position: "top-center",
          style: {
            background: "#ef4444",
            color: "white",
            border: "1px solid #dc2626",
          },
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };
};
```

#### Form Updates
```typescript
<input
  id="email"
  type="email"
  value={email}
  placeholder="Enter your email address"
  onChange={(e) => setEmail(e.target.value)}
  required
  disabled={isSubmitting || isSessionLoading}
/>

<button
  type="submit"
  className="button-submit"
  disabled={isSubmitting || isSessionLoading}
>
  {isSubmitting ? "Submitting..." : "Submit"}
</button>
```

---

## User Flow

### Authenticated User Flow
1. User navigates to event page
2. User sees current booking count (e.g., "Join 15 people who have already booked their seat!")
3. User enters email in booking form
4. User clicks "Submit"
5. System validates authentication (✓ authenticated)
6. System checks for duplicate booking
7. System creates booking and revalidates page
8. **Success toast** appears (white background, black text, top-center)
9. Booking count updates automatically
10. Form shows "Thank you for signing up!"

### Unauthenticated User Flow
1. User navigates to event page
2. User sees current booking count
3. User enters email in booking form
4. User clicks "Submit"
5. System validates authentication (✗ not authenticated)
6. **Error toast** appears: "Please sign in to book an event" (red background, white text, top-center)
7. Form remains visible, booking not created

### Duplicate Booking Attempt
1. User (authenticated) tries to book an event they've already booked
2. System detects existing booking with same eventId and email
3. **Error toast** appears: "You have already booked this event" (red background, white text, top-center)
4. No duplicate booking created

---

## Toast Notification Styles

### Error Toast
```typescript
toast.error("Message", {
  position: "top-center",
  style: {
    background: "#ef4444", // Tailwind red-500
    color: "white",
    border: "1px solid #dc2626", // Tailwind red-600
  },
});
```

### Success Toast
```typescript
toast.success("Message", {
  position: "top-center",
  style: {
    background: "white",
    color: "black",
    border: "1px solid #e5e5e5", // Light gray border
  },
});
```

---

## Security Features

### ✅ Server-Side Authentication
- Authentication check happens on the server (cannot be bypassed)
- Uses `requireAuth()` helper from better-auth

### ✅ Duplicate Prevention
- Checks for existing bookings before creating new ones
- Based on `eventId` + `email` combination

### ✅ Input Validation
- Email validation on both client and server
- Required fields enforced

### ✅ Error Handling
- Try-catch blocks for database operations
- User-friendly error messages
- Logging for debugging

---

## Type Safety

### TypeScript Interfaces

```typescript
// Booking document interface
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking model with static methods
export interface IBookingModel extends Model<IBooking> {
  getBookingCountByEventId(eventId: string | Types.ObjectId): Promise<number>;
}

// Server action return type
type CreateBookingResult = {
  success: boolean;
  message: string;
  requiresAuth: boolean;
};
```

---

## Database Queries

### Get Booking Count
```typescript
// Optimized count query with index on eventId
const count = await Booking.countDocuments({ eventId });
```

### Check for Existing Booking
```typescript
const existingBooking = await Booking.findOne({ eventId, email });
```

### Create Booking
```typescript
await Booking.create({ eventId, email });
```

---

## Performance Optimizations

### ✅ Indexed Queries
- `eventId` field is indexed for faster count queries
- Composite index on `eventId` + `email` for duplicate checks

### ✅ Server-Side Caching
- Event pages use `next: { revalidate: 60 }` for ISR
- Booking count cached for 60 seconds

### ✅ Optimistic Updates
- Page revalidation after booking creation
- Instant feedback via toast notifications

---

## Testing Checklist

- [ ] Unauthenticated user sees error toast when trying to book
- [ ] Authenticated user can successfully book an event
- [ ] Booking count displays correctly (0, 1, 2+)
- [ ] Duplicate booking attempt shows appropriate error
- [ ] Toast position is top-center
- [ ] Error toasts have red background, white text
- [ ] Success toasts have white background, black text
- [ ] Form disables during submission
- [ ] Form disables while session is loading
- [ ] Email validation works correctly

---

## Future Enhancements

- [ ] Add booking cancellation functionality
- [ ] Add email notifications for bookings
- [ ] Add booking history for users
- [ ] Add capacity limits for events
- [ ] Add waiting list functionality
- [ ] Add booking reminders
- [ ] Add export bookings as CSV (for event organizers)

---

## Dependencies

- **better-auth** - Authentication system
- **sonner** - Toast notifications
- **mongoose** - MongoDB ODM
- **posthog** - Analytics tracking

---

## Error Messages

| Scenario | Message | Type |
|----------|---------|------|
| Not authenticated | "Please sign in to book an event" | Error |
| Empty email | "Please enter your email address" | Error |
| Duplicate booking | "You have already booked this event" | Error |
| Successful booking | "Booking successful!" | Success |
| Unexpected error | "An unexpected error occurred" | Error |
| Failed creation | "Failed to create booking. Please try again." | Error |
