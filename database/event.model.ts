import { Schema, model, models, Document } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  eventStartAt: Date; // Used for both date & time
  location: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    eventStartAt: {
      type: Date,
      required: [true, "Event start date and time are required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create unique index on slug for faster lookups
EventSchema.index({ slug: 1 });

/**
 * Pre-save hook to generate slug and normalize date/time
 * - Generates URL-friendly slug from title only when title changes
 * - Normalizes date to ISO format (YYYY-MM-DD)
 * - Ensures time is in 24-hour format (HH:MM)
 */
EventSchema.pre("save", function (next) {
  // Generate slug from title if title is modified or new document
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  // Normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified("date")) {
    const parsedDate = new Date(this.date);
    if (isNaN(parsedDate.getTime())) {
      return next(new Error("Invalid date format"));
    }
    // Store as ISO date string (YYYY-MM-DD)
    this.date = parsedDate.toISOString().split("T")[0];
  }

  // Normalize time to 24-hour format (HH:MM)
  if (this.isModified("time")) {
    // Match HH:MM format (24-hour)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(this.time)) {
      // Try to parse and convert to 24-hour format
      const timeMatch = this.time.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);

      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        const meridiem = timeMatch[3]?.toLowerCase();

        // Convert to 24-hour format if AM/PM is present
        if (meridiem === "pm" && hours !== 12) {
          hours += 12;
        } else if (meridiem === "am" && hours === 12) {
          hours = 0;
        }

        // Ensure hours is within valid range
        if (hours >= 0 && hours <= 23) {
          this.time = `${hours.toString().padStart(2, "0")}:${minutes}`;
        } else {
          return next(new Error("Invalid time format"));
        }
      } else {
        return next(new Error("Time must be in HH:MM format (24-hour)"));
      }
    }
  }

  next();
});

// Apply same logic for findOneAndUpdate and updateOne
EventSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate() as Partial<IEvent>;

  if (update?.title) {
    update.slug = generateSlug(update.title);
  }

  if (update?.eventStartAt && isNaN(new Date(update.eventStartAt).getTime())) {
    return next(new Error("Invalid event start date"));
  }

  this.setUpdate(update);
  next();
});

// Use existing model if available (prevents OverwriteModelError in dev)
const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;
