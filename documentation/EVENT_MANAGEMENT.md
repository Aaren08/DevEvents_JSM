# Event Management System Documentation

## Overview

A comprehensive, production-ready event management system built with Next.js 15, TypeScript, and MongoDB. This system allows authenticated users to view, edit, and delete their own created events with a beautiful table interface, pagination, and real-time booking counts.

## Features

### ✅ Core Functionality

- **User-specific Event Display**: Shows only events created by the logged-in user (filtered by `creatorId`)
- **Pagination**: Navigate through events with Previous/Next buttons and page indicators
- **Real-time Booking Counts**: Displays the number of bookings for each event
- **Event Editing**: Full-featured edit dialog with image upload capability
- **Event Deletion**: Confirmation dialog before deleting events
- **Responsive Design**: Table is scrollable on mobile devices
- **Toast Notifications**: Success/error feedback with custom styling

### 🔒 Security Features

- **Server-side Authentication**: All data fetching uses `requireAuth()` helper
- **Ownership Verification**: Users can only edit/delete their own events
- **CSRF Protection**: Built into Next.js server actions
- **Input Validation**: Form validation on both client and server
- **Type Safety**: Full TypeScript coverage with no `any` types

## Architecture

### File Structure

```
├── app/
│   ├── events/
│   │   └── page.tsx                    # Main events management page
│   ├── api/
│   │   └── events/
│   │       └── route.ts                # API routes (GET, POST, PUT, DELETE)
│   └── styles/
│       └── globals.css                 # Component styling
├── components/
│   ├── ManageEvent.tsx                 # Main table component
│   ├── EditEvent.tsx                   # Edit dialog component
│   ├── DeleteEvent.tsx                 # Delete confirmation dialog
│   └── ui/                             # Shadcn UI components
├── lib/
│   ├── actions/
│   │   ├── event.actions.ts            # Server actions for events
│   │   └── booking.actions.ts          # Server actions for bookings
│   └── auth-helpers.ts                 # Authentication utilities
└── database/
    └── event.model.ts                  # Event MongoDB schema
```

## Components

### 1. ManageEvent Component (`components/ManageEvent.tsx`)

**Purpose**: Main table component that displays user's events with pagination and management actions.

**Props**:

```typescript
interface ManageEventProps {
  initialEvents: IEvent[]; // Array of user's events
  totalPages: number; // Total number of pages
  currentPage: number; // Current page number
}
```

**Key Features**:

- Fetches booking counts for all events on mount
- Handles edit/delete dialog state management
- Formats dates and times for display
- Implements pagination navigation
- Shows loading state and empty state

**State Management**:

- `events`: Array of events with booking counts
- `loading`: Loading state for booking counts
- `editDialogOpen`: Controls edit dialog visibility
- `deleteDialogOpen`: Controls delete dialog visibility
- `selectedEvent`: Currently selected event for editing
- `eventToDelete`: Event queued for deletion

### 2. EditEvent Component (`components/EditEvent.tsx`)

**Purpose**: Dialog component for editing event details with image upload.

**Props**:

```typescript
interface EditEventProps {
  event: IEvent; // Event to edit
  isOpen: boolean; // Dialog visibility
  onClose: () => void; // Close handler
  onSuccess: () => void; // Success callback
}
```

**Key Features**:

- Pre-populated form with existing event data
- Image preview with upload functionality
- Image size validation (max 5MB)
- Converts textarea inputs to arrays (agenda, tags)
- Integrates with PUT `/api/events` endpoint
- White background success toast

**Form Fields**:

- Event Image (with preview)
- Title, Description, Overview
- Venue, Location
- Event Date & Time
- Mode (Online/Offline/Hybrid)
- Audience, Organizer
- Agenda (line-separated)
- Tags (comma-separated)

### 3. DeleteEvent Component (`components/DeleteEvent.tsx`)

**Purpose**: Alert dialog for confirming event deletion.

**Props**:

```typescript
interface DeleteEventProps {
  eventId: string; // Event ID to delete
  eventTitle: string; // Event title for display
  isOpen: boolean; // Dialog visibility
  onClose: () => void; // Close handler
  onSuccess: () => void; // Success callback
}
```

**Key Features**:

- Displays event title in confirmation message
- Integrates with DELETE `/api/events` endpoint
- Red background success toast
- Disabled state during deletion
- Error handling with toast notifications

## Server Actions

### Event Actions (`lib/actions/event.actions.ts`)

#### `getUserCreatedEvents(page, limit)`

Fetches paginated events for the authenticated user.

**Parameters**:

- `page`: Page number (1-indexed)
- `limit`: Events per page (default: 10)

**Returns**:

```typescript
interface PaginatedEventsResponse {
  events: IEvent[];
  totalEvents: number;
  totalPages: number;
  currentPage: number;
}
```

**Security**:

- Verifies user authentication via `requireAuth()`
- Filters events by `creatorId` from session
- Returns `null` if user is not authenticated

#### `getUserEvent(eventId)`

Fetches a single event with ownership verification.

**Parameters**:

- `eventId`: MongoDB ObjectId as string

**Returns**: `IEvent | null`

**Security**:

- Verifies both authentication and ownership

### Booking Actions (`lib/actions/booking.actions.ts`)

#### `getBookingCount(eventId)`

Gets the number of bookings for a specific event.

**Parameters**:

- `eventId`: MongoDB ObjectId as string

**Returns**: `Promise<number>`

**Note**: Returns 0 on error (fail-safe behavior)

## API Routes

### PUT `/api/events`

**Purpose**: Update an existing event.

**Authentication**: Required via `requireAuth()`

**Body**: FormData with fields:

- `id`: Event ID (required)
- `title`, `description`, `overview`, etc.
- `image`: File (optional - if not provided, keeps existing)
- `agenda`: JSON string array
- `tags`: JSON string array

**Security**:

- Verifies ownership via `creatorId` match
- Atomic update with `findOneAndUpdate`
- Deletes old Cloudinary image after successful update

**Response**:

```typescript
{
  message: "Event Updated Successfully",
  updatedEvent: IEvent
}
```

### DELETE `/api/events`

**Purpose**: Delete an event.

**Authentication**: Required via `requireAuth()`

**Body**: JSON with `id` field

**Security**:

- Atomic delete with `findOneAndDelete`
- Verifies ownership via `creatorId` match
- Returns specific error messages (404 vs 403)
- Cleans up Cloudinary image

**Response**:

```typescript
{
  message: "Event Deleted Successfully",
  deletedEvent: IEvent
}
```

## Styling

All styles are defined in `app/styles/globals.css` using Tailwind's `@apply` directive.

### Key CSS Classes

#### Table Styles

- `.event-management-container`: Main wrapper
- `.event-table`: Table element with min-width for scrolling
- `.event-table thead`: Header with background
- `.event-table th`: Column headers
- `.event-table tbody tr`: Row with hover effect
- `.event-table td`: Table cells

#### Event Cell Styles

- `.event-cell`: Flexbox container for image + title
- `.event-image-wrapper`: Image container
- `.event-image`: Rounded image styling
- `.event-title`: Event title with line-clamp

#### Action Styles

- `.manage-actions`: Container for edit/delete buttons
- `.edit-link`: Primary color link
- `.delete-link`: Destructive color link

#### Pagination Styles

- `.pagination-container`: Flex container with border
- `.pagination-info`: Page indicator text
- `.pagination-btn`: Button with min-width

## Type Safety

### No `any` Types

All components use proper TypeScript interfaces:

```typescript
// Event interface from database model
interface IEvent extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  // ... all fields typed
}

// Extended interface for booking counts
interface EventWithBookings extends IEvent {
  bookingCount: number;
}
```

### Form Event Types

```typescript
FormEvent<HTMLFormElement>;
ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
```

## User Flow

### 1. Viewing Events

1. User navigates to `/events`
2. Server fetches user's events via `getUserCreatedEvents()`
3. If not authenticated, redirects to `/`
4. Events are displayed in table with booking counts
5. Pagination allows navigation through pages

### 2. Editing an Event

1. User clicks "Edit" on an event row
2. `EditEvent` dialog opens with pre-filled data
3. User modifies fields and/or uploads new image
4. Form submits to PUT `/api/events`
5. On success, shows white toast and reloads page
6. Updated event appears in table

### 3. Deleting an Event

1. User clicks "Delete" on an event row
2. `DeleteEvent` confirmation dialog opens
3. User clicks "Confirm"
4. DELETE request sent to `/api/events`
5. On success, shows red toast and reloads page
6. Event removed from table

## Error Handling

### Client-Side

- Form validation prevents empty submissions
- Image size validation (max 5MB)
- Loading states prevent duplicate submissions
- Toast notifications for all errors

### Server-Side

- Try-catch blocks in all server actions
- Specific error messages (401, 403, 404, 500)
- Graceful fallbacks (booking count returns 0)
- Database connection error handling

## Performance Optimizations

1. **Pagination**: Limits data fetched per request
2. **Lean Queries**: MongoDB `.lean()` for faster reads
3. **Parallel Fetching**: `Promise.all` for booking counts
4. **Image Optimization**: Next.js Image component
5. **Minimal Re-renders**: State updates only when needed

## Accessibility

- Semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- ARIA labels in dialog components
- Keyboard navigation support
- Focus management in modals
- Disabled states for loading

## Mobile Responsiveness

- Table container has `overflow-x-auto`
- Table has `min-width: 900px`
- Users can swipe/scroll horizontally on mobile
- Maintains desktop layout for better data visibility
- Pagination buttons stack on smaller screens

## Testing Recommendations

### Unit Tests

- Test date/time formatting functions
- Test form validation logic
- Test image size validation

### Integration Tests

- Test edit form submission
- Test delete confirmation flow
- Test pagination navigation

### E2E Tests

- Test complete user flow from login to event management
- Test ownership restrictions (can't edit others' events)
- Test error states and recovery

## Deployment Checklist

- [ ] Cloudinary API keys configured
- [ ] MongoDB connection string set
- [ ] Better Auth configured properly
- [ ] Environment variables secured
- [ ] CORS configured if needed
- [ ] Rate limiting implemented
- [ ] Image upload size limits enforced
- [ ] Database indexes on `creatorId`

## Troubleshooting

### Events Not Showing

- Verify user is authenticated
- Check `creatorId` matches in database
- Confirm events exist for user

### Image Upload Failing

- Check Cloudinary configuration
- Verify file size < 5MB
- Check file type is image/\*

### Pagination Not Working

- Verify query params are being passed
- Check totalPages calculation
- Confirm page number validation

## Future Enhancements

- [ ] Bulk delete functionality
- [ ] Search and filter events
- [ ] Export events to CSV
- [ ] Event duplication
- [ ] Draft event status
- [ ] Event analytics dashboard
- [ ] Real-time updates with WebSockets
- [ ] Optimistic UI updates

## Support

For issues or questions, please check:

1. Console errors (browser and server)
2. Network tab for API responses
3. Database connection status
4. Authentication state

---

**Built with**: Next.js 15, TypeScript, MongoDB, Tailwind CSS, Shadcn UI, Better Auth, Cloudinary
